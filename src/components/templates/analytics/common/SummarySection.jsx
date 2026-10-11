"use client";
import { SummarySectionView } from "@dragorbit/features/analytics";

import styles from "./analyticsReport.module.scss";
import SummaryCard from "./SummaryCard";

const SummarySection = ({ cards }) => {
  return <SummarySectionView model={{ styles, cards, SummaryCard }} />;
};

export default SummarySection;
