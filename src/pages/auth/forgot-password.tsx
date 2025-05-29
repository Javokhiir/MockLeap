import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Input, Button, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(t('auth.resetFailed'));
        addToast({
          title: t('error'),
          description: t('auth.resetFailed'),
          severity: 'danger',
        });
      } else {
        setIsSubmitted(true);
        addToast({
          title: t('success'),
          description: t('auth.passwordResetSent'),
          severity: 'success',
        });
      }
    } catch (err) {
      setError(t('errors.generic'));
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
        <h1 className="text-2xl font-bold text-foreground">{t('auth.forgotPassword')}</h1>
        <p className="text-default-500 mt-2">{t('auth.resetPasswordInstructions')}</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-danger-100 border border-danger-200 text-danger-700 rounded-medium">
          {error}
        </div>
      )}
      
      {isSubmitted ? (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-success-100 text-success rounded-full flex items-center justify-center">
              <Icon icon="lucide:check" width={32} height={32} />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">{t('auth.passwordResetSent')}</h3>
          <p className="text-default-500 mb-4">
            {t('auth.checkEmailForInstructions')}
          </p>
          <Button 
            as={Link} 
            to="/login" 
            color="primary" 
            variant="flat" 
            fullWidth
          >
            {t('auth.backToLogin')}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label={t('auth.email')}
            placeholder="email@example.com"
            value={email}
            onValueChange={setEmail}
            isInvalid={!!error}
            startContent={
              <Icon icon="lucide:mail" className="text-default-400" />
            }
            isRequired
          />
          
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            fullWidth
          >
            {t('auth.resetPassword')}
          </Button>
          
          <div className="text-center">
            <Link to="/login" className="text-primary-600 hover:underline text-sm">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPassword;