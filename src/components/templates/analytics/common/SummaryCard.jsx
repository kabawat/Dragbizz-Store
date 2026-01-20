"use client";
import React from 'react';
import styles from './analyticsReport.module.scss';

const SummaryCard = ({ title, value, change, changeType }) => {
  const changeClassName = changeType === 'up' ? styles.positive : changeType === 'down' || changeType === 'negative' ? styles.negative : '';
  
  return (
    <div className={styles.summaryCard}>
      <h3>{title}</h3>
      <div className={styles.value}>{value}</div>
      {change && (
        <div className={`${styles.change} ${changeClassName}`}>
          {change}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;

