import { uploadAxios } from "@/service/config/axiosConfig";
import API_CONFIG from "@/config/api.config";

const utilityService = {
  /**
   * Uploads a profile picture to the utility service.
   * @param {File} file - The image file to upload.
   * @returns {Promise<Object>} - The upload result from the utility service.
   */
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
};

export default utilityService;
