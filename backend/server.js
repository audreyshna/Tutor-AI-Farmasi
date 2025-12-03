import express from "express";
import cors from "cors";
import materialRoutes from "./routes/materialRoutes.js";
import sampleRoutes from "./routes/sampleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// === routes ===
app.use("/api/auth", authRoutes);
app.use("/materials", materialRoutes);
app.use("/samples", sampleRoutes);
app.use("/api/chat", chatbotRoutes);

app.get("/", (req, res) => {
  res.send("✅ Backend AI Metal Detector is running!");
});

// === start server ===
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
