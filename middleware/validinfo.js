import { errorResponse } from "../interceptor/error.js";

const validEmail = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

const validinfo = function (req, res, next) {
  const { email, password } = req.body;

  if (req.path === "/addusers" || req.path === "/login") {
    if (!validEmail(email)) {
      return errorResponse(res, 400, "invalid email");
    }
  }

  next();
};

export default validinfo;
