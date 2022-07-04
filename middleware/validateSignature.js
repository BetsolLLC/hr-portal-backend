import crypto from "crypto";
import { logger } from "../logger.js";
import { UPLOAD_FILE_SECRET, UPLOAD_FILE_ALGORITHM } from "../config/config.js";
import { errorResponse } from "../interceptor/error.js";
import { isSignatureValid } from "../utils/time.js";

const validateSignatureMiddleware = () => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    source: "middleware.validateSignatureMiddleware",
  };

  return (req, res, next) => {
    // check if required headers are present
    const docname = req.header("x-hr-docname");
    const timestamp = req.header("x-hr-timestamp");
    const clientComputedSignature = req.header("x-hr-signature");
    if (!docname || !timestamp || !clientComputedSignature) {
      logger.debug(
        `missing required header(s) 'x-hr-docname' or 'x-hr-timestamp' or 'x-hr-signature'`
      );
      return errorResponse(res, 400, "invalid request");
    }

    const requestTime = new Date(timestamp);
    if (!isSignatureValid(requestTime)) {
      logger.debug(`timestamp(${requestTime}) is not valid'`);
      return errorResponse(res, 400, "invalid request");
    }

    // validating signature
    try {
      const input = `${docname}:${requestTime}`;
      logger.debug(`input to hmac: '${input}'`);

      const severComputedSignature = crypto
        .createHmac(UPLOAD_FILE_ALGORITHM, UPLOAD_FILE_SECRET)
        .update(input)
        .digest("hex");
      if (
        severComputedSignature.length != clientComputedSignature.length ||
        !crypto.timingSafeEqual(
          Buffer.from(clientComputedSignature),
          Buffer.from(severComputedSignature)
        )
      ) {
        logger.debug(
          `client computed and server computed signatures does not match`
        );
        return errorResponse(res, 403, "invalid signature");
      }

      next();
    } catch (err) {
      logger.error(`error validating signature: ${err}`);
      return errorResponse(res, 500, "error validating signature");
    }
  };
};

export { validateSignatureMiddleware };
