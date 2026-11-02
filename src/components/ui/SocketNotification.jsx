"use client";
import { ActivityNotification } from "@dragorbit/ui/app";
import { useRouter } from "next/navigation";
import { getNotificationConfig } from "@/utils/notification";
export default function SocketNotification({ data, onClose }) {
  const router = useRouter();
  const config = getNotificationConfig(data.type, data);
  return (
    <ActivityNotification
      resetKey={data}
      message={data.message}
      icon={config.icon}
      onClose={onClose}
      onClick={() => {
        if (config.url && config.url !== "#") router.push(config.url);
      }}
    />
  );
}
