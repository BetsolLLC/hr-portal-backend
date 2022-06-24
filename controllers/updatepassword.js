import pool from "../db.js";
import bcrypt from "bcrypt";
const updatepassword = async (req, res) => {
  const { email, oldpassword, newpassword } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows[0].length === 0) {
      return res.status(409).json("Invalid user");
    }

    const validPassword = await bcrypt.compare(
      oldpassword,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(409).json("Invalid Password");
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(newpassword, salt);

    const newUser = await pool.query(
      "update users set password=$1 where email=$2",
      [bcryptPassword, email]
    );

    res.json("successful");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

export default updatepassword;
