"use client";
import { AppHeader } from "@dragorbit/ui/header";
import { SettingsButton } from "@/components/ui";
import { useHeader } from "@/contexts/HeaderContext";
import HeaderTitle from "./HeaderTitle";
import NotificationBell from "./NotificationBell";
import UserProfile from "./UserProfile";

const Header = ({ title: t, description: d }) => {
  const { headerContent } = useHeader();

  const title = t || headerContent.title;
  const description = d || headerContent.description;

  return (
    <AppHeader
      titleContent={<HeaderTitle title={title} description={description} />}
      actions={
        <>
          <SettingsButton />
          <NotificationBell />
          <UserProfile />
        </>
      }
    />
  );
};

export default Header;
