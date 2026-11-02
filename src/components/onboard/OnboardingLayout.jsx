import BrandLogo from "@/components/common/BrandLogo";
import { AnimatedBackground, AnimatedGridPattern } from "@/components/ui";
import styles from "./Onboarding.module.css";
import OnboardingIntro from "./OnboardingIntro";

export default function OnboardingLayout({ variant, children }) {
  return (
    <div className={styles.page}>
      <div className={styles.softBackground} aria-hidden="true">
        <AnimatedBackground variant="register" />
      </div>
      <AnimatedGridPattern opacity={8} blur={2} gridSize={80} />
      <div className={styles.layout}>
        <OnboardingIntro variant={variant} />
        <section className={styles.formCard}>
          <div className={styles.brand}>
            <BrandLogo />
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
