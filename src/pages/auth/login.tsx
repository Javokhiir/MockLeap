import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Checkbox, Divider, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  
  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};
    
    if (!email) {
      newErrors.email = t('auth.invalidEmail');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.invalidEmail');
    }
    
    if (!password) {
      newErrors.password = t('auth.invalidPassword');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setErrors({ general: t('auth.loginFailed') });
        addToast({
          title: t('error'),
          description: t('auth.loginFailed'),
          severity: 'danger',
        });
      } else {
        addToast({
          title: t('success'),
          description: t('auth.loginSuccess'),
          severity: 'success',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({ general: t('errors.generic') });
      addToast({
        title: t('error'),
        description: t('errors.generic'),
        severity: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">{t('auth.login')}</h1>
        <p className="text-default-500 mt-2">{t('auth.loginToAccount')}</p>
      </div>
      
      {errors.general && (
        <div className="mb-4 p-3 bg-danger-100 border border-danger-200 text-danger-700 rounded-medium">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label={t('auth.email')}
          placeholder="email@example.com"
          value={email}
          onValueChange={setEmail}
          isInvalid={!!errors.email}
          errorMessage={errors.email}
          startContent={
            <Icon icon="lucide:mail" className="text-default-400" />
          }
          isRequired
        />
        
        <Input
          type="password"
          label={t('auth.password')}
          placeholder="••••••••"
          value={password}
          onValueChange={setPassword}
          isInvalid={!!errors.password}
          errorMessage={errors.password}
          startContent={
            <Icon icon="lucide:lock" className="text-default-400" />
          }
          isRequired
        />
        
        <div className="flex justify-between items-center">
          <Checkbox 
            isSelected={rememberMe} 
            onValueChange={setRememberMe}
            size="sm"
          >
            {t('auth.rememberMe')}
          </Checkbox>
          
          <Link 
            to="/forgot-password" 
            className="text-sm text-primary-600 hover:underline"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
        
        <Button
          type="submit"
          color="primary"
          isLoading={isLoading}
          fullWidth
        >
          {t('auth.login')}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-default-500">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;