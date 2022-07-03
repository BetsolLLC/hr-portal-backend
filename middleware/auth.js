import jwt from "jsonwebtoken";
import { JWTSECRET, ROLES } from "../config/config.js";
import { errorResponse } from "../interceptor/error.js";

const authMiddleware = (isAdmin) => {
  return (req, res, next) => {
    // check if not token
    const token = req.header("access_token");
    if (!token) {
      return errorResponse(res, 403, "authorization denied");
    }

    try {
      // verify token
      const verify = jwt.verify(token, JWTSECRET);
      if (!verify || !verify.user) {
        return errorResponse(res, 403, "invalid token");
      }

      req.context = verify.user;

      // checking user role
      if (!verify.user.role || (isAdmin && verify.user.role !== ROLES.ADMIN)) {
        return errorResponse(res, 403, "authorization denied");
      }

      next();
    } catch (err) {
      return errorResponse(res, 403, "invalid token");
    }
  };
};

export { authMiddleware };
