"use client";

import { setLocale, useLocale, type Locale } from "@/lib/locale";

const OPTIONS: { locale: Locale; label: string; name: string }[] = [
  { locale: "en", label: "EN", name: "English" },
  { locale: "ha", label: "HA", name: "Hausa" },
];

export function LanguageSwitch() {
  const language = useLocale();

  return (
    <div className="language-switch" role="group" aria-label="Language">
      {OPTIONS.map((option) => (
        <button
          key={option.locale}
          type="button"
          className={language === option.locale ? "active" : ""}
          onClick={() => setLocale(option.locale)}
          aria-pressed={language === option.locale}
          lang={option.locale}
          title={option.name}
          data-testid={`button-language-${option.locale}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
