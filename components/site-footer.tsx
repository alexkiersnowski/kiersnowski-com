import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { RollText } from "@/components/roll-text";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="flex flex-col gap-6 border-t border-foreground/10 py-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} {site.name}
      </p>

      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {site.socials.map((social) => (
          <li key={social.label}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-sm text-foreground"
            >
              <RollText>{social.label}</RollText>
              <ArrowUpRightIcon size={12} />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
