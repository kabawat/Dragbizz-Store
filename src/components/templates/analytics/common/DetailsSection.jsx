"use client";
import { DetailsSectionView } from "@dragorbit/features/analytics";

import styles from "./analyticsReport.module.scss";
import ReportTable from "./ReportTable";

const DetailsSection = ({ title, columns, data, children }) => {
  return (
    <DetailsSectionView
      model={{ styles, title, children, columns, data, ReportTable }}
    />
  );
};

export default DetailsSection;
