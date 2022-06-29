import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import cors from 'cors'

dotenv.config();
const app = express();
app.use(cors())
app.use(express.json());
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server listening on port ${PORT}`));
