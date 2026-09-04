"use client";

import { useState } from "react";
import type { PressAreaDict } from "./translations";

interface ResearchHubProps {
  dict: PressAreaDict["researchHub"];
}

interface Article {
  image: string;
  alt: string;
  title: string;
  href: string;
  hideOnMd?: boolean;
}

const tabContent: Record<string, Article[]> = {
  travel: [
    { image: "https://sb.nordcdn.com/m/5f9de54ebbfbf6c3/original/saily-blog-featured-internet-connectivity-index-968x507.jpg", alt: "ESIM.VN Internet Connectivity Index 2025", title: "ESIM.VN Internet Connectivity Index 2025", href: "/internet-connectivity-index/" },
    { image: "https://sb.nordcdn.com/m/6ec889a7c2185eb9/original/saily-blog-featured-americans-dream-vacation-968x507.jpg", alt: "The recipe for an American's dream vacation", title: "What's the recipe for the perfect vacation in 2025?", href: "/blog/american-dream-vacation/" },
    { image: "https://sb.nordcdn.com/m/e85eaf633b43c2b/original/saily-blog-featured-reseach-reveals-the-US-states-with-the-highest-interest-in-public-wifi-968x507.jpg", alt: "A ESIM.VN survey reveals a majority of travelers use public Wi-Fi despite the risks", title: "Still using public Wi-Fi while traveling? You're not alone", href: "/blog/travelers-use-public-wifi-despite-risks/", hideOnMd: true },
    { image: "https://sb.nordcdn.com/m/116137a062e1920/original/saily-blog-featured-annoying-travel-behaviours-968x507.jpg", alt: "The most annoying tourist behaviors (by country)", title: "The most annoying tourist behaviors", href: "/blog/annoying-tourist-behaviors/" },
    { image: "https://sb.nordcdn.com/m/7b5736c42cf2a206/original/saily-blog-featured-pr-american-internet-usage-habits-while-traveling.jpg", alt: "A group of friends taking a selfie.", title: "How many hours do Americans spend online on vacation?", href: "/blog/#/" },
  ],
  security: [
    { image: "https://sb.nordcdn.com/m/2a8d905faebfcdbc/original/saily-blog-featured-Travel-documents-on-the-dark-web-968x507.jpg", alt: "A man entering his passport details on a computer using public Wi-Fi.", title: "Stolen travel document research: A ESIMVN and esim.vn project", href: "/blog/stolen-travel-documents-research/" },
    { image: "https://sb.nordcdn.com/m/7b5736c42cf2a206/original/saily-blog-featured-pr-american-internet-usage-habits-while-traveling.jpg", alt: "A group of friends taking a selfie.", title: "Research reveals the US states with the highest interest in public Wi-Fi", href: "/blog/us-states-with-highest-interest-in-public-wifi/" },
    { image: "https://sb.nordcdn.com/m/761fc3b7d605a25/original/saily-blog-featured-saily-security-features-and-data-saving.jpg", alt: "Saily's ad blocker saves 28.6% of your data on average", title: "Research confirms: ESIMVN ad blocker saves you 28.6% of data", href: "/blog/esimvn-ad-blocker-saves-data/", hideOnMd: true },
  ],
  product: [
    { image: "https://sb.nordcdn.com/m/ff0171bc3d0e425/original/saily-blog-featured-saily-ultra-968x507.jpg", alt: "A phone screen showing the eSIM.vn Ultra plan.", title: "Meet eSIM.vn Ultra: A new all-in-one premium travel plan", href: "/blog/introducing-esimvn-ultra/" },
    { image: "https://sb.nordcdn.com/m/54245041c81d3019/original/saily-blog-featured-saily-ceo-article.jpg", alt: "A eSIM.vn update announcement highlighting new security features.", title: "Why eSIM.vn is not just another eSIM app", href: "/blog/how-esimvn-differs-from-other-esim-apps/" },
    { image: "https://sb.nordcdn.com/m/4ee9fbd687f4660b/original/saily-blog-featured-Saily-B2B-announcement.jpg", alt: "A eSIM.vn for business announcement.", title: "Introducing eSIM.vn for business: The eSIM solution for work travel", href: "/blog/introducing-esimvn-business/", hideOnMd: true },
  ],
  initiatives: [
    { image: "https://sb.nordcdn.com/m/6bad7b60ebeffce9/original/saily-blog-featured-impact-partnership-968x507.jpg", alt: "eSIM.vn has teamed up with the Rottnest Foundation", title: "eSIM.vn has teamed up with the Rottnest Foundation (and adopted a quokka!)", href: "/blog/esimvn-partnership-with-rottnest-foundation/" },
    { image: "https://sb.nordcdn.com/m/6cd72304fa4d6dae/original/saily-blog-featured-saily-csr-initiative.jpg", alt: "eSIM.vn impact: Empowering nonprofits", title: "eSIM.vn impact: Empowering nonprofits and providing emergency internet access", href: "/blog/esimvn-impact/" },
    { image: "https://sb.nordcdn.com/m/753ccf25f89da27d/original/saily-blog-featured-saily-for-non-profits-968x507.jpg", alt: "How the eSIM.vn eSIM app supports global nonprofits", title: "Global nonprofit organizations should switch to an eSIM app — here's why", href: "/blog/how-esimvn-supports-global-nonprofits/", hideOnMd: true },
  ],
};

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className={`flex flex-col gap-4 md:gap-6 ${article.hideOnMd ? "md:hidden lg:flex" : ""}`}>
      <div className="leading-[0] [&_div]:inline-flex [&_picture]:inline-flex [&_picture]:rounded-[var(--radius-md)] [&_picture]:overflow-hidden [&_*]:leading-[0]">
        <a className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"   target="_blank" href={article.href}>
          <div>
            <picture>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={article.alt} loading="lazy" width={609} height={318} decoding="async" style={{ color: "transparent" }} className="rounded-[var(--radius-md)]" src={article.image} />
            </picture>
          </div>
        </a>
      </div>
      <h3 className="heading-sm scroll-mt-20 xl:scroll-mt-24">
        <a className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus "   target="_blank" href={article.href}>
          {article.title}
        </a>
      </h3>
    </div>
  );
}

export function ResearchHub({ dict }: ResearchHubProps) {
  const tabs = [
    { label: dict.tabs.travel, id: "travel" },
    { label: dict.tabs.security, id: "security" },
    { label: dict.tabs.product, id: "product" },
    { label: dict.tabs.initiatives, id: "initiatives" },
  ];

  const [activeTab, setActiveTab] = useState("travel");
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});

  const articles = tabContent[activeTab] || [];
  const isShowingAll = showAll[activeTab];
  const visibleArticles = isShowingAll ? articles : articles.slice(0, 5);
  const hasMore = articles.length > 5 && !isShowingAll;

  return (
    <div data-section="ResearchHub" data-testid="section-ResearchHub" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 min-w-0 md:col-span-8">
              <div className="grid min-w-0 grid-cols-1 gap-y-6">
                <h2 className="heading-xl break-words scroll-mt-20 xl:scroll-mt-24">{dict.title}</h2>
                <p className="body-md min-w-0 break-words text-text-secondary scroll-mt-20 xl:scroll-mt-24">{dict.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="flex gap-1 pb-4 scrollbar-none overflow-auto">
              <div className="relative flex gap-1 w-fit p-1 border border-border-secondary rounded-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative z-[1] body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 rounded-full transition-colors focus-visible:outline-hidden focus-visible:shadow-focus ${
                      activeTab === tab.id ? "text-white bg-[var(--bg-dark)]" : "text-text-primary hover:text-text-primary hover:bg-bg-secondary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-6">
              <div className="flex flex-col gap-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {visibleArticles.map((article) => (
                    <ArticleCard key={article.href} article={article} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-2">
                    <button
                      onClick={() => setShowAll((prev) => ({ ...prev, [activeTab]: true }))}
                      className="max-md:w-full text-center text-text-primary hover:bg-[var(--bg-brand-black)] hover:text-white border border-[var(--color-primary)] active:bg-[var(--bg-brand-black)] active:text-white box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                    >
                      {dict.showAll}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
