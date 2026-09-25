import { fill, getDictionary, type Locale } from "~~/lib/i18n";
import { GithubLogo } from "~~/public/assets/logos/GithubLogo";
import { LinkedinLogo } from "~~/public/assets/logos/LinkedinLogo";

interface FooterProps {
  locale: Locale;
}

/**
 * Site footer
 */
export const Footer = ({ locale }: FooterProps) => {
  const t = getDictionary(locale);
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <footer className="min-h-0 p-4 md:py-5 md:px-1 md:mb-11 lg:mb-0 md:relative">
      <div className="w-full">
        <nav aria-label={t.footer.socialNav} className="flex justify-center items-center gap-4 text-sm w-full">
          <a
            href="https://www.linkedin.com/in/alexis-balayre"
            target="_blank"
            rel="noopener noreferrer"
            className="transition text-neutral-content hover:text-primary-content px-2"
            aria-label={t.footer.linkedinAria}
          >
            <LinkedinLogo className="w-6 h-6" />
          </a>
          <a
            href="https://github.com/AlexisBalayre"
            target="_blank"
            rel="noopener noreferrer"
            className="transition flex text-neutral-content hover:text-primary-content px-2"
            aria-label={t.footer.githubAria}
          >
            <GithubLogo className="w-6 h-6" />
          </a>
        </nav>
        <p className="text-center mt-2 text-xs md:text-sm">{fill(t.footer.copyright, { year: currentYear })}</p>
      </div>
    </footer>
  );
};
