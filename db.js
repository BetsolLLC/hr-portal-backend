// These lines make "require" available
import { createRequire } from "module";
const require = createRequire(import.meta.url);
//connecting to the database using Pool
const Pool = require ("pg").Pool;
const pool = new Pool({
    user : "postgres",
    password : "root",
    host:"localhost",
    port:5433,
    database:"userpool"
})

// module.exports = pool;
export default pool ;