"use client";
import { Checkbox as SharedCheckbox } from "@dragorbit/ui";
import { useTheme } from "@/contexts/ThemeContext";

export { CheckboxGroup } from "@dragorbit/ui";
export function Checkbox(props) {
  const { currentVariant, themeConfig } = useTheme();
  return (
    <SharedCheckbox
      {...props}
      currentVariant={currentVariant}
      themeConfig={themeConfig}
    />
  );
}
export default Checkbox;
