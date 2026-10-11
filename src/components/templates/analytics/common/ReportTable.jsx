"use client";
import { ReportTableView } from "@dragorbit/features/analytics";

import styles from "./analyticsReport.module.scss";

const ReportTable = ({ columns, data }) => {
  return <ReportTableView model={{ styles, columns, data }} />;
};

export default ReportTable;
