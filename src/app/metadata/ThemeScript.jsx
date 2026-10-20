// biome-ignore-all lint/security/noDangerouslySetInnerHtml: trusted generated theme bootstrap; serialized JSON escapes HTML brackets and persisted input only selects validated keys.

import { createThemeBootstrapScript } from "@dragorbit/core/themes";
import Script from "next/script";
export default function ThemeScript() {
  return (
    <Script
      id="dragbizz-theme-bootstrap"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: createThemeBootstrapScript() }}
    />
  );
}
