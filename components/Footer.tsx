import { GithubLogo } from "../public/assets/logos/GithubLogo";
import { LinkedinLogo } from "../public/assets/logos/LinkedinLogo";
import { XLogo } from "../public/assets/logos/XLogo";

/**
 * Site footer
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <div className="min-h-0 p-4 md:py-5 md:px-1 md:mb-11 lg:mb-0 md:relative">
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-4 text-sm w-full">
            <div className="text-center pr-2 pl-2">
              <a
                href="https://www.linkedin.com/in/alexis-balayre"
                target="_blank"
                rel="noopener noreferrer"
                className="transition text-neutral-content hover:text-primary-content"
                aria-label="Linkedin of Alexis Balayre"
              >
                <LinkedinLogo className="w-6 h-6" />
              </a>
            </div>
            <div className="text-center pr-2 pl-2">
              <a
                href="https://github.com/AlexisBalayre"
                target="_blank"
                rel="noopener noreferrer"
                className="transition flex text-neutral-content hover:text-primary-content"
                aria-label="Github of Alexis Balayre"
              >
                <GithubLogo className="w-6 h-6" />
              </a>
            </div>
            <div className="flex text-center pr-2 pl-2">
              <a
                href="https://twitter.com/Belas_Eth"
                target="_blank"
                rel="noopener noreferrer"
                className="transition flex text-neutral-content hover:text-primary-content"
                aria-label="Twitter of Alexis Balayre"
              >
                <XLogo className="w-6 h-6" />
              </a>
            </div>
          </div>
        </ul>
        <p className="text-center mt-2 text-xs md:text-sm">
          Copyright © {currentYear} Alexis Balayre. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};
