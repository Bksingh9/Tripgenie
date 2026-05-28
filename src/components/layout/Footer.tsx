import { Link } from "react-router-dom";
import { Plane, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/trip-planner" className="hover:text-foreground transition-colors">Trip Planner</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/agency" className="hover:text-foreground transition-colors">For Agencies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Partners</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://www.booking.com" target="_blank" rel="noopener sponsored" className="hover:text-foreground transition-colors">Booking.com</a></li>
              <li><a href="https://www.skyscanner.co.in" target="_blank" rel="noopener sponsored" className="hover:text-foreground transition-colors">Skyscanner</a></li>
              <li><a href="https://www.makemytrip.com" target="_blank" rel="noopener sponsored" className="hover:text-foreground transition-colors">MakeMyTrip</a></li>
              <li><a href="https://www.agoda.com" target="_blank" rel="noopener sponsored" className="hover:text-foreground transition-colors">Agoda</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="text-muted-foreground/50">Privacy Policy — coming soon</span></li>
              <li><span className="text-muted-foreground/50">Terms of Service — coming soon</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 TripGenie. All rights reserved.</p>
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
