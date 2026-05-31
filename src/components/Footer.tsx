import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="py-4 px-4 text-center text-slate-400 text-sm">
      <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
        <span>
          {t("builtBy")}{" "}
          <a 
            href="https://valentinabaranova.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center"
          >
            <span className="underline">Valentina Baranova</span>
            <ArrowUpRight className="ml-0.5 h-3 w-3" />
          </a>
        </span>
      </div>
    </footer>
  );
}
