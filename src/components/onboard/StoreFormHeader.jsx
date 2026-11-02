import styles from "./Onboarding.module.css";

export default function StoreFormHeader({ agency }) {
  const agencyName = agency?.agencyName || agency?.name;
  return (
    <header className={styles.formHeading}>
      <h1>Create your store</h1>
      {agencyName && <p>{agencyName}</p>}
    </header>
  );
}
