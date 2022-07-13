import db from "../db.js";
import bcrypt from "bcrypt";
import generator from "generate-password";
import jwtGenerator from "../utils/jwtGenerator.js";
import { logger } from "../logger.js";
import { ROLES, SALT, AWS_BUCKET } from "../config/config.js";
import { successResponse } from "../interceptor/success.js";
import { errorResponse } from "../interceptor/error.js";
import { S3Uploadv2 } from "../service/s3.js";
import { getFileUploadPath } from "./helper.js";
import { mailer, mailerAdmin } from "../service/mailer.js";

const adduser = async (req, res) => {
  logger.defaultMeta = { ...logger.defaultMeta, source: "controller.adduser" };
  let { name, email, batch, number } = req.body;
  if (name === "" || name === null) {
    name = email;
  }

  try {
    // checking the user already exist
    {
      const user = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (user.rows.length > 0) {
        logger.debug(`user with email(${email}) is exists`);
        return errorResponse(res, 409, "user already exist");
      }
    }

    // generating a random password
    var password = generator.generate({
      length: 10,
      numbers: true,
    });

    // only for development purpose this needs to removed later
    //console.log(password);

    // hashing password
    const salt = await bcrypt.genSalt(SALT);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // adding user to DB
    const newUser = await db.query(
      "INSERT INTO users (name,email,batch,phone_number,password) VALUES ($1,$2,$3,$4,$5)",
      [name, email, batch, number, bcryptPassword]
    );
    //using email as id in the token as id is not awailable
    const token = jwtGenerator(email, name, batch, email, ROLES.END_USER);
    logger.debug(`user(${email}) add successfully`);
    const isMailSent = await mailer(name, email, token, password);
    if (!isMailSent) {
      logger.debug(`error sending  creadential mail to user: ${email}`);
      try {
        await db.query("DELETE FROM users WHERE email = $1", [email]);
      } catch (err) {
        logger.debug(`error deleting user: ${email} from DB`);
        return errorResponse(res, 500, `error adding user`);
      }

      logger.debug(`deleted user${email} from DB`);
      return errorResponse(res, 500, `error adding user`);
    } else {
      logger.debug(
        `Credential mail sent to (${email}) successfully ${isMailSent}`
      );
    }
    return successResponse(res, 201, "user added");
  } catch (err) {
    logger.error(`error adding user: ${err}`);
    return errorResponse(res, 500, "error adding user");
  }
};

const login = async (req, res) => {
  logger.defaultMeta = { ...logger.defaultMeta, source: "controller.login" };
  const { email, password: userpassword } = req.body;

  try {
    const users = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (users.rows.length === 0) {
      logger.debug(`user with email(${email}) not found in db`);
      return errorResponse(res, 400, "invalid credential");
    }

    const validPassword = await bcrypt.compare(
      userpassword,
      users.rows[0].password
    );

    if (!validPassword) {
      logger.debug(`invalid credintials for user(${email})`);
      return errorResponse(res, 400, "invalid credential");
    }

    const jwtToken = jwtGenerator(
      users.rows[0].id,
      users.rows[0].name,
      users.rows[0].batch,
      users.rows[0].email,
      users.rows[0].is_admin ? ROLES.ADMIN : ROLES.END_USER
    );
    const { password, ...user } = users.rows[0];

    return successResponse(res, 200, { jwtToken, ...user });
  } catch (err) {
    logger.error(`error validating user credentials: ${err}`);
    return errorResponse(res, 500, "server error");
  }
};

const updatepassword = async (req, res) => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    source: "controller.updatepassword",
  };
  const { oldpassword, newpassword } = req.body;
  const { email } = req.context;

  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      logger.debug(`user with email(${email}) not found in db`);
      return errorResponse(res, 400, "invalid credential");
    }

    const validPassword = await bcrypt.compare(
      oldpassword,
      user.rows[0].password
    );

    if (!validPassword) {
      logger.debug(`invalid credintials for user(${email})`);
      return errorResponse(res, 400, "invalid credential");
    }

    const salt = await bcrypt.genSalt(SALT);
    const bcryptPassword = await bcrypt.hash(newpassword, salt);

    await db.query("update users set password=$1 where email=$2", [
      bcryptPassword,
      email,
    ]);

    logger.debug(`updated user(${email}) credentials successfully`);
    return successResponse(res, 200, "password updated");
  } catch (err) {
    logger.error(`error updating user credentials: ${err}`);
    return errorResponse(res, 500, "server error");
  }
};

const docname = async (req, res) => {
  let ID = req.context.id;
  try {
    const doc = await db.query(
      "select * from all_docs where all_docs.doc_type_id = 1"
    );
    const uploadedfile = await db.query(
      "select all_docs_id, doc_ref from users join uploaded_docs on users.id = uploaded_docs.user_id where users.id = $1 ",
      [ID]
    );
    let n = [];
    let map = {};
    for (let i = 0; i < doc.rowCount; i++) {
      map = {
        id: doc.rows[i].id,
        docname: doc.rows[i].doc_name,
        uploaded: false,
        doc_ref: null,
      };
      n.push(map);
    }
    for (let i = 0; i < n.length; i++) {
      for (let j = 0; j < uploadedfile.rowCount; j++) {
        if (n[i].id === uploadedfile.rows[j].all_docs_id) {
          (n[i].uploaded = true), (n[i].doc_ref = uploadedfile.rows[j].doc_ref);
        }
      }
    }
    successResponse(res, 200, n);
  } catch (err) {
    logger.error(`error getting document name: ${err}`);
    return errorResponse(res, 500, "server error");
  }
};

//uploading the file

const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const user_id = req.context.id;
    const doc_id = req.query.id;
    const doc_type_details = await db.query(
      "select doc_type_id from all_docs where id=$1",
      [doc_id]
    );
    if (
      doc_type_details.rowCount === 0 ||
      !doc_type_details.rows[0].doc_type_id
    ) {
      logger.debug(`error in doc_type for doc_id ${doc_id}`);
      return errorResponse(res, 400, "invalid document");
    }
    const doc_type_id = doc_type_details.rows[0].doc_type_id;
    let error,
      key = await getFileUploadPath(doc_id, req.context);
    if (error) {
      logger.error(`Error document is invalid ${error}`);
      return errorResponse(res, 400, "Invalid document");
    }
    const result = await S3Uploadv2(file, key);
    let check = await db.query(
      "select * from uploaded_docs where all_docs_id = $1 and user_id = $2",
      [doc_id, user_id]
    );
    if (check.rowCount === 0) {
      let upload_doc = await db.query(
        "INSERT INTO uploaded_docs VALUES ($1,$2,$3) ",
        [user_id, doc_id, key]
      );
    }
    let adminEmail = [];
    let admin = await db.query("select email from users where is_admin=true");
    //storing admin email in a array for sending email
    for (let i = 0; i < admin.rowCount; i++) {
      adminEmail.push(admin.rows[i].email);
    }
    //check if user has uploaded all the documents - pre on boarding
    let uploaded_docs = await db.query(
      "select ud.all_docs_id,ad.doc_name from uploaded_docs ud, all_docs ad where ud.all_docs_id= ad.id and doc_type_id=$2 and ud.user_id=$1",
      [user_id, doc_type_id]
    );
    let totalDocsToBeUploaded = await db.query(
      "select total from doc_type where id=$1",
      [doc_type_id]
    );
    if (uploaded_docs.rowCount === totalDocsToBeUploaded.rows[0].total) {
      if (doc_type_id === 1) {
        try {
          await db.query(
            "UPDATE users SET uploaded_pre_on_board_docs= $1 WHERE id=$2",
            [true, user_id]
          );
        } catch (err) {
          logger.error(`error in update the value ${err}`);
          errorResponse(res, 400, "error in updating the value");
        }
      } else if (doc_type_id === 2) {
        //check if user has uploaded all the documents - on boarding
        try {
          await db.query(
            "UPDATE users SET uploaded_on_board_docs=$1 WHERE id=$2",
            [true, user_id]
          );
        } catch (err) {
          logger.error(`error in update the value ${err}`);
          errorResponse(res, 400, "error in updating the value");
        }
      }
      const name = req.context.name;
      const email = req.context.email;
      const isMailSent = await mailerAdmin(name, email, adminEmail);
      if (!isMailSent) {
        logger.debug(`error sending mail to ADMIN: ${adminEmail}`);
      } else {
        logger.debug(
          `sussesfull updated the doc_type_id: ${doc_type_id} for user: ${user_id}`
        );
        logger.debug(
          ` mail sent to (${adminEmail}) successfully ${isMailSent}`
        );
      }
    }
    return successResponse(res, 200, "document uploaded successfully ");
  } catch (err) {
    logger.error(`error in uploading the file ${err}`);
    return errorResponse(res, 500, "error in uploading document");
  }
};

const userDetails = async (req, res) => {
  try {
    const userDetails = await db.query(
      "select id,name,email,phone_number from users where is_admin = $1",
      [false]
    );
    let details = [];
    let map = {};
    for (let i = 0; i < userDetails.rowCount; i++) {
      map = {
        id: userDetails.rows[i].id,
        Username: userDetails.rows[i].name,
        email: userDetails.rows[i].email,
        Phone_no: userDetails.rows[i].phone_number,
      };
      details.push(map);
    }
    for (let i = 0; i < details.length; i++) {
      let docs = [];
      let ID = details[i].id;
      const docDetails = await db.query(
        "select ud.all_docs_id,ad.doc_name from uploaded_docs ud, all_docs ad where ud.all_docs_id= ad.id and ud.user_id=$1",
        [ID]
      );
      for (let j = 0; j < docDetails.rowCount; j++) {
        var doc = {
          doc_id: docDetails.rows[j].all_docs_id,
          docname: docDetails.rows[j].doc_name,
        };
        docs.push(doc);
      }
      details[i].no_of_docs = docDetails.rowCount;
      details[i].document = docs;
    }
    return successResponse(res, 200, details);
  } catch (err) {
    logger.error(`error in getting user details ${err}`);
    return errorResponse(res, 500, "error in getting the details");
  }
};

export { adduser, updatepassword, login, docname, uploadFile, userDetails };
