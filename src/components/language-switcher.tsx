import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/auth-context';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { profile, updateProfile } = useAuth();

  const languages = [
    { code: 'en', name: t('settings.english'), icon: 'emojione-v1:flag-for-united-kingdom' },
    { code: 'ru', name: t('settings.russian'), icon: 'emojione-v1:flag-for-russia' },
    { code: 'uz', name: t('settings.uzbek'), icon: 'emojione-v1:flag-for-uzbekistan' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    i18n.changeLanguage(langCode);
    if (profile) {
      await updateProfile({ language_preference: langCode as 'en' | 'ru' | 'uz' });
    }
  };

  return (
      <Dropdown>
        <DropdownTrigger>
          <Button
              variant="light"
              className="min-w-0 px-2"
              startContent={<Icon icon={currentLanguage.icon} width={20} height={20} />}
              endContent={
                <Icon
                    icon="lucide:chevron-down"
                    className="text-default-500 hidden sm:inline"
                    width={16}
                    height={16}
                />
              }
          >
            {/* Tiling nomi faqat sm va undan yuqori ekranlarda ko‘rinadi */}
            <span className="hidden sm:inline ml-1">{currentLanguage.name}</span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
            aria-label="Language selection"
            onAction={(key) => handleLanguageChange(key as string)}
        >
          {languages.map((lang) => (
              <DropdownItem
                  key={lang.code}
                  startContent={<Icon icon={lang.icon} width={20} height={20} />}
                  className={i18n.language === lang.code ? 'text-primary' : ''}
              >
                {lang.name}
              </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
  );
};

export default LanguageSwitcher;
