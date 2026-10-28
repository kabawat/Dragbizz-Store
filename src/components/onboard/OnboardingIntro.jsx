import { Phone, Store } from "lucide-react";
import styles from "./Onboarding.module.css";

const content = {
  store: {
    title: (
      <>
        Make room for your first <span className={styles.gradient}>store</span>
      </>
    ),
    description:
      "Add your store’s details to start managing its products, sales and customers in one place.",
    items: [
      [
        Store,
        "Give your outlet a name",
        "Use a name customers recognise, such as Drag Stores – Main Branch.",
      ],
      [
        Phone,
        "Keep your store connected",
        "Choose your store category. GST, PAN and contact details are optional.",
      ],
    ],
  },
};

export default function OnboardingIntro({ variant = "store" }) {
  const { title, description, items } = content[variant] || content.store;
  return (
    <aside className={styles.guide}>
      <div key={variant} className={styles.introContent}>
        <h2>{title}</h2>
        <p className={styles.introDescription}>{description}</p>
        <ul className={styles.benefits}>
          {items.map(([Icon, heading, text]) => (
            <li key={heading}>
              <span className={styles.benefitIcon}>
                <Icon aria-hidden="true" size={20} />
              </span>
              <div>
                <h3>{heading}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
