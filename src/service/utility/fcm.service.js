import API_CONFIG from "@/config/api.config";
import { fcmDebug, fcmDebugToken, fcmDebugWarn } from "@/firebase/fcmDebug";
import { getFcmDeviceInfo } from "@/firebase/deviceInfo";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import logger from "@/utils/logger";

class FcmService {
  async saveToken(token, options = {}) {
    const { device, browser } = getFcmDeviceInfo();
    const payload = {
      token,
      device: options.device ?? device,
      browser: options.browser ?? browser,
      deviceId: options.deviceId ?? "default",
    };
    fcmDebug("API save-token → POST", {
      url: API_CONFIG.UTILITY.FCM_SAVE_TOKEN,
      deviceId: payload.deviceId,
      device: payload.device,
      browser: payload.browser,
    });
    fcmDebugToken("API save-token token", token);
    try {
      const response = await authAxios.post(API_CONFIG.UTILITY.FCM_SAVE_TOKEN, payload);
      const result = handleApiSuccess(response, "FCM token saved");
      fcmDebug("API save-token ← response", {
        status: response?.status,
        success: result?.success,
      });
      return result;
    } catch (error) {
      fcmDebugWarn("API save-token ← error", {
        status: error?.response?.status,
        message: error?.response?.data?.message ?? error?.message,
      });
      logger.error("[FCM] API save-token failed", error);
      return handleApiErrorResponse(error, "fcm-save-token");
    }
  }

  async deleteToken(deviceId = "default") {
    fcmDebug("API delete-token → DELETE", {
      url: API_CONFIG.UTILITY.FCM_DELETE_TOKEN,
      deviceId,
    });
    try {
      const response = await authAxios.delete(API_CONFIG.UTILITY.FCM_DELETE_TOKEN, {
        params: { deviceId },
      });
      const result = handleApiSuccess(response, "FCM token removed");
      fcmDebug("API delete-token ← response", { status: response?.status, success: result?.success });
      return result;
    } catch (error) {
      fcmDebugWarn("API delete-token ← error", {
        status: error?.response?.status,
        message: error?.response?.data?.message ?? error?.message,
      });
      logger.error("[FCM] API delete-token failed", error);
      return handleApiErrorResponse(error, "fcm-delete-token");
    }
  }
}

export const fcmService = new FcmService();
export default fcmService;
