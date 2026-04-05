import { Link } from "react-router-dom";
import { Plane, Twitter, Instagram, Linkedin, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                <Plane className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">TripGenie</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your AI travel bestie. Plan smarter, travel better.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/trip-planner" className="hover:text-foreground transition-colors">Trip Planner</Link></li>
              <li><Link to="/saved-trips" className="hover:text-foreground transition-colors">Saved Trips</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Price Alerts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Partners */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">Our Partners</span>
            {["Booking.com", "Skyscanner", "MakeMyTrip", "Agoda", "Cleartrip"].map((partner) => (
              <span key={partner} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {partner}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 TripGenie. All rights reserved. Made with ❤️ for travelers.</p>
            <a
              href={import.meta.env.VITE_BMC_URL || "https://www.buymeacoffee.com/tripgenie"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <Heart className="h-3 w-3" />
              Support TripGenie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
