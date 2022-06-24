// These lines make "require" available
import { createRequire } from "module";
const require = createRequire(import.meta.url);
//connecting to the database using Pool
const Pool = require("pg").Pool;
require("dotenv").config();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// module.exports = pool;
export default pool;
