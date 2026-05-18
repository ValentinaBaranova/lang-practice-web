import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="py-4 px-4 text-center text-slate-400 text-sm">
      <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
        <span>{t("builtBy")} Valentina Baranova</span>
        <span className="hidden sm:inline text-slate-300">·</span>
        <a 
          href="https://www.linkedin.com/in/valentinabaranova/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-indigo-600 transition-colors"
        >
          LinkedIn
        </a>
        <span className="hidden sm:inline text-slate-300">·</span>
        <a 
          href="https://github.com/valentinabaranova" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-indigo-600 transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
