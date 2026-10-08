// biome-ignore-all lint/security/noDangerouslySetInnerHtml: trusted generated theme bootstrap; serialized JSON escapes HTML brackets and persisted input only selects validated keys.
import { createThemeBootstrapScript } from "@dragorbit/core/themes";
export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: createThemeBootstrapScript() }}
    />
  );
}
