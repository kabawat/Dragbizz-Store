"use client";
import { ViewComponentsAccountDetailsPresentation } from "@dragorbit/features/customers";

import moment from "moment";

const AccountDetails = ({ account }) => {
  if (!account) return null;

  return (
    <ViewComponentsAccountDetailsPresentation model={{ account, moment }} />
  );
};

export default AccountDetails;
