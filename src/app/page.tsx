import { Hero } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/trust-strip";
import { Capabilities } from "@/components/landing/capabilities";
import { Process } from "@/components/landing/process";
import { Network } from "@/components/landing/network";
import { Integrations } from "@/components/landing/integrations";
import { FinalCta } from "@/components/landing/cta";
import { SiteFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <TrustStrip />
      <Capabilities />
      <Process />
      <Network />
      <Integrations />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
