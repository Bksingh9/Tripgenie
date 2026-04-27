import { Link } from "react-router-dom";
import { Plane, Twitter, Instagram, Linkedin, Github } from "lucide-react";

const social = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

const sections = [
  {
    title: "Product",
    links: [
      { label: "Trip Planner", href: "/trip-planner" },
      { label: "Saved Trips", href: "/saved-trips" },
      { label: "My Bookings", href: "/my-bookings" },
      { label: "Price Alerts", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 mt-12">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow group-hover:shadow-magenta transition-shadow duration-300">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-black text-aurora">TripGenie</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs leading-relaxed">
              AI travel buddy. Plan smarter, travel better, spend less.
            </p>
            <div className="flex gap-2">
              {social.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl glass hover:bg-gradient-primary hover:border-transparent transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-foreground/90">
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {section.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="hover:text-primary transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TripGenie. Built with love for travelers.</p>
          <p className="text-xs">Powered by you · Designed in India</p>
        </div>
      </div>
    </footer>
  );
}
