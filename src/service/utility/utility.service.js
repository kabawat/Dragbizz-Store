// src/service/utility/utility.service.js
import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import axios from "axios";

class UtilityService {
  constructor() {
    this.storageEndpoint = API_CONFIG?.UTILITY?.UPLOAD_URL;
  }

  async uploadFile(file, folder = "general") {
    const response = await authAxios.post(this.storageEndpoint, {
      fileName: file.name,
      fileType: file.type,
      folder,
      expiresIn: 900
    });

    const { success, data, message } = response.data;
    if (!success) throw new Error(message || "Failed to get upload URL");

    const { uploadUrl, publicFileUrl, key } = data;

    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type }
    });

    return { publicFileUrl, key };
  }

  async deleteFile(fileUrl) {
    if (!fileUrl) return;
    try {
      const urlParts = fileUrl.split("/");
      const key = urlParts.slice(3).join("/");

      return await authAxios.delete(API_CONFIG.UTILITY.DELETE_URL, {
        params: { key: key || fileUrl }
      });
    } catch (error) {
      console.error("Delete from storage failed:", error);
    }
  }
}

export const utilityService = new UtilityService();
export default utilityService;
