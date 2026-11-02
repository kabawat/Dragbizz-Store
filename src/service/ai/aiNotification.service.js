import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";

class AiNotificationService extends BaseService {
  constructor() {
    super();
    this.notificationsEndpoint = API_CONFIG?.AI?.NOTIFICATIONS;
    this.notificationReadEndpoint = API_CONFIG?.AI?.NOTIFICATION_READ;
    this.timeout = 10_000;
  }

  _readUrl(notificationId) {
    return String(this.notificationReadEndpoint || "").replace(
      ":id",
      encodeURIComponent(notificationId)
    );
  }

  async listNotifications({ storeId, unreadOnly = false, limit = 50, skip = 0 }) {
    try {
      const response = await this.authAxios.get(this.notificationsEndpoint, {
        params: { storeId, unreadOnly, limit, skip },
        timeout: this.timeout,
      });
      return handleApiSuccess(response, "Notifications loaded");
    } catch (error) {
      return handleApiErrorResponse(error, "ai-notifications");
    }
  }

  async markAsRead({ notificationId, storeId }) {
    try {
      const response = await this.authAxios.patch(
        this._readUrl(notificationId),
        null,
        {
          params: { storeId },
          timeout: this.timeout,
        }
      );
      return handleApiSuccess(response, "Notification marked as read");
    } catch (error) {
      return handleApiErrorResponse(error, "ai-notification-read");
    }
  }
}

const aiNotificationService = new AiNotificationService();
export default aiNotificationService;
