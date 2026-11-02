import Link from "next/link";

import type { SiteContent } from "@/features/site-content";
import type { Messages } from "@/lib/i18n/messages";

import { FullLogo } from "./logo";

type Props = { content: SiteContent["footer"]; m: Messages };

export function MarketingFooter({ content, m }: Props) {
  const { nav, footer } = m;
  const columns = [
    {
      title: footer.pages,
      links: [
        { href: "/", label: nav.home },
        { href: "/#about", label: nav.about },
        { href: "/#core-features", label: nav.features },
        { href: "/#privasi", label: nav.privacy },
      ],
    },
    {
      title: footer.account,
      links: [
        { href: "/daftar", label: footer.signUpOwner },
        { href: "/masuk", label: footer.signIn },
      ],
    },
    {
      title: footer.information,
      links: [
        { href: "/metodologi", label: footer.methodology },
        { href: "/privasi", label: footer.privacyPolicy },
      ],
    },
  ];

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-10">
          <FullLogo />
          <form action="/daftar" method="get" className="max-w-md space-y-3">
            <label htmlFor="footer-email" className="text-sm font-medium">
              {content.emailLabel}
            </label>
            <div className="flex items-center gap-2 rounded-full bg-muted p-1.5">
              <input
                id="footer-email"
                name="email"
                type="email"
                required
                placeholder={footer.emailPlaceholder}
                className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              >
                {footer.getStarted}
              </button>
            </div>
          </form>
        </div>

        <nav aria-label={footer.linksLabel} className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title} className="space-y-4">
              <p className="font-medium">{column.title}</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} OmniSUS. {content.note}
        </p>
      </div>
    </footer>
  );
}
