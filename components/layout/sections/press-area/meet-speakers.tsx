import type { PressAreaDict } from "./translations";

interface MeetSpeakersProps {
  dict: PressAreaDict["speakers"];
}

const speakers = [
  {
    name: "Duc Tho — Senior Global Director",
    bio: "Duc Tho is the Senior Global Director at esim.vn. He is constantly working to make esim.vn the leading travel eSIM provider today. He conducts in-depth research to understand what travelers truly want, then turns those insights into intuitive, user-friendly features — all while seeking out new partners to expand esim.vn's distribution network worldwide.",
    image: "https://res.cloudinary.com/deqfcfcwf/image/upload/v1782062665/press-area-headshot-duc-tho_kgjzp8.png",
    alt: "esim.vn's Senior Global Director, Duc Tho, smiling for a photo.",
  },
  {
    name: "Lai Ha — CEO",
    bio: "Lai Ha is the CEO of esim.vn, a platform dedicated to travel eSIMs designed to keep you seamlessly connected on every trip. After more than 10 years working at a leading telecommunications company in Vietnam, she now channels her expertise in telecom and internet connectivity — paired with her own real-world travel experience — into a single mission: delivering global connectivity that's affordable, secure, and easy to use.",
    image: "https://res.cloudinary.com/deqfcfcwf/image/upload/v1782062667/press-area-headshot-lai-ha_eoowig.png",
    alt: "esim.vn's CEO, Lai Ha, smiling for a photo.",
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
                <p className="body-md max-w-full break-words text-center text-text-secondary scroll-mt-20 xl:scroll-mt-24">{dict.description}</p>
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
