import { Request, Response } from "express";
import fs from "fs";
import aiService from "./ai.service";

class AiController {
  async analyzeArtifact(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const result = await aiService.analyzeArtifact(
        req.file.path,
        req.file.originalname
      );

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        message: "AI analysis failed",
        error: error?.response?.data || error?.message || "Unknown error",
      });
    }
  }
}

export default new AiController();