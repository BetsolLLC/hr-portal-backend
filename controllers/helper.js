import db from "../db.js";
import generator from "generate-password";
import { ROLES, SALT } from "../config/config.js";
import { logger } from "../logger.js";
import { mailer } from "../service/mailer.js";
import bcrypt from "bcrypt";
import moment from "moment";
import jwtGenerator from "../utils/jwtGenerator.js";

const addUserUtility = async (name, email, batch, phoneNumber) => {
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
        return { statusCode: 409, errorMsg: "user already exist" };
      }
    }

    // generating a random password
    const password = generator.generate({
      length: 10,
      numbers: true,
    });

    // only for development purpose this needs to removed later
    // console.log(password);

    // hashing password
    const salt = await bcrypt.genSalt(SALT);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // adding user to DB
    await db.query(
      "INSERT INTO users (name,email,batch,phone_number,password) VALUES ($1,$2,$3,$4,$5)",
      [name, email, batch, phoneNumber, bcryptPassword]
    );

    // using email as id in the token as id is not available
    const token = jwtGenerator(email, name, batch, email, ROLES.END_USER);
    logger.debug(`user(${email}) add successfully`);

    const isMailSent = await mailer(name, email, token, password);
    if (!isMailSent) {
      logger.debug(`error sending  creadential mail to user: ${email}`);

      try {
        await db.query("DELETE FROM users WHERE email = $1", [email]);
      } catch (err) {
        logger.debug(`error deleting user: ${email} from DB`);
        return { statusCode: 500, errorMsg: `error adding user` };
      }

      logger.debug(`deleted user${email} from DB`);
      return { statusCode: 500, errorMsg: `error adding user` };
    } else {
      logger.debug(
        `Credential mail sent to (${email}) successfully ${isMailSent}`
      );
    }

    return { statusCode: 201, successMsg: "user added" };
  } catch (err) {
    logger.error(`error adding user: ${err}`);
    return { statusCode: 500, errorMsg: "error adding user" };
  }
};

const getFileUploadPath = async (doc_id, user) => {
  const details = await db.query(
    "SELECT doc_name FROM all_docs where id = $1",
    [doc_id]
  );
  if (details.rowCount === 0) {
    return new Error("Invalid document"), null;
  }
  return (
    null, `${user.batch}/${user.id}_${user.email}/${details.rows[0].doc_name}`
  );
};

const getFileNameFromPath = (path) => {
  const pathArray = path.split("/");
  return pathArray[pathArray.length - 1] + ".pdf";
};

const isEmailValid = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

const isPhoneNumberValid = (phoneNumber) => {
  return phoneNumber.length === 10;
};

const isDateValid = (date) => {
  return moment(date, "MM/DD/YYYY", true).isValid();
};

export {
  getFileUploadPath,
  getFileNameFromPath,
  addUserUtility,
  isEmailValid,
  isPhoneNumberValid,
  isDateValid,
};
