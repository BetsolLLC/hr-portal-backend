import express from "express";
import cors from "cors";
import { PORT } from "./config/config.js";
import authRoutes from "./routes/auth.js";
import { inits3 } from "./service/s3.js";
import multer from "multer";
import { errorResponse } from "./interceptor/error.js";

inits3();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, 400, "file size exceeded");
    }
  }
});

app.listen(PORT, console.log(`Server listening on port ${PORT}`));
