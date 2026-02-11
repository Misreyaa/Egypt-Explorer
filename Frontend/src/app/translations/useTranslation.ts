import { useUser } from '../context/UserContext';
import { translations, LanguageCode, TranslationKey } from './index';

export function useTranslation() {
  const { user } = useUser();
  const currentLanguage = (user?.appLanguage || 'English') as LanguageCode;
  
  const t = (key: TranslationKey): string => {
    return translations[currentLanguage]?.[key] || translations.English[key] || key;
  };
  
  return { t, currentLanguage };
}
