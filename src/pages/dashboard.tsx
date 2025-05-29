import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardBody, Button, Progress, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/auth-context';
import { supabase, TestResult } from '../services/supabase';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [recentTests, setRecentTests] = React.useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
  
  React.useEffect(() => {
    const fetchRecentTests = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('test_results')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        setRecentTests(data as TestResult[]);
      } catch (err) {
        console.error('Error fetching recent tests:', err);
        setError(t('errors.generic'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentTests();
  }, [user, t]);
  
  // Calculate overall progress
  const calculateProgress = () => {
    if (!recentTests.length) return 0;
    
    const totalScore = recentTests.reduce((sum, test) => sum + test.score, 0);
    const maxScore = recentTests.reduce((sum, test) => sum + test.max_score, 0);
    
    return Math.round((totalScore / maxScore) * 100);
  };
  
  // Get the latest score for each test type
  const getLatestTestScore = (type: 'listening' | 'reading' | 'writing' | 'speaking') => {
    const test = recentTests.find(t => t.test_type === type);
    return test ? Math.round((test.score / test.max_score) * 100) : null;
  };
  
  const testModules = [
    { 
      type: 'listening' as const, 
      title: t('tests.listening.title'), 
      icon: 'lucide:headphones',
      color: 'primary',
      description: t('tests.listening.description')
    },
    { 
      type: 'reading' as const, 
      title: t('tests.reading.title'), 
      icon: 'lucide:book-open',
      color: 'secondary',
      description: t('tests.reading.description')
    },
    { 
      type: 'writing' as const, 
      title: t('tests.writing.title'), 
      icon: 'lucide:pen-tool',
      color: 'success',
      description: t('tests.writing.description')
    },
    { 
      type: 'speaking' as const, 
      title: t('tests.speaking.title'), 
      icon: 'lucide:mic',
      color: 'warning',
      description: t('tests.speaking.description')
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto max-w-6xl"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {t('dashboard.welcome')}, {profile?.username || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-default-500 mt-2">
          {t('dashboard.welcomeMessage')}
        </p>
      </motion.div>
      
      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Icon icon="lucide:award" className="text-primary-600 text-xl" />
            </div>
            <div>
              <p className="text-default-500 text-sm">{t('dashboard.points')}</p>
              <p className="text-2xl font-semibold">{profile?.total_points || 0}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-secondary-100 rounded-full">
              <Icon icon="lucide:check-circle" className="text-secondary-600 text-xl" />
            </div>
            <div>
              <p className="text-default-500 text-sm">{t('dashboard.testsCompleted')}</p>
              <p className="text-2xl font-semibold">{profile?.tests_completed || 0}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-success-100 rounded-full">
              <Icon icon="lucide:trending-up" className="text-success-600 text-xl" />
            </div>
            <div>
              <p className="text-default-500 text-sm">{t('dashboard.averageScore')}</p>
              <p className="text-2xl font-semibold">{calculateProgress()}%</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-warning-100 rounded-full">
              <Icon icon="lucide:trophy" className="text-warning-600 text-xl" />
            </div>
            <div>
              <p className="text-default-500 text-sm">{t('dashboard.rank')}</p>
              <p className="text-2xl font-semibold">#42</p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
      
      {/* Test Modules */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('nav.tests')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testModules.map((module) => {
            const score = getLatestTestScore(module.type);
            
            return (
              <Card key={module.type} className="overflow-visible">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 bg-${module.color}-100 rounded-full`}>
                      <Icon 
                        icon={module.icon} 
                        className={`text-${module.color}-600 text-xl`} 
                      />
                    </div>
                    <h3 className="font-semibold">{module.title}</h3>
                  </div>
                  
                  <p className="text-default-500 text-sm mb-4">
                    {module.description}
                  </p>
                  
                  {score !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('dashboard.lastScore')}</span>
                        <span className="font-medium">{score}%</span>
                      </div>
                      <Progress 
                        value={score} 
                        color={module.color as any} 
                        size="sm" 
                        aria-label={`${module.title} progress`}
                      />
                    </div>
                  )}
                  
                  <Button
                    as={Link}
                    to={`/test/${module.type}`}
                    color={module.color as any}
                    fullWidth
                  >
                    {score !== null ? t('dashboard.retakeTest') : t('dashboard.startTest')}
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </motion.div>
      
      {/* Recent Tests */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.recentTests')}</h2>
        <Card>
          <CardBody>
            {recentTests.length > 0 ? (
              <div className="divide-y divide-divider">
                {recentTests.map((test) => (
                  <div key={test.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">
                        {t(`tests.${test.test_type}.title`)}
                      </h4>
                      <p className="text-default-500 text-sm">
                        {new Date(test.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {test.score}/{test.max_score}
                        </p>
                        <p className="text-default-500 text-sm">
                          {Math.round((test.score / test.max_score) * 100)}%
                        </p>
                      </div>
                      <Button
                        as={Link}
                        to={`/results?test=${test.id}`}
                        variant="flat"
                        color="primary"
                        size="sm"
                      >
                        {t('dashboard.viewResults')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Icon icon="lucide:clipboard" className="text-default-300 text-4xl mx-auto mb-3" />
                <p className="text-default-500">{t('dashboard.noTests')}</p>
                <Button
                  as={Link}
                  to="/test/listening"
                  color="primary"
                  variant="flat"
                  className="mt-4"
                >
                  {t('dashboard.startFirstTest')}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;