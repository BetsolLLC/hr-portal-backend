import pool from "../db.js";
import bcrypt from "bcrypt";
import generator from "generate-password";
import jwtGenerator from "../utils/jwtGenerator.js";
import { successResponse } from "../interceptor/success.js";
import { errorResponse } from "../interceptor/error.js";
import aws from "aws-sdk";
const SALT = 10;
aws.config.update({
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});

const BUCKET = process.env.BUCKET;
const s3 = new aws.S3();
//adding the new user
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

    //only for development purpose this needs to be removed later
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

    const user1 = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user_id = user1.rows[0].id;

    var folder_name = batch;

    var child_folder = name;

    var imgData = `${folder_name}/${user_id}_${child_folder}/`;

    var params = {
      Bucket: process.env.BUCKET,

      Body: "", //here you can  give image data url from your local directory

      Key: imgData,

      ACL: "public-read",
    };

    //in this section we are creating the folder structre

    s3.upload(params, async function (err, aws_uploaded_url) {
      //handle error

      if (err) {
        console.log("Error", err);
      }

      //success
      else {
        console.log("Data Uploaded in:", aws_uploaded_url.Location);
      }
    });

    return successResponse(res, 201, "user added");
  } catch (err) {
    return errorResponse(res, 500, "server error");
  }
};
// module.exports = router;

//login and generating the jwt token
const login = async (req, res) => {
  const { email, password: userpassword } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    //checking the user exist
    if (user.rows.length === 0) {
      return errorResponse(res, 400, "Invalid Credential");
    }

    //validing the password
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

//Updating the password
const updatepassword = async (req, res) => {
  const { email, oldpassword, newpassword } = req.body;
  //checking the user exist
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return errorResponse(res, 400, "Invalid Credential");
    }

    //comparing the password which is in the database
    const validPassword = await bcrypt.compare(
      oldpassword,
      user.rows[0].password
    );

    if (!validPassword) {
      return errorResponse(res, 400, "Invalid Credential");
    }

    //encrption of the password
    const salt = await bcrypt.genSalt(SALT);
    const bcryptPassword = await bcrypt.hash(newpassword, salt);

    const newUser = await pool.query(
      "update users set password=$1 where email=$2",
      [bcryptPassword, email]
    );

    return successResponse(res, 200, "password updated");
  } catch (err) {
    return errorResponse(res, 500, "server error");
  }
};

export { updatepassword, login };

export default adduser;
