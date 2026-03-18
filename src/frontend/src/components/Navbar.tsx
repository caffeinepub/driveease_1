import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "../router";
import { Button } from "./ui/button";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const stored = localStorage.getItem("otp_customer");
  const customer = stored ? JSON.parse(stored) : null;

  const links = [
    { to: "/", label: "Home" },
    { to: "/drivers", label: "Find Drivers" },
    { to: "/subscriptions", label: "Plans" },
    { to: "/insurance", label: "Insurance" },
    { to: "/payment", label: "Pay" },
    { to: "/register-driver", label: "Drive With Us" },
    { to: "/my-bookings", label: "My Bookings" },
    { to: "/driver-nav", label: "Driver Nav" },
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
          {links.map((l) => (
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
          {customer?.loggedIn ? (
            <Link
              to="/login"
              className="px-3 py-2 rounded text-sm font-medium text-green-300 hover:text-white hover:bg-gray-800"
              data-ocid="navbar.link"
            >
              Hi, {customer.name.split(" ")[0]}
            </Link>
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
          {links.map((l) => (
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
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block py-2 text-gray-300 hover:text-green-400"
            data-ocid="navbar.mobile.link"
          >
            {customer?.loggedIn
              ? `Hi, ${customer.name.split(" ")[0]}`
              : "Login"}
          </Link>
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
