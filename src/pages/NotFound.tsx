import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, MapPin } from "lucide-react";

const NotFound = () => {
  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="relative mb-8">
            <div className="text-[150px] font-bold text-gradient leading-none">404</div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <MapPin className="h-16 w-16 text-primary" />
            </motion.div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Lost your way?</h1>
          <p className="text-muted-foreground mb-8">
            Looks like this destination doesn't exist. Let's get you back on track!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="hero" className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link to="/trip-planner">
              <Button variant="outline" className="gap-2">
                <MapPin className="h-4 w-4" />
                Plan a Trip
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Background */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -z-10" />
    </Layout>
  );
};

export default NotFound;
