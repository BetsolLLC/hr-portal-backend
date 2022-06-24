import { createRequire } from "module";
const require = createRequire(import.meta.url);
import jwt from "jsonwebtoken";
require("dotenv").config();

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
  return jwt.sign(payload, process.env.JWTSECRET, {
    expiresIn: process.env.TOKEN_EXPIRY,
  });
}

export default jwtGenerator;
