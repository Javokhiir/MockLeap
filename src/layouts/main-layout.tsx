// Create the missing main-layout.tsx file
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../components/language-switcher';

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isBordered maxWidth="xl">
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2">
            <Icon icon="lucide:brain-circuit" className="text-primary-600 text-2xl" />
            <span className="font-bold text-xl text-foreground">{t('common.appName')}</span>
          </Link>
        </NavbarBrand>
        
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link to="/" className="text-foreground hover:text-primary-600 transition-colors">
              {t('nav.home')}
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link to="/about" className="text-foreground hover:text-primary-600 transition-colors">
              {t('nav.about')}
            </Link>
          </NavbarItem>
        </NavbarContent>
        
        <NavbarContent justify="end">
          <NavbarItem className="hidden sm:flex">
            <LanguageSwitcher />
          </NavbarItem>
          <NavbarItem>
            <Button 
              as={Link} 
              to="/login" 
              color="primary" 
              variant="flat"
            >
              {t('auth.login')}
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button 
              as={Link} 
              to="/register" 
              color="primary"
            >
              {t('auth.register')}
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="py-4 px-6 border-t border-divider">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-default-500">
            &copy; {new Date().getFullYear()} {t('common.appName')}
          </div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link to="/about" className="text-default-500 hover:text-primary-600 transition-colors">
              {t('nav.about')}
            </Link>
            <a href="#" className="text-default-500 hover:text-primary-600 transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-default-500 hover:text-primary-600 transition-colors">
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;