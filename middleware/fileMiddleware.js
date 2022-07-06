import { FILE_SIZE } from "../config/config.js";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: FILE_SIZE } });

export { upload };
