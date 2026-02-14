"use client";
import HeaderTitle from "./header/HeaderTitle";
import NotificationBell from "./header/NotificationBell";
import UserProfile from "./header/UserProfile";

const Header = ({ title, description }) => {
  return (
    <header className="bg-[rgb(var(--color-bg-primary))]/80 backdrop-blur-md border-b border-[rgb(var(--color-border-primary))]/50 px-4 py-2 shadow-sm relative z-[100]">
      <div className="flex items-center justify-between">
        {/* Left side - Page Title and Description */}
        <HeaderTitle title={title} description={description} />

        {/* Right side - User Actions */}
        <div className="flex items-center space-x-3">
          <NotificationBell />
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;
