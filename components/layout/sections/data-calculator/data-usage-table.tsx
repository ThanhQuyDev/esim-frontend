import {
  Smartphone,
  Film,
  Music,
  Navigation,
  Globe,
  MessageCircle,
  Video,
  Download,
} from "lucide-react";
import { TABLE_ACTIVITIES } from "./calculator-data";

const ICON_MAP: Record<string, React.ElementType> = {
  socialMedia: Smartphone,
  streamingVideoQHD: Film,
  streamingVideoFHD: Film,
  streamingMusic: Music,
  mapNavigation: Navigation,
  webBrowsing: Globe,
  emailsMessaging: MessageCircle,
  videoCalls: Video,
  downloads: Download,
};

interface DataUsageTableProps {
  dict: Record<string, any>;
}

export function DataUsageTable({ dict }: DataUsageTableProps) {
  return (
    <section className="py-16">
      <div className="mx-4 sm:mx-auto">
        <div className="container mx-auto">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-y-6">
              <h3 className="heading-xl text-text-primary">{dict.title}</h3>
              <p className="body-md text-text-secondary">{dict.subtitle}</p>
            </div>

            <ul>
              <li className="grid grid-cols-[1fr,90px] md:grid-cols-2 items-center gap-x-3 border-b border-border-secondary py-3 md:py-4">
                <div className="body-md-medium text-text-primary">
                  {dict.activityHeader}
                </div>
                <div className="body-md-medium text-text-primary">
                  {dict.dataPerHourHeader}
                </div>
              </li>
              {TABLE_ACTIVITIES.map((item) => {
                const Icon = ICON_MAP[item.key] || Globe;
                return (
                  <li
                    key={item.key}
                    className="grid grid-cols-[1fr,90px] md:grid-cols-2 items-center gap-x-3 py-4 md:py-6 border-b border-border-secondary"
                  >
                    <div className="flex items-center gap-x-2 body-md text-text-primary">
                      <Icon className="w-5 h-5 shrink-0" />
                      {dict.rows[item.key]}
                    </div>
                    <div className="body-md text-text-primary">{item.usage}</div>
                  </li>
                );
              })}
            </ul>

            <p className="body-xs text-text-tertiary">{dict.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
