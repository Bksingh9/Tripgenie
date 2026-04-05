import { useEffect, useRef } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface AdBannerProps {
  slot?: string;
  format?: "horizontal" | "rectangle" | "vertical";
  className?: string;
}

export function AdBanner({ slot, format = "horizontal", className = "" }: AdBannerProps) {
  const { showAds } = useSubscription();
  const adRef = useRef<HTMLDivElement>(null);

  const pubId = import.meta.env.VITE_ADSENSE_PUB_ID;

  useEffect(() => {
    if (!showAds || !pubId || !adRef.current) return;

    try {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
      script.crossOrigin = "anonymous";

      if (!document.querySelector(`script[src*="${pubId}"]`)) {
        document.head.appendChild(script);
      }

      // @ts-expect-error adsbygoogle is injected by the script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded - show placeholder
    }
  }, [showAds, pubId]);

  if (!showAds) return null;

  const sizeClasses = {
    horizontal: "min-h-[90px]",
    rectangle: "min-h-[250px]",
    vertical: "min-h-[600px] max-w-[300px]",
  };

  // Show placeholder if no pub ID configured
  if (!pubId) {
    return (
      <div
        className={`w-full ${sizeClasses[format]} rounded-xl border border-dashed border-border/50 bg-secondary/30 flex items-center justify-center ${className}`}
      >
        <div className="text-center text-muted-foreground/50 text-xs">
          <p>Partner offers</p>
          <p className="mt-1">Travel deals appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`w-full ${sizeClasses[format]} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
