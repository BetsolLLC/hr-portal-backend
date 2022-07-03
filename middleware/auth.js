import jwt from "jsonwebtoken";
import { logger } from "../logger.js";
import { JWTSECRET, ROLES } from "../config/config.js";
import { errorResponse } from "../interceptor/error.js";

const authMiddleware = (isAdmin) => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    source: "middleware.authMiddleware",
  };

  return (req, res, next) => {
    // check if not token
    const token = req.header("access_token");
    if (!token) {
      logger.debug(`token not present in the header 'access_token'`);
      return errorResponse(res, 403, "authorization denied");
    }

    try {
      // verify token
      const verify = jwt.verify(token, JWTSECRET);
      if (!verify || !verify.user) {
        logger.debug(`invalid token/payload`);
        return errorResponse(res, 403, "invalid token");
      }

      req.context = verify.user;

      // checking user role
      if (!verify.user.role || (isAdmin && verify.user.role !== ROLES.ADMIN)) {
        logger.debug(`insufficient permission`);
        return errorResponse(res, 403, "insufficient permission");
      }

      next();
    } catch (err) {
      logger.error(`error validating token`);
      return errorResponse(res, 500, "error validating token");
    }
  };
};

export { authMiddleware };
