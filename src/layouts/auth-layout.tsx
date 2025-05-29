import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../components/language-switcher';

const AuthLayout: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <header className="w-full py-4 px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Icon icon="lucide:brain-circuit" className="text-primary-600 text-2xl" />
          <span className="font-bold text-xl text-foreground">{t('common.appName')}</span>
        </Link>
        <LanguageSwitcher />
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg">
            <CardBody className="p-6 sm:p-8">
              <Outlet />
            </CardBody>
          </Card>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              {t('common.appName')} &copy; {new Date().getFullYear()}
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AuthLayout;