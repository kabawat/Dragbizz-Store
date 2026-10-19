import Image from "next/image";
import styles from "./BrandLogo.module.css";

export default function BrandLogo() {
  return (
    <div className={styles.logo}>
      <Image
        className={styles.light}
        src="/DragBizz-Logos/Dragbizz-black.svg"
        alt="DragBizz"
        width={156}
        height={40}
        priority
      />
      <Image
        className={styles.dark}
        src="/DragBizz-Logos/Dragbizz-white.svg"
        alt="DragBizz"
        width={156}
        height={40}
        priority
      />
    </div>
  );
}
