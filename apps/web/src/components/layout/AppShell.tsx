import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { InstallBanner } from "./InstallBanner";

const HIDE_NAV_PREFIXES = ["/decks/", "/auth"];

export function AppShell() {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV_PREFIXES.some(
    (prefix) => pathname.startsWith(prefix) && pathname !== "/decks"
  );

  return (
    <div className="flex flex-col min-h-svh max-w-lg mx-auto">
      <main className={hideNav ? "flex-1" : "flex-1 pb-20"}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
      {!hideNav && <InstallBanner />}
    </div>
  );
}
