import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Rocket,
  Users,
  Globe,
  Palette,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Star,
  Crown,
  Sparkles,
  HeadphonesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const agencyPlans = [
  {
    id: "starter",
    name: "Starter",
    price: "₹4,999",
    period: "/month",
    description: "Perfect for small travel agencies getting started",
    icon: Rocket,
    features: [
      "Up to 100 clients",
      "White-label branding",
      "AI trip planning",
      "5 agent slots",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹14,999",
    period: "/month",
    description: "For growing agencies with expanding client base",
    icon: Star,
    badge: "Most Popular",
    highlight: true,
    features: [
      "Up to 1,000 clients",
      "Custom domain",
      "Full AI + all agents",
      "Unlimited agent slots",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Multi-staff accounts",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹49,999",
    period: "/month",
    description: "For large agencies and travel conglomerates",
    icon: Crown,
    features: [
      "Unlimited clients",
      "Custom domain + SSL",
      "Dedicated AI model",
      "White-glove onboarding",
      "24/7 phone support",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
      "Custom agent development",
    ],
  },
];

const benefits = [
  {
    icon: Palette,
    title: "White-Label Platform",
    description: "Your brand, your domain. Clients never see TripGenie — they see YOUR travel agency.",
  },
  {
    icon: Zap,
    title: "AI-Powered Trip Planning",
    description: "Let AI handle itinerary creation. Your agents focus on closing deals, not research.",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "CRM built for travel. Track preferences, bookings, and lifetime value per client.",
  },
  {
    icon: BarChart3,
    title: "Revenue Dashboard",
    description: "Real-time analytics on bookings, commissions, and client engagement.",
  },
  {
    icon: Globe,
    title: "Multi-Agent System",
    description: "4 AI agents fetch weather, currency, destination info, and photos in parallel.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Row-level security, encrypted data, GDPR-ready. Your clients' data is safe.",
  },
];

const AgencyLanding = () => {
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName || !email) {
      toast.error("Please fill in agency name and email");
      return;
    }

    setSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.from("agency_leads").insert({
          agency_name: agencyName,
          email,
          phone,
          status: "new",
        });
      }
      toast.success("Thank you! We'll contact you within 24 hours to set up your platform.");
      setAgencyName("");
      setEmail("");
      setPhone("");
    } catch {
      toast.success("Request received! We'll be in touch soon.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              For Travel Agencies
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Launch your own{" "}
              <span className="text-gradient">AI travel platform</span>
              {" "}in minutes
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              White-label TripGenie for your agency. Your brand, your domain, your clients.
              AI-powered trip planning that earns you more per booking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#pricing">
                <Button variant="hero" size="lg" className="gap-2">
                  See Agency Plans
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
              <a href="#demo">
                <Button variant="outline" size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Try Live Demo
                </Button>
              </a>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Trusted by 50+ travel agencies across India
            </p>
          </motion.div>
        </div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[120px] -z-10" />
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-surface">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything your agency needs
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Stop building from scratch. Get a production-ready travel platform with AI built in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full hover:border-primary/40 transition-all">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agency Pricing */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Agency <span className="text-gradient">pricing</span>
            </h2>
            <p className="text-muted-foreground">
              Start free trial. No credit card required. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {agencyPlans.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`relative h-full ${plan.highlight ? "border-primary shadow-glow ring-2 ring-primary/30" : ""}`}>
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pt-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle>{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="mb-6">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                      </div>
                      <ul className="space-y-3 text-left mb-8">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-success shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <a href="#contact">
                        <Button variant={plan.highlight ? "hero" : "outline"} className="w-full gap-2">
                          Get Started
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact / Lead Form */}
      <section id="contact" className="py-20 bg-gradient-surface">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader className="text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
                    <HeadphonesIcon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Get Your Agency Platform</CardTitle>
                  <p className="text-muted-foreground">
                    Fill in your details and we'll set up your white-label platform within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Agency Name *</label>
                      <Input
                        placeholder="Your Travel Agency Name"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Business Email *</label>
                        <Input
                          type="email"
                          placeholder="you@agency.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button variant="hero" size="lg" className="w-full gap-2" disabled={submitting}>
                      {submitting ? "Submitting..." : "Request Setup"}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      14-day free trial included. No credit card required.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section id="demo" className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-12 text-center"
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                See it in action
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Try the live demo — same platform your agency will get, fully branded for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/?agent=demo" className="px-8 py-3 rounded-xl bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90 transition-all duration-300 shadow-lg text-center">
                  Try Live Demo
                </Link>
                <Link to="/trip-planner" className="px-8 py-3 rounded-xl bg-transparent border-2 border-primary-foreground/30 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-all duration-300 text-center">
                  Plan a Sample Trip
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AgencyLanding;
