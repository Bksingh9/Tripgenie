import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
  ArrowRight,
  LogOut,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

const tierConfig = {
  free: { label: "Free Plan", icon: User, color: "text-muted-foreground" },
  pro: { label: "Pro Traveler", icon: Zap, color: "text-primary" },
  premium: { label: "Premium Member", icon: Crown, color: "text-yellow-500" },
};

const Profile = () => {
  const { user, profile, updateProfile, signOut, loading: authLoading } = useAuth();
  const { tier, isPro } = useSubscription();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [saving, setSaving] = useState(false);

  const [transports, setTransports] = useState<Record<string, boolean>>({
    Flights: true,
    Trains: true,
    Buses: false,
  });

  const [prefs, setPrefs] = useState({
    free_cancellation: true,
    avoid_overnight: false,
    eco_friendly: false,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || user?.email || "");
      setPhone((profile.phone as string) || "");
      setHomeCity((profile.home_city as string) || "");

      const pt = profile.preferred_transport || [];
      setTransports({
        Flights: pt.includes("flights"),
        Trains: pt.includes("trains"),
        Buses: pt.includes("buses"),
      });

      if (profile.preferences && typeof profile.preferences === "object") {
        const p = profile.preferences as Record<string, boolean>;
        setPrefs({
          free_cancellation: p.free_cancellation ?? true,
          avoid_overnight: p.avoid_overnight ?? false,
          eco_friendly: p.eco_friendly ?? false,
        });
      }
    } else if (user) {
      setEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
    }
  }, [profile, user]);

  const handleSave = async () => {
    setSaving(true);
    const preferredTransport = Object.entries(transports)
      .filter(([, v]) => v)
      .map(([k]) => k.toLowerCase());

    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      home_city: homeCity,
      preferred_transport: preferredTransport,
      preferences: prefs,
    });

    if (error) {
      toast.error(error);
    } else {
      toast.success("Profile saved!");
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out");
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email?.[0]?.toUpperCase() || "?";

  const currentTier = tierConfig[tier];
  const TierIcon = currentTier.icon;

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground text-3xl font-bold shadow-lg shadow-primary/30">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{fullName || "Traveler"}</h1>
                <p className="text-muted-foreground">{email}</p>
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
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </label>
                  <Input value={email} disabled className="opacity-60" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Home City
                  </label>
                  <Input value={homeCity} onChange={(e) => setHomeCity(e.target.value)} placeholder="Mumbai" />
                </div>
                <Button className="w-full" onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

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
                      { icon: Plane, label: "Flights" },
                      { icon: Train, label: "Trains" },
                      { icon: Bus, label: "Buses" },
                    ].map((item) => (
                      <Badge
                        key={item.label}
                        variant={transports[item.label] ? "default" : "outline"}
                        className="cursor-pointer gap-1 px-3 py-1.5"
                        onClick={() => setTransports({ ...transports, [item.label]: !transports[item.label] })}
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
                      { icon: Shield, label: "Only free cancellation", key: "free_cancellation" as const },
                      { icon: Moon, label: "Avoid overnight travel", key: "avoid_overnight" as const },
                      { icon: Leaf, label: "Prefer eco-friendly options", key: "eco_friendly" as const },
                    ].map((pref) => (
                      <div key={pref.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <pref.icon className="h-4 w-4 text-primary" />
                          <span className="text-sm">{pref.label}</span>
                        </div>
                        <Switch
                          checked={prefs[pref.key]}
                          onCheckedChange={(checked) => setPrefs({ ...prefs, [pref.key]: checked })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      <p className="text-xs text-muted-foreground">Expires 12/27</p>
                    </div>
                  </div>
                  <Badge variant="outline">Default</Badge>
                </div>
                <Button variant="outline" className="w-full">Add Payment Method</Button>
              </CardContent>
            </Card>

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
                  <div key={notif.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
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
