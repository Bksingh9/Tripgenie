import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plane, Menu, X, User, Bell, Bookmark, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/trip-planner", label: "Plan Trip" },
  { href: "/saved-trips", label: "Saved" },
  { href: "/my-bookings", label: "Bookings" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300">
            <Plane className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient hidden sm:block">TripGenie</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {location.pathname === link.href && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-primary/10 -z-10"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bookmark className="h-5 w-5" />
          </Button>
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/profile">
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">
                    {initials}
                  </span>
                  {user.name.split(" ")[0]}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden glass border-t border-border/30"
        >
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full mt-2 gap-2">
                    <User className="h-4 w-4" />
                    {user.name.split(" ")[0]}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full mt-2 gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
