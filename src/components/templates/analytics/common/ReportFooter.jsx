"use client";
import moment from "moment";
import { useTranslation } from "@/hooks/useTranslation";
import styles from "./analyticsReport.module.scss";

const ReportFooter = ({ reportType = "analytics" }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.footer}>
      <p>
        {t("common.automatedReportGenerated", { reportType })}
      </p>
      <p>
        {t("common.reportGeneratedOn")} {moment().format("DD/MM/YYYY HH:mm:ss")}
      </p>
    </div>
  );
};

export default ReportFooter;
