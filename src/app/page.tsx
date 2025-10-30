import {LandingHero} from "@/src/components/landing/LandingHero";
import {LandingFeatures} from "@/src/components/landing/LandingFeatures";
import LandingCTA from "@/src/components/landing/LandingCTA";
import LandingFooter from "@/src/components/landing/LandingFooter";
import LandingPricing from "@/src/components/landing/LandingPrincing";
import Nav from "../components/nav/Nav";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <main className="grow">
        <Nav />
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
