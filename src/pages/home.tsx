// Create the missing home.tsx file
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const { t } = useTranslation();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };
  
  const features = [
    {
      icon: 'lucide:headphones',
      title: t('tests.listening.title'),
      description: t('tests.listening.description')
    },
    {
      icon: 'lucide:book-open',
      title: t('tests.reading.title'),
      description: t('tests.reading.description')
    },
    {
      icon: 'lucide:pen-tool',
      title: t('tests.writing.title'),
      description: t('tests.writing.description')
    },
    {
      icon: 'lucide:mic',
      title: t('tests.speaking.title'),
      description: t('tests.speaking.description')
    }
  ];
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl text-default-600 mb-8">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  as={Link}
                  to="/register"
                  color="primary"
                  size="lg"
                  startContent={<Icon icon="lucide:user-plus" />}
                >
                  {t('auth.register')}
                </Button>
                <Button 
                  as={Link}
                  to="/login"
                  variant="flat"
                  color="primary"
                  size="lg"
                  startContent={<Icon icon="lucide:log-in" />}
                >
                  {t('auth.login')}
                </Button>
              </div>
            </motion.div>
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <img 
                src="https://img.heroui.chat/image/ai?w=600&h=400&u=language-learning" 
                alt="RealMockTest AI Assistant"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">{t('home.features.title')}</h2>
            <p className="text-xl text-default-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full">
                  <CardBody className="p-6">
                    <div className="mb-4 p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full w-12 h-12 flex items-center justify-center">
                      <Icon icon={feature.icon} className="text-primary-600 dark:text-primary-400 text-2xl" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-default-600">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-default-50 dark:bg-default-900/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">{t('home.howItWorks.title')}</h2>
            <p className="text-xl text-default-600 max-w-2xl mx-auto">
              {t('home.howItWorks.subtitle')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 mx-auto p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                <Icon icon="lucide:user-check" className="text-primary-600 dark:text-primary-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.howItWorks.step1.title')}</h3>
              <p className="text-default-600">{t('home.howItWorks.step1.description')}</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 mx-auto p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                <Icon icon="lucide:clipboard-check" className="text-primary-600 dark:text-primary-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.howItWorks.step2.title')}</h3>
              <p className="text-default-600">{t('home.howItWorks.step2.description')}</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 mx-auto p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                <Icon icon="lucide:award" className="text-primary-600 dark:text-primary-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.howItWorks.step3.title')}</h3>
              <p className="text-default-600">{t('home.howItWorks.step3.description')}</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            className="bg-primary-600 dark:bg-primary-800 rounded-xl p-8 md:p-12 text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              {t('home.cta.subtitle')}
            </p>
            <Button 
              as={Link}
              to="/register"
              size="lg"
              color="default"
              variant="solid"
              className="bg-white text-primary-600 hover:bg-gray-100"
              startContent={<Icon icon="lucide:arrow-right" />}
            >
              {t('home.cta.button')}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;