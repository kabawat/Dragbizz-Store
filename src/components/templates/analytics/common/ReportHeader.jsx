"use client";
import { ReportHeaderView } from "@dragorbit/features/analytics";

import moment from "moment";
import styles from "./analyticsReport.module.scss";

const ReportHeader = ({ title, selectedStore, lastSyncedAt }) => {
  return (
    <ReportHeaderView
      model={{ styles, selectedStore, title, moment, lastSyncedAt }}
    />
  );
};

export default ReportHeader;
