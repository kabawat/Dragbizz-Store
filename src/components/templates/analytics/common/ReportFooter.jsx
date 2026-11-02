"use client";
import { ReportFooterView } from "@dragorbit/features/analytics";

import moment from "moment";
import { useTranslation } from "@/hooks/ui/useTranslation";
import styles from "./analyticsReport.module.scss";

const ReportFooter = ({ reportType = "analytics" }) => {
  const { t } = useTranslation();
  return <ReportFooterView model={{ styles, t, reportType, moment }} />;
};

export default ReportFooter;
