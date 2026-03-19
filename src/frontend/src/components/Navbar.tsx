import { ChevronDown, Download, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "../router";
import { useInstallPrompt } from "./PWAInstallBanner";
import { Button } from "./ui/button";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { pathname } = useLocation();
  const { canInstall, triggerInstall } = useInstallPrompt();

  const stored = localStorage.getItem("otp_customer");
  const customer = stored ? JSON.parse(stored) : null;

  const mainLinks = [
    { to: "/", label: "Home" },
    { to: "/live-drivers", label: "🟢 Live Drivers" },
    { to: "/register-driver", label: "Drive With Us" },
  ];

  const servicesLinks = [
    { to: "/subscriptions?plan=hourly", label: "Hourly Plan" },
    { to: "/subscriptions?plan=daily", label: "Daily Plan" },
    { to: "/subscriptions?plan=weekend", label: "Weekend Plan" },
    { to: "/subscriptions", label: "All Plans" },
    { to: "/insurance", label: "Insurance" },
    { to: "/payment", label: "Pay" },
    { to: "/driver-nav", label: "Driver Navigation" },
  ];

  return (
    <header className="bg-gray-950 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-green-400 font-bold text-2xl tracking-tight">
            Drive<span className="text-white">Ease</span>
          </span>
          <span className="hidden sm:inline text-xs text-gray-400 border border-gray-700 rounded px-1.5 py-0.5">
            Personal Driver Network
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === l.to
                  ? "text-green-400 bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              data-ocid="navbar.link"
            >
              {l.label}
            </Link>
          ))}

          {/* Services Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setServicesOpen(!servicesOpen)}
              onBlur={() => setTimeout(() => setServicesOpen(false), 150)}
              className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors text-gray-300 hover:text-white hover:bg-gray-800"
              data-ocid="navbar.services.toggle"
            >
              Services{" "}
              <ChevronDown
                size={14}
                className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {servicesOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl min-w-[180px] z-50"
                data-ocid="navbar.services.dropdown_menu"
              >
                {servicesLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                    data-ocid="navbar.link"
                  >
                    {l.label}
                  </Link>
                ))}
                {customer?.loggedIn && (
                  <>
                    <Link
                      to="/my-bookings"
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                      data-ocid="navbar.link"
                    >
                      My History
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-b-lg"
                      data-ocid="navbar.link"
                    >
                      My Profile
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* My Bookings — visible when customer is logged in */}
          {customer?.loggedIn && (
            <Link
              to="/my-bookings"
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === "/my-bookings"
                  ? "text-green-400 bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              data-ocid="navbar.link"
            >
              My Bookings
            </Link>
          )}

          <Link
            to="/driver-login"
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              pathname === "/driver-login"
                ? "text-green-400 bg-gray-800"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            data-ocid="navbar.link"
          >
            Driver Login
          </Link>

          {customer?.loggedIn ? (
            <div className="flex items-center gap-1">
              <Link
                to="/profile"
                className="px-3 py-2 rounded text-sm font-medium text-green-300 hover:text-white hover:bg-gray-800"
                data-ocid="navbar.link"
              >
                Hi, {customer.name.split(" ")[0]}
              </Link>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("otp_customer");
                  window.location.reload();
                }}
                className="px-2 py-1 rounded text-xs font-semibold text-red-400 hover:text-white hover:bg-red-900/60 border border-red-800/50 transition-colors"
                data-ocid="navbar.close_button"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                pathname === "/login"
                  ? "text-green-400 bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              data-ocid="navbar.link"
            >
              Login
            </Link>
          )}

          {/* Install App button — shown when browser supports PWA install */}
          {canInstall && (
            <button
              type="button"
              onClick={() => triggerInstall()}
              className="flex items-center gap-1.5 ml-1 px-3 py-2 rounded text-sm font-semibold text-green-300 border border-green-700 hover:bg-green-700 hover:text-white transition-all"
              data-ocid="navbar.install_app.button"
            >
              <Download size={14} />
              Install App
            </button>
          )}

          <Button
            asChild
            className="ml-3 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
            data-ocid="navbar.primary_button"
          >
            <Link to="/drivers">Book a Driver</Link>
          </Button>
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <div className="md:hidden bg-gray-900 px-4 pb-4">
          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2 text-gray-300 hover:text-green-400"
              data-ocid="navbar.link"
            >
              {l.label}
            </Link>
          ))}
          {/* My Bookings in mobile nav for logged-in customers */}
          {customer?.loggedIn && (
            <Link
              to="/my-bookings"
              onClick={() => setOpen(false)}
              className="block py-2 text-green-300 hover:text-green-400 font-medium"
              data-ocid="navbar.link"
            >
              My Bookings
            </Link>
          )}
          <div className="py-1 border-t border-gray-700 mt-1">
            <p className="text-xs text-gray-500 py-1 uppercase tracking-wider">
              Services
            </p>
            {servicesLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block py-2 text-gray-300 hover:text-green-400 pl-2"
                data-ocid="navbar.link"
              >
                {l.label}
              </Link>
            ))}
            {customer?.loggedIn && (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-gray-300 hover:text-green-400 pl-2"
                  data-ocid="navbar.link"
                >
                  My History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-gray-300 hover:text-green-400 pl-2"
                  data-ocid="navbar.link"
                >
                  My Profile
                </Link>
              </>
            )}
          </div>
          <Link
            to="/driver-login"
            onClick={() => setOpen(false)}
            className="block py-2 text-gray-300 hover:text-green-400"
            data-ocid="navbar.link"
          >
            Driver Login
          </Link>
          {customer?.loggedIn ? (
            <div className="py-2 border-t border-gray-700 mt-1">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block py-1 text-green-300 font-medium hover:text-green-200"
                data-ocid="navbar.link"
              >
                Hi, {customer.name.split(" ")[0]} — My Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("otp_customer");
                  window.location.reload();
                }}
                className="block w-full text-left py-2 text-red-400 hover:text-red-300 font-medium"
                data-ocid="navbar.mobile.close_button"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block py-2 text-gray-300 hover:text-green-400"
              data-ocid="navbar.mobile.link"
            >
              Login
            </Link>
          )}
          {/* Mobile Install App button */}
          {canInstall && (
            <button
              type="button"
              onClick={() => {
                triggerInstall();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full mt-2 py-2 text-green-300 hover:text-green-400"
              data-ocid="navbar.mobile.install_app.button"
            >
              <Download size={16} />
              Install DriveEase App
            </button>
          )}
          <Link
            to="/drivers"
            onClick={() => setOpen(false)}
            className="block mt-3 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center"
            data-ocid="navbar.mobile.primary_button"
          >
            Book a Driver
          </Link>
        </div>
      )}
    </header>
  );
}
