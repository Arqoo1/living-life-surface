import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import momentRoutes from "./routes/moments.js";
import trackRoutes from "./routes/tracks.js";
import ruleRoutes from "./routes/rules.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/api/moments", momentRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("Backend running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
