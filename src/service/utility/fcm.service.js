import API_CONFIG from "@/config/api.config";
import { fcmDebug, fcmDebugWarn } from "@/firebase/fcmDebug";
import { getFcmDeviceInfo } from "@/firebase/deviceInfo";
import { authAxios, unauthAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import logger from "@/utils/logger";

const FCM_DEVICE_ID_KEY = "dragbizz.fcm.deviceId";

function readStoredDeviceId() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(FCM_DEVICE_ID_KEY) || undefined;
}

function storeDeviceId(deviceId) {
  if (typeof window === "undefined" || !deviceId) return;
  window.localStorage.setItem(FCM_DEVICE_ID_KEY, deviceId);
}

export function getStoredFcmDeviceId() {
  return readStoredDeviceId();
}

class FcmService {
  async registerDevice(token, options = {}) {
    const { device, browser } = getFcmDeviceInfo();
    const payload = {
      token,
      device: options.device ?? device,
      browser: options.browser ?? browser,
      deviceId: options.deviceId ?? readStoredDeviceId(),
    };
    fcmDebug("API device → POST", {
      url: API_CONFIG.UTILITY.FCM_REGISTER_DEVICE,
      deviceId: payload.deviceId,
    });
    try {
      const response = await unauthAxios.post(API_CONFIG.UTILITY.FCM_REGISTER_DEVICE, payload);
      const result = handleApiSuccess(response, "FCM device registered");
      const deviceId = result?.data?.deviceId;
      if (deviceId) storeDeviceId(deviceId);
      return result;
    } catch (error) {
      fcmDebugWarn("API device ← error", {
        status: error?.response?.status,
        message: error?.response?.data?.message ?? error?.message,
      });
      logger.error("[FCM] API device register failed", error);
      return handleApiErrorResponse(error, "fcm-register-device");
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
