"use client";
import {
  SettingsButton as SharedButton,
  SettingsDrawer as SharedDrawer,
  SettingsPanel as SharedPanel,
} from "@dragorbit/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { localeNames } from "@/i18n/config";
import { useAppSelector } from "@/store/hooks";

function useSettingsProps() {
  const translation = useTranslation();
  const theme = useTheme();
  const { isAuthenticated } = useAppSelector((state) => state.profile);
  return { ...translation, theme, localeNames, isAuthenticated };
}
export function SettingsButton(props) {
  const settings = useSettingsProps();
  return <SharedButton {...props} {...settings} />;
}
export function SettingsDrawer(props) {
  const settings = useSettingsProps();
  return <SharedDrawer {...props} {...settings} />;
}
export default function SettingsPanel(props) {
  const settings = useSettingsProps();
  return <SharedPanel {...props} {...settings} />;
}
