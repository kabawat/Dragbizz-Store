"use client";
import { SummaryCardView } from "@dragorbit/features/analytics";

import styles from "./analyticsReport.module.scss";

const SummaryCard = ({ title, value, change, changeType }) => {
  const changeClassName =
    changeType === "up"
      ? styles.positive
      : changeType === "down" || changeType === "negative"
        ? styles.negative
        : "";

  return (
    <SummaryCardView
      model={{ styles, title, value, change, changeClassName }}
    />
  );
};

export default SummaryCard;
