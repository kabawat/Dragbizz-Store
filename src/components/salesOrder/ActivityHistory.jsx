import React from "react";
import { Clock } from "lucide-react";
import moment from "moment";
import { useTranslation } from "@/hooks/useTranslation";

const ActivityHistory = ({ order }) => {
    const { t } = useTranslation();
    const history = order.shipping?.tracking?.history || [];

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.5)] p-5">
            <h4 className="text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-6">{t("salesOrder.activityHistory")}</h4>

            <div className="space-y-8 relative ml-2">
                {/* Vertical Timeline Line */}
                <div className="absolute left-0 top-1 bottom-1 w-[1.5px] bg-gradient-to-b from-[rgb(var(--color-primary))]/50 via-[rgb(var(--color-border-primary))] to-transparent"></div>

                {history.length > 0 ? (
                    history.slice().reverse().map((activity, idx) => (
                        <div key={idx} className="relative pl-7 group">
                            {/* Activity Dot */}
                            <div className={`absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full transition-all duration-300 ring-4 ring-[rgb(var(--color-bg-primary))] 
                ${idx === 0 ? 'bg-[rgb(var(--color-primary))] scale-125' : 'bg-[rgb(var(--color-border-primary))] group-hover:bg-[rgb(var(--color-text-tertiary))]'} 
              `}></div>

                            {/* Activity Content */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-start">
                                    <p className={`text-sm font-semibold ${idx === 0 ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-secondary))]'} transition-colors`}>
                                        {activity.status}
                                    </p>
                                    {activity.location && (
                                        <span className="text-[10px] bg-[rgb(var(--color-bg-secondary))] px-2 py-0.5 rounded text-[rgb(var(--color-text-tertiary))] font-bold uppercase tracking-wider border border-[rgb(var(--color-border-primary)/0.5)]">
                                            {activity.location}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-[rgb(var(--color-text-tertiary))] leading-relaxed font-medium">
                                    {activity.message}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Clock className="w-3 h-3 text-[rgb(var(--color-text-tertiary))] opacity-60" />
                                    <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-bold uppercase tracking-tight">
                                        {moment(activity.timestamp).format("MMM DD, YYYY • h:mm A")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="relative pl-7 group">
                        <div className="absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-primary))] ring-4 ring-[rgb(var(--color-bg-primary))]"></div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] transition-colors">Order Placed</p>
                            <p className="text-[11px] text-[rgb(var(--color-text-tertiary))] leading-relaxed font-medium">The order was created successfully.</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Clock className="w-3 h-3 text-[rgb(var(--color-text-tertiary))] opacity-60" />
                                <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-bold uppercase tracking-tight">
                                    {moment(order.createdAt).format("MMM DD, YYYY • h:mm A")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityHistory;
