import jwt from "jsonwebtoken";
import { JWTSECRET, TOKEN_EXPIRY } from "../config/config.js";

const roles = ["standard"];
function jwtGenerator(id, name, email) {
  const payload = {
    user: {
      id,
      name,
      email,
      roles,
    },
  };

  console.log({ TOKEN_EXPIRY, JWTSECRET });
  return jwt.sign(payload, JWTSECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export default jwtGenerator;
