// These lines make "require" available
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const router = require("express").Router();
import login  from '../controllers/auth.js';
import adduser from '../controllers/auth.js'

// login-route
router.post('/login', login);

// adding the user-router 
router.post("/addusers", adduser);
export default router;