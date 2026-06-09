import { Signpost, Wallet, Rocket, ShieldCheck, Gem } from "lucide-react";
import type { PressAreaDict } from "./translations";

interface WhyChooseSailyProps {
  dict: PressAreaDict["whyChoose"];
}

const images = [
  {
    alt: "A smiling woman using her phone outside.",
    src: "https://sb.nordcdn.com/m/6ff5ac1a5fc98440/original/benefit-section-one-sim.png",
  },
  {
    alt: "A phone screen showing esim.vn's global coverage and security features.",
    src: "https://sb.nordcdn.com/m/4a18c3a25c9f5a26/original/benefit-section-security-features.png",
  },
  {
    alt: "ultra plan featureblock v2",
    src: "https://sb.nordcdn.com/m/643e08f767581cea/original/ultra_plan_featureblock_v2.png",
  },
  {
    alt: "A phone screen showing the esim.vn Ultra plan.",
    src: "https://sb.nordcdn.com/m/490d72ea0ed85194/original/benefit-section-ultra-plan.png",
  },
];

const ICON_MAP: Record<string, React.ElementType> = {
  "fa-signs-post": Signpost,
  "fa-wallet": Wallet,
  "fa-rocket-launch": Rocket,
  "fa-shield-check": ShieldCheck,
  "fa-gem": Gem,
};

interface CardData {
  icon?: string;
  flagsImage?: boolean;
  title: string;
  description: string;
  isPremium?: boolean;
}

function FeatureCard({ card }: { card: CardData }) {
  const isPremium = card.isPremium;
  const IconComp = card.icon ? ICON_MAP[card.icon] : null;
  return (
    <div className="bg-bg-secondary border border-border-secondary py-8 px-6 rounded-[var(--radius-md)] relative overflow-hidden">
      {isPremium && (
        <div className="absolute top-0 left-0 h-full w-full">
          <div className="relative overflow-hidden w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={images[2].alt} loading="lazy" decoding="async" className="h-full w-full object-cover object-center absolute inset-0" src={images[2].src} />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3 relative z-10">
        {card.flagsImage ? (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="flags feature block" loading="lazy" width={168} height={24} decoding="async" style={{ color: "transparent" }} src="https://sb.nordcdn.com/m/138f37c5e6a9005d/original/flags-feature-block.svg" />
          </div>
        ) : IconComp ? (
          <IconComp className={`w-6 h-6 ${isPremium ? "text-yellow-400" : "text-text-primary"}`} />
        ) : null}
        <div className="flex flex-col gap-2">
          <p className={`body-lg-medium scroll-mt-20 xl:scroll-mt-24 ${isPremium ? "text-white" : ""}`}>{card.title}</p>
          <p className={`body-sm scroll-mt-20 xl:scroll-mt-24 ${isPremium ? "text-gray-300" : "text-text-secondary"}`}>{card.description}</p>
        </div>
      </div>
    </div>
  );
}

function ImageCard({ image }: { image: (typeof images)[number] }) {
  return (
    <div className="rounded-[var(--radius-md)] overflow-hidden flex-1 min-h-[275px] relative">
      <div className="absolute top-0 left-0 h-full w-full">
        <div className="relative overflow-hidden w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={image.alt} loading="lazy" decoding="async" className="h-full w-full object-cover object-center absolute inset-0" src={image.src} />
        </div>
      </div>
    </div>
  );
}

export function WhyChooseSaily({ dict }: WhyChooseSailyProps) {
  const featureCards: CardData[] = [
    { icon: "fa-signs-post", title: dict.worldwideCoverage, description: dict.worldwideCoverageDesc },
    { icon: "fa-wallet", title: dict.noRoaming, description: dict.noRoamingDesc },
    { flagsImage: true, title: dict.flexiblePlans, description: dict.flexiblePlansDesc },
    { icon: "fa-rocket-launch", title: dict.quickSetup, description: dict.quickSetupDesc },
    { icon: "fa-shield-check", title: dict.security, description: dict.securityDesc },
    { icon: "fa-gem", title: dict.premium, description: dict.premiumDesc, isPremium: true },
  ];

  return (
    <div data-section="WhyChooseSaily" data-testid="section-WhyChooseSaily" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24 whitespace-nowrap">{dict.title}</h2>
                <p className="body-md text-text-secondary scroll-mt-20 xl:scroll-mt-24">
                  {dict.description.split(dict.linkText)[0]}
                  <a className="underline" href="https://esim.vn/">{dict.linkText}</a>
                  {dict.description.split(dict.linkText)[1]}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* XL: 4 columns */}
            <div className="hidden xl:grid xl:grid-cols-4 gap-4">
              <div className="flex flex-col gap-4"><ImageCard image={images[0]} /><FeatureCard card={featureCards[0]} /></div>
              <div className="flex flex-col gap-4"><FeatureCard card={featureCards[1]} /><ImageCard image={images[1]} /></div>
              <div className="flex flex-col gap-4"><FeatureCard card={featureCards[2]} /><FeatureCard card={featureCards[3]} /><FeatureCard card={featureCards[4]} /></div>
              <div className="flex flex-col gap-4"><FeatureCard card={featureCards[5]} /><ImageCard image={images[3]} /></div>
            </div>
            {/* LG: 3 columns */}
            <div className="hidden lg:grid xl:hidden lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-4"><ImageCard image={images[0]} /><FeatureCard card={featureCards[0]} /><FeatureCard card={featureCards[1]} /></div>
              <div className="flex flex-col gap-4"><ImageCard image={images[1]} /><FeatureCard card={featureCards[2]} /><FeatureCard card={featureCards[3]} /></div>
              <div className="flex flex-col gap-4"><FeatureCard card={featureCards[4]} /><FeatureCard card={featureCards[5]} /><ImageCard image={images[3]} /></div>
            </div>
            {/* Mobile/MD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              <div className="flex flex-col gap-4"><ImageCard image={images[0]} /><FeatureCard card={featureCards[0]} /><FeatureCard card={featureCards[1]} /><ImageCard image={images[1]} /></div>
              <div className="flex flex-col gap-4"><FeatureCard card={featureCards[2]} /><FeatureCard card={featureCards[3]} /><FeatureCard card={featureCards[4]} /><FeatureCard card={featureCards[5]} /><ImageCard image={images[3]} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
