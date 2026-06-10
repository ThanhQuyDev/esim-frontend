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
    link.iconUrl || null

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
                className="border-0 bg-transparent border-b border-dashed"
              >
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger
                    className={cn(
                      "flex flex-1 items-center justify-between py-3 font-medium text-text-primary hover:no-underline",
                      "[&[data-state=open]>svg]:rotate-180"
                    )}
                  >
                    {col.title}
                    <ChevronDown className="h-6 w-6 shrink-0 transition-transform duration-200" />
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
