import jwt from "jsonwebtoken";
import { JWTSECRET } from "../config/config.js";

import { errorResponse } from "../interceptor/error.js";

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("jwt_token");

  // Check if not token
  if (!token) {
    return res.status(403).json({ msg: "authorization denied" });
  }

  // Verify token
  try {
    const verify = jwt.verify(token, JWTSECRET);

    req.user = verify.user;
    next();
  } catch (err) {
    return errorResponse(res, 409, "Invalid Token");
  }
};
