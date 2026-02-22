import { Suspense } from "react";
import Login from "@/page/login";

export const metadata = {
  title: "Login - DragBizz Store",
  description: "Sign in to your DragBizz Store account to continue shopping",
  keywords: "login, sign in, authentication, DragBizz Store",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <Login />
    </Suspense>
  );
}
