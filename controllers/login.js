import pool from "../db.js";
import bcrypt from "bcrypt";
import jwtGenerator from "../utils/jwtGenerator.js";

const login = async (req, res) => {
  const { email, password: userpassword } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(409).json("Invalid Credential");
    }

    const validPassword = await bcrypt.compare(
      userpassword,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(409).json("Invalid Credential");
    }
    const jwtToken = jwtGenerator(user.rows.id);
    const { password, ...user1 } = user.rows[0];
    return res.json({ jwtToken, ...user1 });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

export default login;
