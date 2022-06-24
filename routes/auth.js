// These lines make "require" available
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const router = require("express").Router();
import login  from '../controllers/login.js';
import adduser from '../controllers/auth.js'
import validinfo from '../middleware/validinfo.js';
import updatepassword from '../controllers/updatepassword.js'

// login-route
router.post('/login', validinfo,login);

// adding the user-router 
router.post("/addusers", validinfo,adduser);

router.post("/forgotpassword", updatepassword);
export default router;