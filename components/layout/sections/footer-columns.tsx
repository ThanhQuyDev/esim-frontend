"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface FooterLink {
  id?: string;
  label: string;
  href: string;
  iconUrl?: string | null;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const socialIconMap: Record<string, string> = {
  facebook: "https://sb.nordcdn.com/m/73b0007dac464eb4/original/facebook.svg",
  tiktok: "https://sb.nordcdn.com/m/3cffb132be50069/original/tiktok.svg",
  "x (twitter)": "https://sb.nordcdn.com/m/3cffb132be50069/original/x-twitter.svg",
  twitter: "https://sb.nordcdn.com/m/3cffb132be50069/original/x-twitter.svg",
  instagram: "https://sb.nordcdn.com/m/327ee6481264b8e0/original/instagram.svg",
  youtube: "https://sb.nordcdn.com/m/544926c91d4179c6/original/youtube.svg",
  linkedin: "https://sb.nordcdn.com/m/7479eac8a4f6a155/original/linkedin.svg",
  reddit: "https://sb.nordcdn.com/m/7e0fac0feb703767/original/Reddit.svg",
};

function getSocialIcon(name: string): string | undefined {
  return socialIconMap[name.trim().toLowerCase()];
}

function isFollowUsTitle(title: string): boolean {
  const t = title.trim().toLowerCase();
  return (
    t === "follow us" ||
    t === "theo dõi" ||
    t === "theo doi" ||
    t.includes("follow") ||
    t.includes("theo dõi")
  );
}

function FooterLinkItem({
  link,
  isFollowCol,
}: {
  link: FooterLink;
  isFollowCol: boolean;
}) {
  const isExternal = link.href.startsWith("http");
  const icon =
    link.iconUrl || (isFollowCol ? getSocialIcon(link.label) : null);

  if (isFollowCol && isExternal) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="body-sm text-text-secondary hover:underline inline-flex items-center gap-2"
      >
        {icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icon}
            alt={link.label.toLowerCase()}
            width={16}
            height={16}
            loading="lazy"
            style={{ color: "transparent" }}
          />
        )}
        {link.label}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className="body-sm text-text-secondary hover:underline inline-flex items-center gap-2"
    >
      {icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={icon}
          alt={link.label.toLowerCase()}
          width={16}
          height={16}
          loading="lazy"
          style={{ color: "transparent" }}
        />
      )}
      {link.label}
    </Link>
  );
}

interface FooterColumnsProps {
  columns: FooterColumn[];
}

export function FooterColumns({ columns }: FooterColumnsProps) {
  if (!columns || columns.length === 0) return null;

  return (
    <>
      {/* Mobile: Accordion (no borders, ChevronDown icon) */}
      <div className="md:hidden pb-8">
        <AccordionPrimitive.Root type="multiple">
          {columns.map((col, i) => {
            const isFollowCol = isFollowUsTitle(col.title);
            return (
              <AccordionPrimitive.Item
                key={i}
                value={`footer-col-${i}`}
                className="border-0 bg-transparent"
              >
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger
                    className={cn(
                      "flex flex-1 items-center justify-between py-3 font-medium text-text-primary hover:no-underline",
                      "[&[data-state=open]>svg]:rotate-180"
                    )}
                  >
                    {col.title}
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="flex flex-col gap-y-3 pb-2">
                    {col.links.map((link, j) => {
                      const linkKey = link.id ?? `${link.href}-${j}`;
                      return (
                        <FooterLinkItem
                          key={linkKey}
                          link={link}
                          isFollowCol={isFollowCol}
                        />
                      );
                    })}
                  </div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            );
          })}
        </AccordionPrimitive.Root>
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6 md:gap-y-8 pb-8">
        {columns.map((col, i) => {
          const isFollowCol = isFollowUsTitle(col.title);
          return (
            <div key={i} className="flex flex-col">
              <p className="font-medium text-text-primary mb-4">{col.title}</p>
              <div className="flex flex-col gap-y-3">
                {col.links.map((link, j) => {
                  const linkKey = link.id ?? `${link.href}-${j}`;
                  return (
                    <FooterLinkItem
                      key={linkKey}
                      link={link}
                      isFollowCol={isFollowCol}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
