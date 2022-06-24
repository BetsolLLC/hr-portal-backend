import { successResponse } from "../interceptor/success.js";
import { errorResponse } from "../interceptor/error.js";
const validinfo = function (req, res, next) {
  const { email, name, password } = req.body;

  function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  }

  if (req.path === "/addusers") {
    console.log(!email.length);
    if (!validEmail(email)) {
      return errorResponse(res, 400, "Invalid email");
    }
  } else if (req.path === "/login") {
    if (!validEmail(email)) {
      return errorResponse(res, 400, "Invalid email");
    }
  }

  next();
};

export default validinfo;
