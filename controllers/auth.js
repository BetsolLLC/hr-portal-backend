import db from "../db.js";
import bcrypt from "bcrypt";
import generator from "generate-password";
import jwtGenerator from "../utils/jwtGenerator.js";
import { logger } from "../logger.js";
import { ROLES, SALT } from "../config/config.js";
import { successResponse } from "../interceptor/success.js";
import { errorResponse } from "../interceptor/error.js";

const adduser = async (req, res) => {
  logger.defaultMeta = { ...logger.defaultMeta, source: "controller.adduser" };
  try {
    //checking the user already exist
    let { name, email, batch, number } = req.body;

    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length > 0) {
      logger.debug(`user with email(${email}) is exists`);
      return errorResponse(res, 409, "user already exist");
    }

    //generating a random password
    var password = generator.generate({
      length: 10,
      numbers: true,
    });

    //only for development purpose this needs to removed later
    // console.log(password);
    //encrption of the password

    const salt = await bcrypt.genSalt(SALT);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // adding new user
    if (name === "" || name === null) {
      name = email;
    }
    const newUser = await db.query(
      "INSERT INTO users (name,email,batch,phone_number,password) VALUES ($1,$2,$3,$4,$5)",
      [name, email, batch, number, bcryptPassword]
    );

    logger.debug(`user(${email}) add successfully`);
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
      users.rows[0].email,
      ROLES.END_USER
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

    const newUser = await db.query(
      "update users set password=$1 where email=$2",
      [bcryptPassword, email]
    );

    logger.debug(`updated user(${email}) credentials successfully`);
    return successResponse(res, 200, "password updated");
  } catch (err) {
    logger.error(`error updating user credentials: ${err}`);
    return errorResponse(res, 500, "server error");
  }
};

export { updatepassword, login };

export default adduser;
