import jwt from "jsonwebtoken";
import { JWTSECRET, TOKEN_EXPIRY } from "../config/config.js";

function jwtGenerator(id, name, email, role) {
  const payload = {
    user: {
      id,
      name,
      email,
      role,
    },
  };

  return jwt.sign(payload, JWTSECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export default jwtGenerator;
