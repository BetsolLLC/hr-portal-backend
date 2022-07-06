import jwt from "jsonwebtoken";
import { JWTSECRET, TOKEN_EXPIRY } from "../config/config.js";

function jwtGenerator(id, name, batch, email, role) {
  const payload = {
    user: {
      id,
      name,
      batch,
      email,
      role,
    },
  };

  return jwt.sign(payload, JWTSECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export default jwtGenerator;
