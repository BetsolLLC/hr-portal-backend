import db from "../db.js";
import admzip from "adm-zip";
import { logger } from "../logger.js";
import { S3Download } from "../service/s3.js";
import { getFileNameFromPath } from "./helper.js";
import { errorResponse } from "../interceptor/error.js";
import { successResponse } from "../interceptor/success.js";
import { MAX_FILE_DOWNLOAD_COUNT, ROLES } from "../config/config.js";

// downloadFile function is not used
const downloadFile = async (req, res) => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    source: "controller.downloadFile",
  };

  const { id: userId, email } = req.context;
  const documentId = req.query.id;
  if (!userId || !documentId) {
    logger.debug(`missing document id(${documentId}) or user id(${userId})`);
    return errorResponse(res, 400, "missing required params");
  }

  try {
    // checking the document exist
    let document;
    {
      const documentRes = await db.query(
        "SELECT * FROM uploaded_docs WHERE user_id = $1 and all_docs_id = $2",
        [userId, documentId]
      );
      if (!documentRes || documentRes.rowCount == 0) {
        logger.debug(
          `document with id:${documentId} not uploaded for user(${email})`
        );
        return errorResponse(res, 400, "document not present to download");
      }

      document = documentRes.rows[0];
      if (!document || !document.doc_ref) {
        logger.error(
          `error getting document reference for user(${email}) and document(${document.doc_ref})`
        );
        return errorResponse(res, 500, "error getting document reference");
      }

      logger.debug(`got document reference(${document.doc_ref}) from DB`);
    }

    const fileStream = await S3Download(document.doc_ref);
    logger.debug(
      `got file stream from s3 for user(${email}) and document(${document.doc_ref})`
    );

    res.attachment(getFileNameFromPath(document.doc_ref));
    return res.status(200).send(fileStream.Body);
  } catch (err) {
    logger.error(`error downloading file(s): ${err}`);
    return errorResponse(res, 500, "error downloading file(s)");
  }
};

const downloadFiles = async (req, res) => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    source: "controller.downloadFiles",
  };

  let { id: userId, email, role } = req.context;
  let { documentIds } = req.body;

  if (role === ROLES.ADMIN) {
    if (!req.body.userId) {
      logger.debug(`missing user id(${req.body.userId}) and role is(${role})`);
      return errorResponse(res, 400, "missing required params");
    }
    userId = req.body.user;
  }

  if (!userId || !documentIds || !email) {
    logger.debug(
      `missing documentIds(${documentIds}) or user id(${userId}) or email(${email})`
    );
    return errorResponse(res, 400, "missing required params");
  }

  if (documentIds.length > MAX_FILE_DOWNLOAD_COUNT) {
    logger.debug(
      `got (${documentIds.length}) files to download, downloading first (${MAX_FILE_DOWNLOAD_COUNT}) valid files`
    );

    documentIds = documentIds.slice(0, MAX_FILE_DOWNLOAD_COUNT);
  }

  try {
    // checking the document exist
    let documents;
    {
      const documentRes = await db.query(
        "SELECT * FROM uploaded_docs WHERE user_id = $1 and all_docs_id = ANY($2::int[])",
        [userId, documentIds]
      );

      if (!documentRes || documentRes.rowCount == 0) {
        return successResponse(
          res,
          400,
          `not document to download for user(${email}) for the provided ids(${documentIds})`
        );
      }

      logger.debug(
        `got ${documentRes.rowCount} valid document(s) to download for user(${email}) from the provided ids(${documentIds})`
      );

      documents = documentRes.rows;
    }

    // completedS3ApiCallsCount is used to check if all the async calls were completed
    let completedS3ApiCallsCount = 0;

    // rejectedPromisesCount is used to check if how many promises were rejected
    let rejectedPromisesCount = 0;

    const zip = new admzip();
    documents.forEach((document) => {
      S3Download(document.doc_ref)
        .then((data) => {
          completedS3ApiCallsCount++;
          const fileName = getFileNameFromPath(document.doc_ref); // getting file name from path
          zip.addFile(fileName, Buffer.from(data.Body, "utf-8")); // adding downloaded file to zip

          logger.debug(`downloaded file: ${fileName}`);

          // if all the async calls are completed then send the response
          if (completedS3ApiCallsCount === documents.length) {
            res.attachment(`${email}.zip`);
            return res.status(200).send(zip.toBuffer());
          }
        })
        .catch((err) => {
          completedS3ApiCallsCount++;
          rejectedPromisesCount++;
          logger.error(`error downloading file(${document.doc_ref}): ${err}`);

          // if all the async calls are completed then send the response
          if (completedS3ApiCallsCount === documents.length) {
            res.attachment(`${email}.zip`);
            return res.status(200).send(zip.toBuffer());
          }

          // if all the promises are rejected then send error response
          if (rejectedPromisesCount === documents.length) {
            return errorResponse(
              res,
              500,
              "failed to download all the selected file(s)"
            );
          }
        });
    });
  } catch (err) {
    logger.error(`error downloading file(s): ${err}`);
    return errorResponse(res, 500, "error downloading file(s)");
  }
};

export { downloadFiles };
