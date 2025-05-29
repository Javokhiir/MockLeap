// Create the missing settings.tsx file
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardBody, 
  Button, 
  Switch, 
  RadioGroup, 
  Radio,
  Divider,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/auth-context';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { profile, updateProfile } = useAuth();
  
  const [theme, setTheme] = React.useState('system');
  const [language, setLanguage] = React.useState(profile?.language_preference || 'en');
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [soundEffects, setSoundEffects] = React.useState(true);
  const [dataCollection, setDataCollection] = React.useState(true);
  const [cookies, setCookies] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  // Handle theme change
  const handleThemeChange = (value: string) => {
    setTheme(value);
    
    // Apply theme
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (value === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  // Handle language change
  const handleLanguageChange = async (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
    
    if (profile) {
      try {
        setIsUpdating(true);
        await updateProfile({ 
          language_preference: value as 'en' | 'ru' | 'uz' 
        });
      } catch (error) {
        console.error('Error updating language preference:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };
  
  // Save settings
  const handleSaveSettings = () => {
    // In a real implementation, we would save all settings to the user's profile
    // For now, we'll just show a success message
    
    addToast({
      title: t('success'),
      description: t('settings.saved'),
      severity: 'success',
    });
  };
  
  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('settings.appearance')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">{t('settings.theme')}</h3>
                  <RadioGroup
                    value={theme}
                    onValueChange={handleThemeChange}
                    orientation="horizontal"
                  >
                    <Radio value="light">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:sun" />
                        <span>{t('settings.light')}</span>
                      </div>
                    </Radio>
                    <Radio value="dark">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:moon" />
                        <span>{t('settings.dark')}</span>
                      </div>
                    </Radio>
                    <Radio value="system">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:laptop" />
                        <span>{t('settings.system')}</span>
                      </div>
                    </Radio>
                  </RadioGroup>
                </div>
                
                <Divider />
                
                <div>
                  <h3 className="text-lg font-medium mb-3">{t('settings.language')}</h3>
                  <RadioGroup
                    value={language}
                    onValueChange={handleLanguageChange}
                    isDisabled={isUpdating}
                  >
                    <Radio value="en">
                      <div className="flex items-center gap-2">
                        <Icon icon="logos:uk" width={20} height={20} />
                        <span>{t('settings.english')}</span>
                      </div>
                    </Radio>
                    <Radio value="ru">
                      <div className="flex items-center gap-2">
                        <Icon icon="logos:russia" width={20} height={20} />
                        <span>{t('settings.russian')}</span>
                      </div>
                    </Radio>
                    <Radio value="uz">
                      <div className="flex items-center gap-2">
                        <Icon icon="logos:uzbekistan" width={20} height={20} />
                        <span>{t('settings.uzbek')}</span>
                      </div>
                    </Radio>
                  </RadioGroup>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="mb-6">
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('settings.notifications')}</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t('settings.email')}</p>
                    <p className="text-default-500 text-sm">{t('settings.emailDescription')}</p>
                  </div>
                  <Switch 
                    isSelected={emailNotifications}
                    onValueChange={setEmailNotifications}
                  />
                </div>
                
                <Divider />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t('settings.push')}</p>
                    <p className="text-default-500 text-sm">{t('settings.pushDescription')}</p>
                  </div>
                  <Switch 
                    isSelected={pushNotifications}
                    onValueChange={setPushNotifications}
                  />
                </div>
                
                <Divider />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t('settings.sound')}</p>
                    <p className="text-default-500 text-sm">{t('settings.soundDescription')}</p>
                  </div>
                  <Switch 
                    isSelected={soundEffects}
                    onValueChange={setSoundEffects}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('settings.privacy')}</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t('settings.dataCollection')}</p>
                    <p className="text-default-500 text-sm">{t('settings.dataCollectionDescription')}</p>
                  </div>
                  <Switch 
                    isSelected={dataCollection}
                    onValueChange={setDataCollection}
                  />
                </div>
                
                <Divider />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t('settings.cookies')}</p>
                    <p className="text-default-500 text-sm">{t('settings.cookiesDescription')}</p>
                  </div>
                  <Switch 
                    isSelected={cookies}
                    onValueChange={setCookies}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button 
              color="primary"
              onPress={handleSaveSettings}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
        
        <div>
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('settings.about')}</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-default-500 text-sm">{t('settings.version')}</p>
                  <p className="font-medium">1.0.0</p>
                </div>
                
                <div>
                  <p className="text-default-500 text-sm">{t('settings.buildDate')}</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                
                <Divider />
                
                <div className="pt-2">
                  <Button
                    variant="flat"
                    color="primary"
                    fullWidth
                    startContent={<Icon icon="lucide:help-circle" />}
                  >
                    {t('settings.help')}
                  </Button>
                </div>
                
                <div>
                  <Button
                    variant="flat"
                    color="primary"
                    fullWidth
                    startContent={<Icon icon="lucide:file-text" />}
                  >
                    {t('settings.termsOfService')}
                  </Button>
                </div>
                
                <div>
                  <Button
                    variant="flat"
                    color="primary"
                    fullWidth
                    startContent={<Icon icon="lucide:shield" />}
                  >
                    {t('settings.privacyPolicy')}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;