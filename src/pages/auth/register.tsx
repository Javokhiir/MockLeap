import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Checkbox, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
    terms?: string;
    general?: string;
  }>({});
  
  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      username?: string;
      terms?: string;
    } = {};
    
    if (!email) {
      newErrors.email = t('auth.invalidEmail');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.invalidEmail');
    }
    
    if (!password) {
      newErrors.password = t('auth.invalidPassword');
    } else if (password.length < 6) {
      newErrors.password = t('auth.invalidPassword');
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDontMatch');
    }
    
    if (!username) {
      newErrors.username = t('auth.invalidUsername');
    } else if (username.length < 3) {
      newErrors.username = t('auth.invalidUsername');
    }
    
    if (!acceptTerms) {
      newErrors.terms = t('auth.acceptTermsRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, username);
      
      if (error) {
        if (error.message?.includes('email')) {
          setErrors({ email: t('auth.emailExists') });
        } else if (error.message?.includes('username')) {
          setErrors({ username: t('auth.usernameExists') });
        } else {
          setErrors({ general: t('auth.registerFailed') });
        }
        
        addToast({
          title: t('error'),
          description: error.message || t('auth.registerFailed'),
          severity: 'danger',
        });
      } else {
        addToast({
          title: t('success'),
          description: t('auth.registerSuccess'),
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
        <h1 className="text-2xl font-bold text-foreground">{t('auth.register')}</h1>
        <p className="text-default-500 mt-2">{t('auth.createAccount')}</p>
      </div>
      
      {errors.general && (
        <div className="mb-4 p-3 bg-danger-100 border border-danger-200 text-danger-700 rounded-medium">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label={t('auth.username')}
          placeholder="johndoe"
          value={username}
          onValueChange={setUsername}
          isInvalid={!!errors.username}
          errorMessage={errors.username}
          startContent={
            <Icon icon="lucide:user" className="text-default-400" />
          }
          isRequired
        />
        
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
        
        <Input
          type="password"
          label={t('auth.confirmPassword')}
          placeholder="••••••••"
          value={confirmPassword}
          onValueChange={setConfirmPassword}
          isInvalid={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword}
          startContent={
            <Icon icon="lucide:lock" className="text-default-400" />
          }
          isRequired
        />
        
        <Checkbox 
          isSelected={acceptTerms} 
          onValueChange={setAcceptTerms}
          isInvalid={!!errors.terms}
          size="sm"
        >
          <span className="text-sm">
            {t('auth.acceptTerms')}{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">
              {t('auth.termsOfService')}
            </Link>
          </span>
        </Checkbox>
        
        <Button
          type="submit"
          color="primary"
          isLoading={isLoading}
          fullWidth
        >
          {t('auth.register')}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-default-500">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;