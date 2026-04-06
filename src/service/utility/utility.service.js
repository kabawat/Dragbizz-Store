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

    // Direct PUT to storage provider
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type }
    });

    return {
      publicFileUrl,
      key,
      fileType: file.type,
      fileName: file.name,
      size: file.size
    };
  }
}

export const utilityService = new UtilityService();
export default utilityService;
