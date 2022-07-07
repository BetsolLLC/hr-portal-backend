import express from "express";
import { downloadFiles } from "../controllers/files.js";
import { authMiddleware } from "../middleware/auth.js";

const isAdminOnlyRoute = true;
const filesRouter = express.Router();

filesRouter.post("/get", authMiddleware(!isAdminOnlyRoute), downloadFiles);

export default filesRouter;
