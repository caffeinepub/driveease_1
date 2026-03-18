import { Calendar, Home, User, Users } from "lucide-react";
import { useNavigate, usePath } from "../router";

const tabs = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Drivers", icon: Users, path: "/drivers" },
  { label: "Bookings", icon: Calendar, path: "/my-bookings" },
  { label: "Account", icon: User, path: "/login" },
];

export default function BottomNav() {
  const path = usePath();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      data-ocid="bottom_nav.panel"
    >
      {tabs.map(({ label, icon: Icon, path: tabPath }) => {
        const isActive =
          tabPath === "/" ? path === "/" : path.startsWith(tabPath);
        return (
          <button
            key={tabPath}
            type="button"
            onClick={() => navigate(tabPath)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            data-ocid={`bottom_nav.${label.toLowerCase()}.tab`}
            aria-label={label}
          >
            <Icon
              className={`w-5 h-5 transition-colors ${
                isActive ? "text-green-600" : "text-gray-400"
              }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                isActive ? "text-green-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-green-600 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
