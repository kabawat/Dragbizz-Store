"use client";
import styles from "./analyticsReport.module.scss";
import ReportTable from "./ReportTable";

const DetailsSection = ({ title, columns, data, children }) => {
  return (
    <div className={styles.details}>
      <h3>{title}</h3>
      {children ||
        (columns && data && <ReportTable columns={columns} data={data} />)}
    </div>
  );
};

export default DetailsSection;
