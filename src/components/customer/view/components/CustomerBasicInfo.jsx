"use client";
import { ViewComponentsCustomerBasicInfoPresentation } from "@dragorbit/features/customers";

import CustomerSourceBadge from "@/components/customer/CustomerSourceBadge";
import { useTranslation } from "@/hooks/ui/useTranslation";

const CustomerBasicInfo = ({ customerData }) => {
  const { t } = useTranslation();

  return (
    <ViewComponentsCustomerBasicInfoPresentation
      model={{ t, customerData, CustomerSourceBadge }}
    />
  );
};

export default CustomerBasicInfo;
