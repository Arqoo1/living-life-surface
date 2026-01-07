import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // Added for file paths
import { fileURLToPath } from "url"; // Added for ES Module directory support

import momentRoutes from "./routes/moments.js";
import trackRoutes from "./routes/tracks.js";
import ruleRoutes from "./routes/rules.js";
import authRoutes from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/moments", momentRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("Backend running"));
console.log("Serving static files from:", path.join(__dirname, "uploads"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
