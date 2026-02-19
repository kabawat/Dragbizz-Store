import React from "react";
import { Clock, CheckCircle, XCircle, RefreshCw, Truck, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const OrderActions = ({ order, statusList, updatingStatus, onUpdateStatus }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-xl border border-[rgb(var(--color-primary)/0.1)] p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">{t("salesOrder.quickActions")}</h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("salesOrder.manageWorkflow")}</p>
                </div>
            </div>

            <div className="flex flex-row flex-wrap gap-3">
                {(order.status === statusList.PENDING || order.status === statusList.DRAFT) && (
                    <>
                        <Button
                            variant="primary"
                            className="flex-1 justify-center border-none shadow-md hover:shadow-lg transition-all"
                            leftIcon={CheckCircle}
                            loading={updatingStatus}
                            onClick={() => onUpdateStatus(statusList.CONFIRMED, { message: t("salesOrder.messages.orderConfirmed") })}
                        >
                            {t("salesOrder.confirm")}
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-1 justify-center shadow-md hover:shadow-lg transition-all"
                            leftIcon={XCircle}
                            loading={updatingStatus}
                            onClick={() => onUpdateStatus(statusList.CANCELLED, { message: t("salesOrder.messages.orderDeclined") })}
                        >
                            {t("salesOrder.decline")}
                        </Button>
                    </>
                )}

                {order.status === statusList.CONFIRMED && (
                    <Button
                        variant="primary"
                        className="flex-1 justify-center border-none shadow-md hover:shadow-lg transition-all"
                        leftIcon={RefreshCw}
                        loading={updatingStatus}
                        onClick={() => onUpdateStatus(statusList.PROCESSING, { message: t("salesOrder.messages.orderProcessing") })}
                    >
                        {t("salesOrder.markAsProcessing")}
                    </Button>
                )}

                {order.status === statusList.PROCESSING && (
                    <Button
                        variant="primary"
                        className="flex-1 justify-center border-none shadow-md hover:shadow-lg transition-all"
                        leftIcon={Truck}
                        loading={updatingStatus}
                        onClick={() => onUpdateStatus(statusList.SHIPPED, { message: t("salesOrder.messages.orderShipped") })}
                    >
                        {t("salesOrder.markAsShipped")}
                    </Button>
                )}

                {order.status === statusList.SHIPPED && (
                    <Button
                        variant="primary"
                        className="flex-1 justify-center border-none shadow-md hover:shadow-lg transition-all"
                        leftIcon={Truck}
                        loading={updatingStatus}
                        onClick={() => onUpdateStatus(statusList.IN_TRANSIT, { message: t("salesOrder.messages.orderInTransit") })}
                    >
                        {t("salesOrder.markAsInTransit")}
                    </Button>
                )}

                {order.status === statusList.IN_TRANSIT && (
                    <Button
                        variant="primary"
                        className="flex-1 justify-center border-none shadow-md hover:shadow-lg transition-all"
                        leftIcon={Truck}
                        loading={updatingStatus}
                        onClick={() => onUpdateStatus(statusList.OUT_FOR_DELIVERY, { message: t("salesOrder.messages.orderOutForDelivery") })}
                    >
                        {t("salesOrder.markAsOutForDelivery")}
                    </Button>
                )}

                {order.status === statusList.OUT_FOR_DELIVERY && (
                    <Button
                        variant="primary"
                        className="flex-1 justify-center border-none shadow-md hover:shadow-lg transition-all"
                        leftIcon={CheckSquare}
                        loading={updatingStatus}
                        onClick={() => onUpdateStatus(statusList.DELIVERED, { message: t("salesOrder.messages.orderDelivered") })}
                    >
                        {t("salesOrder.markAsDelivered")}
                    </Button>
                )}

                {/* Post-shipment Payment Action */}
                {[statusList.SHIPPED, statusList.IN_TRANSIT, statusList.OUT_FOR_DELIVERY, statusList.DELIVERED].includes(order.status) && (order.paymentStatus || order.payment?.status) !== 'PAID' && (
                    <Button
                        variant="success"
                        className="flex-1 justify-center shadow-md hover:shadow-lg transition-all border-none"
                        leftIcon={CheckCircle}
                        loading={updatingStatus}
                        onClick={() => onUpdateStatus(null, { paymentStatus: 'PAID', message: t("salesOrder.messages.paymentCollected") })}
                    >
                        {t("salesOrder.markAsPaid")}
                    </Button>
                )}

                {/* Secondary Actions */}
                {![statusList.PENDING, statusList.DRAFT, statusList.CANCELLED, statusList.DELIVERED, statusList.RETURNED, statusList.SHIPPED, statusList.IN_TRANSIT, statusList.OUT_FOR_DELIVERY].includes(order.status) && (
                    <Button
                        variant="outline"
                        className="flex-1 justify-center font-semibold bg-[rgb(var(--color-danger))]/5 border-[rgb(var(--color-danger))]/20 hover:bg-[rgb(var(--color-danger))] hover:text-white text-[rgb(var(--color-danger))] transition-all"
                        leftIcon={XCircle}
                        loading={updatingStatus}
                        onClick={() => onUpdateStatus(statusList.CANCELLED, { message: t("salesOrder.messages.orderCancelled") })}
                    >
                        {t("salesOrder.cancelOrder")}
                    </Button>
                )}

                {([statusList.CANCELLED, statusList.RETURNED].includes(order.status) ||
                    (order.status === statusList.DELIVERED && (order.paymentStatus || order.payment?.status) === 'PAID')) && (
                        <div className="w-full p-4 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg border border-dashed border-[rgb(var(--color-border-primary)/0.5)] text-center">
                            <p className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] italic">
                                {t("salesOrder.noFurtherActions", { status: order.status.toLowerCase() })}
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default OrderActions;
