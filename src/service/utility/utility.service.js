import { uploadAxios } from "@/service/config/axiosConfig";
import API_CONFIG from "@/config/api.config";

const utilityService = {
  // Upload profile photo
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadAxios.post(
        API_CONFIG.UTILITY.PROFILE_UPLOAD,
        formData
      );

      return response.data;
    } catch (error) {
      console.error("Utility Service: Profile upload failed", error);
      throw error;
    }
  },

  // Upload product/retailer images
  async uploadRetailerImage(file, data = {}) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await uploadAxios.post(
        API_CONFIG.UTILITY.RETAILER_UPLOAD,
        formData
      );

      return response.data;
    } catch (error) {
      console.error("Utility Service: Retailer upload failed", error);
      throw error;
    }
  },
};

export default utilityService;
