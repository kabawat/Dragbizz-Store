import { authAxios } from "@/service/config/axiosConfig";
import API_CONFIG from "@/config/api.config";

// Handles asynchronous file uploads via the job queue pattern.
const uploadService = {
    // Initialize a file upload
    async initUpload(file, folder = "general") {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", folder);

            const response = await authAxios.post(API_CONFIG.AUTH.UPLOAD_INIT, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        } catch (error) {
            console.error("Upload initialization failed:", error);
            throw error;
        }
    },

    // Get the status of an upload
    async getUploadStatus(uploadId) {
        try {
            const response = await authAxios.get(`${API_CONFIG.AUTH.UPLOAD_STATUS}/${uploadId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to get upload status:", error);
            throw error;
        }
    },

    // Poll for upload completion
    async pollUploadStatus(uploadId, maxAttempts = 30, interval = 2000) {
        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.getUploadStatus(uploadId);
            const { status, url } = response.data;

            if (status === "completed") {
                return response.data;
            }

            if (status === "failed") {
                throw new Error(response.data.error || "Upload failed");
            }

            // Wait before next poll
            await new Promise((resolve) => setTimeout(resolve, interval));
        }

        throw new Error("Upload timed out");
    },

    // Helper to upload a file and wait for the result
    async uploadFileAndWait(file, folder = "general") {
        const initResponse = await this.initUpload(file, folder);
        const { uploadId } = initResponse.data;
        return await this.pollUploadStatus(uploadId);
    }
};

export default uploadService;
