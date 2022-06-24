import { createRequire } from "module";
const require = createRequire(import.meta.url);
import jwt from 'jsonwebtoken';
require("dotenv").config();

function jwtGenerator(id) {
  const payload = {
    user: {
      id: id
    }
  };
  return jwt.sign(payload, process.env.jwtsecret, { expiresIn: "1h" });
}

export default jwtGenerator;