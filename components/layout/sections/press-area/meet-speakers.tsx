import type { PressAreaDict } from "./translations";

interface MeetSpeakersProps {
  dict: PressAreaDict["speakers"];
}

const speakers = [
  {
    name: "Vykintas Maknickas — CEO",
    bio: "Vykintas is the CEO of Saily, a travel eSIM app built to keep you connected on every trip. After seven years at Nord Security, he's channeling his cybersecurity expertise and real travel experiences into one mission: making global connectivity affordable, safe, and stress free.",
    image: "https://sb.nordcdn.com/m/fa0fc58be0da722c/original/press-area-headshot-vykintas-V2.png",
    alt: "Saily's CEO, Vykintas, smiling for a photo.",
  },
  {
    name: "Matas Čenys — Head of product",
    bio: "Matas is all about making Saily the best travel app out there. He digs deep to understand what travelers really want and turns insights into intuitive, handy features. Working closely with the design and engineering teams, he's focused on evolving the app to meet every traveler's needs.",
    image: "https://sb.nordcdn.com/m/5d8ecfb2b970b513/original/press-area-headshot-matas-V2.png",
    alt: "Saily's head of product, Matas, smiling for a photo.",
  },
];

export function MeetSpeakers({ dict }: MeetSpeakersProps) {
  return (
    <div data-section="MeetSpeakers" data-testid="section-MeetSpeakers" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="flex flex-col gap-y-8">
              <div className="flex flex-col items-center gap-y-4">
                <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">{dict.title}</h2>
                <p className="body-md text-text-secondary scroll-mt-20 xl:scroll-mt-24">{dict.description}</p>
              </div>
              <div className="grid sm:gap-x-8 md:grid-cols-2 grid-cols-1 gap-y-8">
                {speakers.map((speaker) => (
                  <div key={speaker.name}>
                    <div className="flex flex-col rounded-[var(--radius-sm)] md:rounded-[var(--radius-md)] lg:rounded-[var(--radius-lg)] h-full overflow-hidden" style={{ backgroundColor: "#EEF1F6" }}>
                      <div className="flex-1">
                        <div className="md:p-10 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                          <div className="text-center lg:text-left">
                            <p className="heading-lg text-start scroll-mt-20 xl:scroll-mt-24">{speaker.name}</p>
                          </div>
                          <p className="body-md text-text-secondary scroll-mt-20 xl:scroll-mt-24">{speaker.bio}</p>
                        </div>
                      </div>
                      <div className="flex flex-1">
                        <div className="mx-auto flex items-end">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt={speaker.alt} loading="lazy" width={609} height={609} decoding="async" style={{ color: "transparent" }} src={speaker.image} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
