import Link from "next/link";
import { CheckCircle2, Home, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { localizedHref } from "@/lib/route-mapping";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return getSeoMetadata(`${localizedHref(params.lang, "help-center")}/support/success`, {
    title: dict.support?.form?.success?.title,
    description: dict.support?.form?.success?.description,
  });
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
    key in vars ? vars[key] : ""
  );
}

export default async function SupportSuccessPage({
  params,
  searchParams,
}: {
  params: { lang: Locale };
  searchParams: { id?: string };
}) {
  const dict = await getDictionary(params.lang);
  const successDict = dict.support.form.success;
  const ticketId = searchParams?.id;

  return (
    <>
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.helpCenter, href: localizedHref(params.lang, "help-center") },
          { label: dict.breadcrumb.helpCenterSupport, href: `${localizedHref(params.lang, "help-center")}/support` },
          { label: dict.breadcrumb.helpCenterSupportSuccess },
        ]}
        lang={params.lang}
      />
      <main role="main" className="min-h-[calc(100vh-200px)] py-10 md:py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 md:p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2
                className="h-9 w-9 text-emerald-600"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-[1.7rem] sm:text-2xl md:text-3xl font-semibold text-gray-900">
              {successDict.title}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base sm:text-sm md:text-base text-gray-600">
              {successDict.description}
            </p>

            {ticketId && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-base font-medium text-gray-800 ring-1 ring-gray-200">
                <Mail className="h-4 w-4 text-gray-500" aria-hidden="true" />
                {interpolate(successDict.ticketId, { id: ticketId })}
              </p>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="cursor-pointer">
                <Link href={`${localizedHref(params.lang, "help-center")}/support`}>
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                  {successDict.ctaNew}
                </Link>
              </Button>
              <Button asChild variant="outline" className="cursor-pointer">
                <Link href={`/${params.lang}`}>
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  {successDict.ctaHome}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </>
  );
}
