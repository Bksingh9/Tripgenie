import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription, SubscriptionTier } from "@/contexts/SubscriptionContext";
import {
  Check,
  X,
  Sparkles,
  Crown,
  Zap,
  Star,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PlanFeature {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  premium: boolean | string;
}

const features: PlanFeature[] = [
  { label: "AI Trip Planning", free: "Basic", pro: "Advanced", premium: "Priority" },
  { label: "Saved Trips", free: "3 trips", pro: "Unlimited", premium: "Unlimited" },
  { label: "Price Alerts", free: false, pro: true, premium: true },
  { label: "Ad-Free Experience", free: false, pro: true, premium: true },
  { label: "Multi-City Planning", free: false, pro: true, premium: true },
  { label: "Affiliate Deals & Discounts", free: true, pro: true, premium: true },
  { label: "Travel Journal", free: false, pro: false, premium: true },
  { label: "Priority Support", free: false, pro: false, premium: true },
  { label: "API Access", free: false, pro: false, premium: true },
  { label: "Group Trip Planning", free: false, pro: false, premium: true },
];

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel anytime from your profile page. Your subscription will remain active until the end of your current billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, and UPI through our secure Stripe payment gateway.",
  },
  {
    question: "Is there a free trial for Pro or Premium?",
    answer:
      "We offer a 7-day free trial for Pro plan. You can explore all Pro features before committing. No credit card required to start.",
  },
  {
    question: "What happens to my saved trips if I downgrade?",
    answer:
      "Your trips are safe! You'll still be able to view all saved trips, but you won't be able to add new ones beyond the free tier limit until you upgrade again.",
  },
  {
    question: "Do affiliate booking deals work on the free plan?",
    answer:
      "Absolutely! All users get access to our partner deals from Booking.com, Skyscanner, MakeMyTrip, and more. You'll find the best prices regardless of your plan.",
  },
];

const plans: {
  id: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: typeof Star;
  badge?: string;
  highlight?: boolean;
}[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for casual travelers",
    icon: Star,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹799",
    period: "/month",
    description: "For frequent travelers who want more",
    icon: Zap,
    badge: "Most Popular",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹1,599",
    period: "/month",
    description: "Everything unlimited + exclusive perks",
    icon: Crown,
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium">{value}</span>;
  }
  return value ? (
    <Check className="h-5 w-5 text-success mx-auto" />
  ) : (
    <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
  );
}

const Pricing = () => {
  const { tier: currentTier } = useSubscription();

  const handleSelectPlan = (planId: SubscriptionTier) => {
    if (planId === "free") return;

    const stripeLinks: Record<string, string> = {
      pro: import.meta.env.VITE_STRIPE_PRO_LINK || "#",
      premium: import.meta.env.VITE_STRIPE_PREMIUM_LINK || "#",
    };

    const link = stripeLinks[planId];
    if (link && link !== "#") {
      window.open(link, "_blank", "noopener");
    }
  };

  return (
    <Layout>
      <div className="container py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose the plan that fits your{" "}
            <span className="text-gradient">travel style</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade as you go. All plans include access to our
            partner booking deals.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrent = currentTier === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full ${
                    plan.highlight
                      ? "border-primary shadow-glow ring-2 ring-primary/30"
                      : ""
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-8 pb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </CardHeader>

                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">
                        {plan.period}
                      </span>
                    </div>

                    <ul className="space-y-3 text-left mb-8">
                      {features.slice(0, 6).map((feature) => {
                        const value = feature[plan.id];
                        const hasFeature =
                          value === true || typeof value === "string";
                        return (
                          <li
                            key={feature.label}
                            className={`flex items-center gap-3 text-sm ${
                              hasFeature
                                ? "text-foreground"
                                : "text-muted-foreground/50"
                            }`}
                          >
                            {hasFeature ? (
                              <Check className="h-4 w-4 text-success shrink-0" />
                            ) : (
                              <X className="h-4 w-4 shrink-0" />
                            )}
                            <span>{feature.label}</span>
                            {typeof value === "string" && (
                              <Badge variant="outline" className="ml-auto text-xs">
                                {value}
                              </Badge>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : plan.id === "free" ? (
                      <Button variant="outline" className="w-full" disabled>
                        Free Forever
                      </Button>
                    ) : (
                      <Button
                        variant={plan.highlight ? "hero" : "default"}
                        className="w-full gap-2"
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        Upgrade to {plan.name}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Compare all features
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold w-28">Free</th>
                      <th className="text-center p-4 font-semibold w-28 text-primary">
                        Pro
                      </th>
                      <th className="text-center p-4 font-semibold w-28">
                        Premium
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, idx) => (
                      <tr
                        key={feature.label}
                        className={
                          idx < features.length - 1
                            ? "border-b border-border/50"
                            : ""
                        }
                      >
                        <td className="p-4 text-sm">{feature.label}</td>
                        <td className="p-4 text-center">
                          <FeatureValue value={feature.free} />
                        </td>
                        <td className="p-4 text-center bg-primary/5">
                          <FeatureValue value={feature.pro} />
                        </td>
                        <td className="p-4 text-center">
                          <FeatureValue value={feature.premium} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
              <HelpCircle className="h-4 w-4" />
              FAQs
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Frequently asked questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border border-border rounded-xl px-4"
              >
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Pricing;
