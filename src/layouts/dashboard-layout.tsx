import React from 'react';
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
  Link
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  User
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/auth-context';
import LanguageSwitcher from '../components/language-switcher';

const DashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [isAdmin, setIsAdmin] = React.useState(false);

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: 'lucide:home' },
    { path: '/test/listening', label: t('tests.listening.title'), icon: 'lucide:headphones' },
    { path: '/test/reading', label: t('tests.reading.title'), icon: 'lucide:book-open' },
    { path: '/test/writing', label: t('tests.writing.title'), icon: 'lucide:pen-tool' },
    { path: '/test/speaking', label: t('tests.speaking.title'), icon: 'lucide:mic' },
    { path: '/leaderboard', label: t('nav.leaderboard'), icon: 'lucide:trophy' },
    { path: '/profile', label: t('nav.profile'), icon: 'lucide:user' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  React.useEffect(() => {
    if (user) {
      import('../services/mock-backend').then(({ adminAPI }) => {
        const admin = adminAPI.isAdmin(user.id);
        setIsAdmin(admin);
      });
    }
  }, [user]);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && location.pathname.includes('/test/')) {
        console.log('Tab switching detected during test!');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location]);

  return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Top Navbar (hidden on small screens) */}
        <Navbar isBordered maxWidth="xl" className="hidden sm:flex">
          <NavbarBrand>
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <Icon icon="lucide:brain-circuit" className="text-primary-600 text-2xl" />
              <span className="font-bold text-xl text-foreground">{t('common.appName')}</span>
            </NavLink>
          </NavbarBrand>

          <NavbarContent className="gap-4" justify="center">
            {navItems.map((item) => (
                <NavbarItem key={item.path}>
                  <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                          isActive
                              ? 'text-primary-600 font-medium'
                              : 'text-foreground hover:text-primary-600 transition-colors'
                      }
                  >
                    {item.label}
                  </NavLink>
                </NavbarItem>
            ))}
          </NavbarContent>

          <NavbarContent justify="end">
            <NavbarItem>
              <LanguageSwitcher />
            </NavbarItem>

            {isAdmin && (
                <NavbarItem>
                  <Button
                      as={Link}
                      to="/admin"
                      variant="flat"
                      color="secondary"
                      startContent={<Icon icon="lucide:shield" />}
                  >
                    Admin
                  </Button>
                </NavbarItem>
            )}

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button variant="light" className="p-0 bg-transparent">
                  <Avatar
                      name={profile?.username || user?.email?.charAt(0) || 'U'}
                      src={profile?.avatar_url}
                      size="sm"
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Menu">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <User
                      name={profile?.username || user?.email?.split('@')[0]}
                      description={user?.email}
                      avatarProps={{
                        name: profile?.username || user?.email?.charAt(0) || 'U',
                        src: profile?.avatar_url
                      }}
                  />
                </DropdownItem>
                <DropdownItem key="settings">
                  <NavLink to="/settings" className="flex items-center gap-2">
                    <Icon icon="lucide:settings" />
                    {t('nav.settings')}
                  </NavLink>
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onPress={handleSignOut}>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:log-out" />
                    {t('auth.logout')}
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarContent>
        </Navbar>

        {/* Page content */}
        <main className="flex-grow p-4 sm:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-divider">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-default-500">
              &copy; {new Date().getFullYear()} {t('common.appName')}
            </div>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <a href="#" className="text-default-500 hover:text-primary-600 transition-colors">
                {t('nav.about')}
              </a>
              <a href="#" className="text-default-500 hover:text-primary-600 transition-colors">
                {t('footer.privacy')}
              </a>
              <a href="#" className="text-default-500 hover:text-primary-600 transition-colors">
                {t('footer.terms')}
              </a>
            </div>
          </div>
        </footer>

        {/* Bottom Navbar (mobile only) */}
        <AnimatePresence>
          <motion.nav
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-md"
          >
            <div className="flex justify-around items-center py-2 px-4">
              {navItems.slice(0, 5).map((item) => (
                  <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                          `flex flex-col items-center text-xs ${
                              isActive ? 'text-primary-600' : 'text-default-500'
                          }`
                      }
                  >
                    <Icon icon={item.icon} width={22} height={22} />
                    <span>{item.label}</span>
                  </NavLink>
              ))}
            </div>
            <div className="border-t border-divider flex justify-around py-2 px-4">
              <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                      `flex flex-col items-center text-xs ${
                          isActive ? 'text-primary-600' : 'text-default-500'
                      }`
                  }
              >
                <Icon icon="lucide:user" width={22} height={22} />
                <span>{t('nav.profile')}</span>
              </NavLink>

              <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                      `flex flex-col items-center text-xs ${
                          isActive ? 'text-primary-600' : 'text-default-500'
                      }`
                  }
              >
                <Icon icon="lucide:settings" width={22} height={22} />
                <span>{t('nav.settings')}</span>
              </NavLink>

              {isAdmin && (
                  <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                          `flex flex-col items-center text-xs ${
                              isActive ? 'text-secondary-600' : 'text-default-500'
                          }`
                      }
                  >
                    <Icon icon="lucide:shield" width={22} height={22} />
                    <span>Admin</span>
                  </NavLink>
              )}
            </div>
          </motion.nav>
        </AnimatePresence>
      </div>
  );
};

export default DashboardLayout;
