import { useState } from 'react';

export function LanguageSwitch() {
  const [language, setLanguage] = useState<'EN' | 'HA'>('EN');

  return (
    <div className="language-switch" role="group" aria-label="Language">
      {(['EN', 'HA'] as const).map((option) => (
        <button
          key={option}
          type="button"
          className={language === option ? 'active' : ''}
          onClick={() => setLanguage(option)}
          aria-pressed={language === option}
          data-testid={`button-language-${option.toLowerCase()}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}