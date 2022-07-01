import pool from "../db.js";
import bcrypt from "bcrypt";
import generator from "generate-password";
import jwtGenerator from "../utils/jwtGenerator.js";
import { successResponse } from "../interceptor/success.js";
import { errorResponse } from "../interceptor/error.js";
import { response } from "express";
const SALT = 10;
const adduser = async (req, res) => {
  try {
    //checking the user already exist
    let { name, email, batch, number } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length > 0) {
      return errorResponse(res, 409, "User already exist!");
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
    const newUser = await pool.query(
      "INSERT INTO users (name,email,batch,phone_number,password) VALUES ($1,$2,$3,$4,$5)",
      [name, email, batch, number, bcryptPassword]
    );

    return successResponse(res, 201, "user added");
  } catch (err) {
    return errorResponse(res, 500, "server error");
  }
};
// module.exports = router;

//used for login into the portal
const login = async (req, res) => {
  const { email, password: userpassword } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    //check if the user exist or not
    if (user.rows.length === 0) {
      return errorResponse(res, 400, "Invalid Credential");
    }

    //comparing the password
    const validPassword = await bcrypt.compare(
      userpassword,
      user.rows[0].password
    );

    if (!validPassword) {
      return errorResponse(res, 400, "Invalid Credential");
    }

    //generating the jwt token
    const jwtToken = jwtGenerator(
      user.rows[0].id,
      user.rows[0].name,
      user.rows[0].email
    );
    const { password, ...user1 } = user.rows[0];
    return successResponse(res, 200, { jwtToken, ...user1 });
  } catch (err) {
    return errorResponse(res, 500, "server error");
  }
};

//updatepassword
const updatepassword = async (req, res) => {
  const { email, oldpassword, newpassword } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    //check if the user exist or not
    if (user.rows.length === 0) {
      return errorResponse(res, 400, "Invalid Credential");
    }

    const validPassword = await bcrypt.compare(
      oldpassword,
      user.rows[0].password
    );

    //comparing the password
    if (!validPassword) {
      return errorResponse(res, 400, "Invalid Credential");
    }

    //update encrption of the password
    const salt = await bcrypt.genSalt(SALT);
    const bcryptPassword = await bcrypt.hash(newpassword, salt);
    //updating the password
    const newUser = await pool.query(
      "update users set password=$1 where email=$2",
      [bcryptPassword, email]
    );

    return successResponse(res, 200, "password updated");
  } catch (err) {
    return errorResponse(res, 500, "server error");
  }
};

//sending the documents name from backend to the frontend

const docname = async (req, res) => {
  try {
    const docname = await pool.query(
      "select id,doc_name from all_docs where doc_type_id=1;"
    );
    return successResponse(res, 200, docname.rows);
  } catch (err) {
    return errorResponse(res, 500, "server error");
  }
};
export { updatepassword, login, docname };

export default adduser;
