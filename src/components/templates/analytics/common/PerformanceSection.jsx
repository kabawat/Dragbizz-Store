"use client";
import { PerformanceSectionView } from "@dragorbit/features/analytics";

import styles from "./analyticsReport.module.scss";

const PerformanceSection = ({ title, cards }) => {
  return <PerformanceSectionView model={{ styles, title, cards }} />;
};

export default PerformanceSection;
