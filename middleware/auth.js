import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");
require("dotenv").config();
import { successResponse } from "../interceptor/success.js";
import { errorResponse } from "../interceptor/error.js";

//this middleware will on continue on if the token is inside the local storage

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("jwt_token");

  // Check if not token
  if (!token) {
    return res.status(403).json({ msg: "authorization denied" });
  }

  // Verify token
  try {
    const verify = jwt.verify(token, process.env.JWTSECRET);

    req.user = verify.user;
    next();
  } catch (err) {
    return errorResponse(res, 409, "Invalid Token");
  }
};
