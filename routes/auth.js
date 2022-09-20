import express from "express";
import {
  adduser,
  updatepassword,
  login,
  docname,
  uploadFile,
  userDetails,
  uploadSignedFile,
} from "../controllers/auth.js";
import { upload } from "../middleware/fileMiddleware.js";
import validinfo from "../middleware/validinfo.js";
import { authMiddleware } from "../middleware/auth.js";
import { validatePassword } from "../middleware/validatePassword.js";
import multer from "multer";

const isAdminOnlyRoute = true;
const authRouter = express.Router();

// login-route
authRouter.post("/login", validinfo, login);

// adding the user-route
authRouter.post(
  "/addusers",
  authMiddleware(isAdminOnlyRoute),
  validinfo,
  adduser
);

//adding the update password route
authRouter.post(
  "/forgotpassword",
  authMiddleware(!isAdminOnlyRoute),
  validatePassword,
  updatepassword
);

//adding the docname to frontend route
authRouter.get("/docname", authMiddleware(!isAdminOnlyRoute), docname);

//adding the upload routes
authRouter.post(
  "/upload",
  authMiddleware(!isAdminOnlyRoute),
  upload.single("file"),
  validinfo,
  uploadFile
);
//adding the upload signed document routes
authRouter.post(
  "/uploadSignedDocuments",
  authMiddleware(!isAdminOnlyRoute),
  upload.single("file"),
  validinfo,
  uploadSignedFile
);

//sending all users details to admin side
authRouter.get(
  "/getUserDetails",
  authMiddleware(isAdminOnlyRoute),
  userDetails
);
export default authRouter;
