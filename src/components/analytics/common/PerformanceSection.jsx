"use client";
import React from 'react';
import styles from './analyticsReport.module.scss';

const PerformanceSection = ({ title, cards }) => {
  return (
    <div className={styles.details}>
      <h3>{title}</h3>
      <div className={styles.performance}>
        {cards.map((card, index) => (
          <div key={index} className={styles.performanceCard}>
            <div className={styles.label}>{card.label}</div>
            <div className={styles.value}>{card.value}</div>
            {card.subValue && (
              <div className={styles.subValue}>{card.subValue}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceSection;

