import { errorResponse } from "../interceptor/error.js";
import { FILE_SIZE, BULK_USER_ADDITION_FILE_SIZE } from "../config/config.js";
const validEmail = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

const validinfo = function (req, res, next) {
  const { email, number } = req.body;

  if (req.path === "/addusers" || req.path === "/login") {
    if (!validEmail(email)) {
      return errorResponse(res, 400, "invalid email");
    }
  }

  if (req.path === "/upload") {
    if (!req.file || req.file.mimetype !== "application/pdf") {
      return errorResponse(res, 400, "File missing or invalid");
    }
    if (!req.file || req.file.size > FILE_SIZE) {
      return errorResponse(res, 400, "File size is greater than 1MB");
    }
  }

  if (req.path === "/bulk-user-addition") {
    if (!req.file || req.file.mimetype !== "text/csv") {
      console.log(req.file.mimetype);
      return errorResponse(res, 400, "File missing or invalid");
    }
    if (!req.file || req.file.size > BULK_USER_ADDITION_FILE_SIZE) {
      return errorResponse(res, 400, "File size too large");
    }
  }

  next();
};

export default validinfo;
