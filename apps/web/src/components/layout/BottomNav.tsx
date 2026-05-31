import { NavLink } from "react-router-dom";
import { BookOpen, BarChart2, Layers } from "lucide-react";
import { cn } from "@/lib/cn";

const tabs = [
  { to: "/decks", label: "Bộ Thẻ", icon: Layers },
  { to: "/stats", label: "Thống Kê", icon: BarChart2 },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border safe-area-pb">
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
