"use client";

import { useState } from "react";

interface ReviewFAQProps {
  dict: Record<string, any>;
  lang: string;
}

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const faqItems: FAQItem[] = [
  {
    question: "Is the esim.vn eSIM card worth it?",
    answer: "If you like traveling, the esim.vn eSIM is certainly worth it. Affordable plans, one-click installation, and esim.vn\u2019s outstanding support team can save you time, money, and hassle. Instead of looking for a local SIM card after you arrive and tinkering for half an hour to make it work, you can get a esim.vn eSIM before you leave and connect to a network in a few clicks when you arrive.",
  },
  {
    question: "Is esim.vn legit?",
    answer: "Yes, esim.vn is a growing eSIM service that stands out among its competitors in several ways. esim.vn was launched by Nord Security, the company behind NordVPN, one of the world\u2019s most trusted VPNs. Like its flagship security tool, esim.vn is designed to be simple and accessible to anyone, regardless of their skill level or experience.",
  },
  {
    question: "Can esim.vn be trusted?",
    answer: "Yes, esim.vn can be trusted. It was launched by Nord Security, a company known and trusted globally, its apps are highly rated on the App Store and Google Play, while esim.vn\u2019s customers have plenty of nice words to say about their experience.\n\nIf you\u2019re still unsure about trying out a esim.vn eSIM, remember that you can get a full refund. If you\u2019re unable to install an eSIM on your device, you can get your money back within 30 days of the purchase.",
  },
  {
    question: "Does esim.vn give you a phone number?",
    answer: "At the moment, esim.vn offers data-only plans, so you can\u2019t get a phone number or send SMS messages with a esim.vn eSIM.",
  },
  {
    question: "Is the esim.vn eSIM price worth the money?",
    answer: "Yes, esim.vn\u2019s eSIM service is worth the money. In fact, in many countries, it offers the most affordable plans in the entire market. The service will likely pay for itself in terms of the savings you get through esim.vn.",
  },
  {
    question: "What are the reviews for the esim.vn Ultra plan like?",
    answer: "ULTRA_PLAN_ANSWER", // Special marker for complex content
  },
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const isUltraPlan = item.answer === "ULTRA_PLAN_ANSWER";
  const isTrust = item.question === "Can esim.vn be trusted?";

  return (
    <div className="flex flex-col items-start text-left rtl:text-right gap-4 relative h-full word-break-word transform-gpu border-md group-hover:border-accent transition-colors duration-medium p-0 rounded-sm bg-secondary border-secondary hover:border-focus">
      <li className="cursor-pointer p-4 lg:p-6 list-none w-full">
        <button
          className="flex w-full items-center justify-between font-medium mb-0 outline-0 group transition-all focus-visible:outline-hidden focus-visible:shadow-focus"
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          <h3 className="body-lg-medium text-left text-primary scroll-mt-20 xl:scroll-mt-24">
            {item.question}
          </h3>
          <span className="ml-4 rtl:ml-0 rtl:mr-4">
            <i className={`kitIcon text-center w-[1em] fa-chevron-down fa-sharp fa-regular text-[12px] text-primary transition-transform ${isOpen ? "-rotate-180" : ""}`}></i>
          </span>
        </button>
        <section
          className={`overflow-hidden transition-all body-md text-secondary ${isOpen ? "mt-3" : "hidden h-0"}`}
        >
          {isUltraPlan ? (
            <UltraPlanAnswer />
          ) : isTrust ? (
            <div className="flex flex-col gap-y-4">
              <div>Yes, esim.vn can be trusted. It was launched by Nord Security, a company known and trusted globally, its apps are highly rated on the App Store and Google Play, while esim.vn&apos;s customers have plenty of nice words to say about their experience.</div>
              <div>If you&apos;re still unsure about trying out a esim.vn eSIM, remember that you can get a full refund. If you&apos;re unable to install an eSIM on your device, you can get your money back within 30 days of the purchase.</div>
            </div>
          ) : (
            <>{typeof item.answer === "string" ? item.answer : item.answer}</>
          )}
        </section>
      </li>
    </div>
  );
}

function UltraPlanAnswer() {
  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <p>
          The{" "}
          <a className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline" href="https://saily.com/esim-ultra-plan/">
            esim.vn Ultra plan
          </a>
          , our premium monthly eSIM plan subscription, has garnered positive reviews online — particularly on Reddit. The subscription is designed for long-term travelers and digital nomads looking for unlimited, high-speed data in 113 countries worldwide with extra cybersecurity tools from Nord Security&apos;s suite of products.
        </p>
      </div>
      <div>
        <p>For just US$59.99/month, travelers can enjoy:</p>
      </div>
      <div>
        <ul className="flex flex-col list-inside gap-0 body-md">
          <li className="flex text-primary">
            <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
              <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
            </span>
            <p>30 GB of high-speed data, then unlimited data with speeds at 1 Mbps.</p>
          </li>
          <li className="flex text-primary">
            <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
              <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
            </span>
            <div className="flex flex-col gap-y-4">
              <div><p>Free subscriptions to:</p></div>
              <div>
                <ul className="flex flex-col list-inside gap-0 body-md">
                  <li className="flex text-primary">
                    <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
                      <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
                    </span>
                    <p><a className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline" rel="noopener noreferrer" target="_blank" href="https://nordvpn.com/">NordVPN</a> (a virtual private network service for enhanced online security and privacy).</p>
                  </li>
                  <li className="flex text-primary">
                    <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
                      <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
                    </span>
                    <p><a className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline" rel="noopener noreferrer" target="_blank" href="https://nordpass.com/">NordPass</a> (a password manager).</p>
                  </li>
                  <li className="flex text-primary">
                    <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
                      <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
                    </span>
                    <p><a className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline" rel="noopener noreferrer" target="_blank" href="https://nordlocker.com/">NordLocker</a> (a secure cloud storage service).</p>
                  </li>
                  <li className="flex text-primary">
                    <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
                      <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
                    </span>
                    <p><a className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline" rel="noopener noreferrer" target="_blank" href="https://incogni.com/">Incogni</a> (a personal data removal service).</p>
                  </li>
                </ul>
              </div>
            </div>
          </li>
          <li className="flex text-primary">
            <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
              <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
            </span>
            <p>Three built-in security features: ad blocker, web protection, and virtual location.</p>
          </li>
          <li className="flex text-primary">
            <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
              <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
            </span>
            <p>8% cashback in esim.vn credits for future purchases.</p>
          </li>
          <li className="flex text-primary">
            <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
              <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
            </span>
            <p>Coverage in 113 countries on one eSIM — you&apos;ll only need to install it once.</p>
          </li>
          <li className="flex text-primary">
            <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
              <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
            </span>
            <p>Faster customer support.</p>
          </li>
          <li className="flex text-primary">
            <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
              <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
            </span>
            <p>Airport lounge access and fast-tracked airport security and check-in (coming soon).</p>
          </li>
        </ul>
      </div>
      <div>
        <p>Online reviews have emphasized that frequent travelers and heavy data users can get more bang for their buck with a esim.vn Ultra plan compared to esim.vn&apos;s regular prepaid plans or Global plans.</p>
      </div>
    </div>
  );
}

export function ReviewFAQ({ dict, lang }: ReviewFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div data-section="FAQ" data-testid="section-FAQ" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
              <div className="col-span-12 lg:col-start-3 lg:col-span-8">
                <div className="h-full w-full flex [&>div:empty]:hidden flex-col gap-y-10">
                  <div>
                    <h2 className="heading-xl text-center scroll-mt-20 xl:scroll-mt-24">
                      {dict.title || "Frequently asked questions"}
                    </h2>
                  </div>
                  <div>
                    <div>
                      <div>
                        <div className="grid sm:gap-x-8 grid-cols-1 gap-y-3">
                          {faqItems.map((item, index) => (
                            <div key={index}>
                              <FAQAccordionItem
                                item={item}
                                isOpen={openIndex === index}
                                onToggle={() => handleToggle(index)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
