import { Check } from "lucide-react";
import styles from "./StoreProgressStepper.module.css";

const steps = ["Basic details", "Business details"];

export default function StoreProgressStepper({ currentStep }) {
  return (
    <ol aria-label="Store setup progress" className={styles.steps}>
      {steps.map((label, index) => {
        const step = index + 1;
        const completed = step < currentStep;
        const active = step === currentStep;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            data-state={
              completed ? "completed" : active ? "active" : "upcoming"
            }
            className={styles.step}
          >
            <span className={styles.marker} aria-hidden="true">
              {completed ? <Check size={16} strokeWidth={2.5} /> : step}
            </span>
            <span className={styles.label}>{label}</span>
            {completed && <span className="sr-only">Completed</span>}
          </li>
        );
      })}
    </ol>
  );
}
