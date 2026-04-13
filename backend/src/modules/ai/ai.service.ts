import axios from "axios";
import FormData from "form-data";
import fs from "fs";

class AiService {
  async analyzeArtifact(filePath: string, originalName: string) {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), originalName);

    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";
    const aiPublicBaseUrl =
      process.env.AI_PUBLIC_BASE_URL || "http://127.0.0.1:8001";

    const response = await axios.post(`${aiServiceUrl}/analyze-artifact`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const data = response.data;

    if (data?.restoration?.final_image_url) {
      data.restoration.final_image_url = data.restoration.final_image_url
        .replace("http://127.0.0.1:8001", aiPublicBaseUrl)
        .replace("http://localhost:8001", aiPublicBaseUrl);
    }

    return data;
  }
}

export default new AiService();