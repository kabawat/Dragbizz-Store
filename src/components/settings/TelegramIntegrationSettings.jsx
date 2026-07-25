"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { MessageCircle, Link2, Unlink, CheckCircle2, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import API_CONFIG from "@/config/api.config";
import { getToken } from "@/utils/auth"; // Assuming there's a token utility, otherwise interceptor handles it

const TelegramIntegrationSettings = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useGlobalToast();

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState(null);
  const [linkData, setLinkData] = useState(null);
  const [preferences, setPreferences] = useState({
    lowStock: false,
    dailySummary: false,
    paymentReceived: false,
    newOrder: false,
    poUpdates: false,
  });

  const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_CONFIG.TELEGRAM.STATUS, {
        headers: getAuthHeaders(),
      });
      if (res.data?.data) {
        setStatus(res.data.data);
        if (res.data.data.preferences) {
          setPreferences(res.data.data.preferences);
        }
      }
    } catch (error) {
      showError(t("errors.failedToFetch") || "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const res = await axios.post(API_CONFIG.TELEGRAM.LINK_TOKEN, {}, {
        headers: getAuthHeaders(),
      });
      if (res.data?.data) {
        setLinkData(res.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || t("errors.somethingWentWrong"));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect Telegram?")) return;
    try {
      setLoading(true);
      await axios.post(API_CONFIG.TELEGRAM.DISCONNECT, {}, {
        headers: getAuthHeaders(),
      });
      setStatus(null);
      setLinkData(null);
      showSuccess(t("settings.telegramDisconnected") || "Disconnected successfully");
      await fetchStatus();
    } catch (error) {
      showError(error.response?.data?.message || t("errors.somethingWentWrong"));
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    try {
      await axios.put(API_CONFIG.TELEGRAM.PREFERENCES, { preferences: newPrefs }, {
        headers: getAuthHeaders(),
      });
      showSuccess("Preferences updated");
    } catch (error) {
      showError("Failed to update preferences");
      // Revert
      setPreferences(preferences);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">
          {t("settings.telegramIntegration") || "Telegram Integration"}
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          Manage your DragBizz store directly from Telegram.
        </p>
      </div>

      <div className="bg-[rgb(var(--color-bg-primary))]/30 border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
        {!status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <div>
                <h4 className="font-medium text-[rgb(var(--color-text-primary))]">
                  {t("settings.telegramNotConnected") || "Not Connected"}
                </h4>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Connect your Telegram account to manage your store on the go.
                </p>
              </div>
            </div>

            {!linkData ? (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Link2 className="w-4 h-4" />
                <span>{connecting ? "Generating Link..." : t("settings.telegramConnect") || "Connect Telegram"}</span>
              </button>
            ) : (
              <div className="mt-6 p-4 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-secondary))] space-y-4">
                <p className="font-medium">Scan this QR code with your phone's camera or Telegram app:</p>
                <div className="bg-white p-4 inline-block rounded-lg">
                  <QRCodeSVG value={linkData.deepLink} size={200} />
                </div>
                <div>
                  <p className="text-sm mb-2">Or click the link below:</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={linkData.deepLink}
                      className="flex-1 p-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(linkData.deepLink);
                        showSuccess("Copied to clipboard");
                      }}
                      className="p-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg hover:bg-[rgb(var(--color-bg-secondary))]"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-orange-500">
                  This link expires in 10 minutes. Click 'Start' in the bot to complete linking.
                </p>
                <button
                  onClick={fetchStatus}
                  className="mt-4 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg text-sm"
                >
                  I have linked my account
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="font-medium text-[rgb(var(--color-text-primary))]">
                    {t("settings.telegramConnected") || "Connected"}
                  </h4>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Linked to User ID: {status.telegramUserId}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center space-x-2"
              >
                <Unlink className="w-4 h-4" />
                <span>{t("settings.telegramDisconnect") || "Disconnect"}</span>
              </button>
            </div>

            <div className="pt-6 border-t border-[rgb(var(--color-border-primary))]">
              <h4 className="font-medium mb-4">Notification Preferences</h4>
              <div className="space-y-4">
                {[
                  { key: "lowStock", label: t("settings.telegramLowStock") || "Low stock alerts" },
                  { key: "dailySummary", label: t("settings.telegramDailySummary") || "Daily sales summary" },
                  { key: "paymentReceived", label: t("settings.telegramPaymentReceived") || "Payment received" },
                  { key: "newOrder", label: t("settings.telegramNewOrder") || "New sales order" },
                  { key: "poUpdates", label: t("settings.telegramPoUpdates") || "Purchase order updates" },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between">
                    <span className="text-sm text-[rgb(var(--color-text-secondary))]">{pref.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={preferences[pref.key] || false}
                        onChange={(e) => handlePreferenceChange(pref.key, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-[rgb(var(--color-bg-secondary))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-primary))]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramIntegrationSettings;
