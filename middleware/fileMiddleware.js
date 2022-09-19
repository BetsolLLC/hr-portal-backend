import { FILE_SIZE, BULK_USER_ADDITION_FILE_SIZE } from "../config/config.js";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: FILE_SIZE } });
const bulkUserAdditionMiddleware = multer({
  storage,
  limits: { fileSize: BULK_USER_ADDITION_FILE_SIZE },
});

export { upload, bulkUserAdditionMiddleware };
