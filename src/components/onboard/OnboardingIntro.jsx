import { Building2, Globe, Package, Phone, Store, Tags } from "lucide-react";
import styles from "./Onboarding.module.css";

const content = {
  agency: {
    title: (
      <>
        Your business starts with{" "}
        <span className={styles.gradient}>DragBizz</span>
      </>
    ),
    description:
      "An agency is your main business or brand. Keep all your stores and business activity together, even if you’re starting with one outlet.",
    items: [
      [
        Building2,
        "One business identity",
        "Use your brand name, such as Drag Stores. You’ll name your individual stores next.",
      ],
      [
        Globe,
        "Your own workspace",
        "We suggest a workspace address from your agency name. You can edit it before continuing.",
      ],
    ],
  },
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
  business: {
    title: (
      <>
        Set up your store, <span className={styles.gradient}>your way</span>
      </>
    ),
    description:
      "Choose the category that best describes what you sell. This completes your store setup.",
    items: [
      [
        Tags,
        "Choose your business category",
        "Pick the closest match for your store from the available categories.",
      ],
      [
        Package,
        "Ready for your first products",
        "Once your store is created, you can add inventory and start making sales.",
      ],
    ],
  },
};

export default function OnboardingIntro({ variant = "agency" }) {
  const { title, description, items } = content[variant];
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
