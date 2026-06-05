"use client";
import styles from "./analyticsReport.module.scss";
import SummaryCard from "./SummaryCard";

const SummarySection = ({ cards }) => {
  return (
    <div className={styles.summary}>
      {cards.map((card, index) => (
        <SummaryCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          changeType={card.changeType}
        />
      ))}
    </div>
  );
};

export default SummarySection;
