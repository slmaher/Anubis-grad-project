import { Router } from "express";
import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import aiController from "./ai.controller";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads", "ai-scans");
fs.mkdirSync(uploadDir, { recursive: true });

const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `scan-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/analyze", upload.single("image"), (req, res) => {
  aiController.analyzeArtifact(req, res);
});

export { router as aiRouter };