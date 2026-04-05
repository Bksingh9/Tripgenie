import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Settings,
  Plane,
  Train,
  Bus,
  Leaf,
  Moon,
  Crown,
  Zap,
  ArrowRight
} from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

const tierConfig = {
  free: { label: "Free Plan", icon: User, color: "text-muted-foreground" },
  pro: { label: "Pro Traveler", icon: Zap, color: "text-primary" },
  premium: { label: "Premium Member", icon: Crown, color: "text-yellow-500" },
};

const Profile = () => {
  const { tier, isPro } = useSubscription();
  const currentTier = tierConfig[tier];
  const TierIcon = currentTier.icon;

  return (
    <Layout>
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground text-3xl font-bold shadow-lg shadow-primary/30">
              JD
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">John Doe</h1>
              <p className="text-muted-foreground">john.doe@email.com</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`gap-1 ${currentTier.color}`}>
                  <TierIcon className="h-3 w-3" />
                  {currentTier.label}
                </Badge>
                {!isPro && (
                  <Link to="/pricing">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer gap-1">
                      Upgrade
                      <ArrowRight className="h-3 w-3" />
                    </Badge>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </label>
                  <Input defaultValue="john.doe@email.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </label>
                  <Input defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Home City
                  </label>
                  <Input defaultValue="Mumbai" />
                </div>
                <Button className="w-full">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Travel Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Travel Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Preferred Transport</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: Plane, label: "Flights", active: true },
                      { icon: Train, label: "Trains", active: true },
                      { icon: Bus, label: "Buses", active: false },
                    ].map((item) => (
                      <Badge
                        key={item.label}
                        variant={item.active ? "default" : "outline"}
                        className="cursor-pointer gap-1 px-3 py-1.5"
                      >
                        <item.icon className="h-3 w-3" />
                        {item.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Quick Toggles</label>
                  <div className="space-y-3">
                    {[
                      { icon: Shield, label: "Only free cancellation", active: true },
                      { icon: Moon, label: "Avoid overnight travel", active: false },
                      { icon: Leaf, label: "Prefer eco-friendly options", active: true },
                    ].map((pref) => (
                      <div
                        key={pref.label}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                      >
                        <div className="flex items-center gap-2">
                          <pref.icon className="h-4 w-4 text-primary" />
                          <span className="text-sm">{pref.label}</span>
                        </div>
                        <Switch defaultChecked={pref.active} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-16 rounded bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Badge variant="outline">Default</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Price drop alerts", desc: "Get notified when prices drop", active: true },
                  { label: "Booking updates", desc: "Flight delays, gate changes", active: true },
                  { label: "Promotional offers", desc: "Deals and discounts", active: false },
                  { label: "Travel tips", desc: "Destination guides and tips", active: true },
                ].map((notif) => (
                  <div
                    key={notif.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{notif.label}</p>
                      <p className="text-xs text-muted-foreground">{notif.desc}</p>
                    </div>
                    <Switch defaultChecked={notif.active} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
