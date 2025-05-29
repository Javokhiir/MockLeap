// Create the missing results.tsx file
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Card, 
  CardBody, 
  Button, 
  Progress, 
  Spinner, 
  Tabs, 
  Tab, 
  Chip,
  Divider,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/auth-context';
import { supabase, TestResult } from '../services/supabase';
import jsPDF from 'jspdf';

const Results: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('test');
  
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isGeneratingCertificate, setIsGeneratingCertificate] = React.useState(false);
  const [allTestsCompleted, setAllTestsCompleted] = React.useState(false);
  
  // Fetch test result
  React.useEffect(() => {
    const fetchTestResult = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        if (testId) {
          // Fetch specific test result
          const { data, error } = await supabase
            .from('test_results')
            .select('*')
            .eq('id', testId)
            .single();
          
          if (error) throw error;
          
          setTestResult(data as TestResult);
        } else {
          // Fetch most recent test result
          const { data, error } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();
          
          if (error) throw error;
          
          setTestResult(data as TestResult);
        }
        
        // Check if user has completed all test types
        const { data: testTypes, error: typesError } = await supabase
          .from('test_results')
          .select('test_type')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });
        
        if (typesError) throw typesError;
        
        const uniqueTestTypes = new Set(testTypes.map(t => t.test_type));
        setAllTestsCompleted(
          uniqueTestTypes.has('listening') && 
          uniqueTestTypes.has('reading') && 
          uniqueTestTypes.has('writing') && 
          uniqueTestTypes.has('speaking')
        );
        
      } catch (err) {
        console.error('Error fetching test result:', err);
        setError(t('errors.generic'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTestResult();
  }, [user, testId, t]);
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Generate certificate
  const generateCertificate = async () => {
    if (!testResult || !profile) return;
    
    setIsGeneratingCertificate(true);
    
    try {
      // Create PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add background color
      doc.setFillColor(240, 240, 255);
      doc.rect(0, 0, 297, 210, 'F');
      
      // Add border
      doc.setDrawColor(70, 130, 180);
      doc.setLineWidth(5);
      doc.rect(10, 10, 277, 190);
      
      // Add title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(30);
      doc.setTextColor(50, 50, 150);
      doc.text('CERTIFICATE OF COMPLETION', 148.5, 40, { align: 'center' });
      
      // Add RealMockTest title
      doc.setFontSize(18);
      doc.text('RealMockTest AI Assistant', 148.5, 55, { align: 'center' });
      
      // Add line
      doc.setLineWidth(1);
      doc.line(74, 60, 223, 60);
      
      // Add certificate text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text('This is to certify that', 148.5, 80, { align: 'center' });
      
      // Add name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(50, 50, 150);
      doc.text(profile.full_name || profile.username, 148.5, 95, { align: 'center' });
      
      // Add completion text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text('has successfully completed the IELTS preparation test with the following scores:', 148.5, 110, { align: 'center' });
      
      // Add scores
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Listening:', 90, 130);
      doc.text('Reading:', 90, 140);
      doc.text('Writing:', 90, 150);
      doc.text('Speaking:', 90, 160);
      doc.text('Overall Score:', 90, 175);
      
      // Add score values (these would come from actual test results in a real implementation)
      doc.setFont('helvetica', 'normal');
      doc.text('7.5', 170, 130);
      doc.text('8.0', 170, 140);
      doc.text('7.0', 170, 150);
      doc.text('7.5', 170, 160);
      doc.text('7.5', 170, 175);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Date: ${formatDate(new Date().toISOString())}`, 148.5, 190, { align: 'center' });
      
      // Save the PDF
      const pdfBlob = doc.output('blob');
      
      // In a real implementation, we would upload this to Supabase Storage
      // and save the URL to the user's profile or test session
      
      // For now, just download it
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `realmocktest-certificate-${profile.username}.pdf`;
      link.click();
      
      addToast({
        title: t('success'),
        description: t('results.certificateGenerated'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      addToast({
        title: t('error'),
        description: t('errors.generic'),
        severity: 'danger',
      });
    } finally {
      setIsGeneratingCertificate(false);
    }
  };
  
  // Share certificate
  const shareCertificate = () => {
    // In a real implementation, this would share via Telegram bot or other channels
    addToast({
      title: t('info'),
      description: t('results.shareFeatureComingSoon'),
      severity: 'info',
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }
  
  if (error || !testResult) {
    return (
      <div className="container mx-auto max-w-6xl">
        <Card>
          <CardBody className="p-6 text-center">
            <Icon icon="lucide:alert-circle" className="text-danger text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('error')}</h2>
            <p className="text-default-600 mb-4">
              {error || t('results.noTestFound')}
            </p>
            <Button 
              as={Link} 
              to="/dashboard" 
              color="primary"
            >
              {t('nav.dashboard')}
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }
  
  // Calculate score out of 9 (IELTS standard)
  const scoreOutOf9 = (testResult.score / 10).toFixed(1);
  
  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">{t('results.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {t(`tests.${testResult.test_type}.title`)}
                  </h2>
                  <p className="text-default-500">
                    {formatDate(testResult.completed_at)}
                  </p>
                </div>
                
                <Chip 
                  color="primary" 
                  variant="flat" 
                  size="lg" 
                  className="mt-2 md:mt-0"
                >
                  {t('results.score')}: {scoreOutOf9}/9.0
                </Chip>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-default-50 rounded-medium">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-default-600">{t('results.duration')}</span>
                    <span className="font-medium">{formatDuration(testResult.duration)}</span>
                  </div>
                </div>
                
                <div className="p-4 bg-default-50 rounded-medium">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-default-600">{t('results.scorePercentage')}</span>
                    <span className="font-medium">
                      {Math.round((testResult.score / testResult.max_score) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{t('results.breakdown')}</h3>
                
                <div className="space-y-4">
                  {/* This would be populated with actual breakdown data in a real implementation */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-default-600">{t('aiAssistant.grammar')}</span>
                      <span className="font-medium">7.5/9.0</span>
                    </div>
                    <Progress value={75} color="primary" size="sm" aria-label="Grammar score" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-default-600">{t('aiAssistant.vocabulary')}</span>
                      <span className="font-medium">8.0/9.0</span>
                    </div>
                    <Progress value={80} color="primary" size="sm" aria-label="Vocabulary score" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-default-600">{t('aiAssistant.coherence')}</span>
                      <span className="font-medium">7.0/9.0</span>
                    </div>
                    <Progress value={70} color="primary" size="sm" aria-label="Coherence score" />
                  </div>
                  
                  {testResult.test_type === 'speaking' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-default-600">{t('aiAssistant.pronunciation')}</span>
                        <span className="font-medium">7.0/9.0</span>
                      </div>
                      <Progress value={70} color="primary" size="sm" aria-label="Pronunciation score" />
                    </div>
                  )}
                </div>
              </div>
              
              <Tabs aria-label="Feedback tabs">
                <Tab key="strengths" title={t('results.strengths')}>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {testResult.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Icon icon="lucide:check-circle" className="text-success mt-1" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tab>
                <Tab key="weaknesses" title={t('results.weaknesses')}>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {testResult.weaknesses?.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Icon icon="lucide:alert-circle" className="text-warning mt-1" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tab>
                <Tab key="recommendations" title={t('results.recommendations')}>
                  <div className="p-4">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Icon icon="lucide:lightbulb" className="text-primary mt-1" />
                        <span>{t('results.recommendation1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon icon="lucide:lightbulb" className="text-primary mt-1" />
                        <span>{t('results.recommendation2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon icon="lucide:lightbulb" className="text-primary mt-1" />
                        <span>{t('results.recommendation3')}</span>
                      </li>
                    </ul>
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
          
          <div className="flex flex-wrap gap-3">
            <Button
              as={Link}
              to="/dashboard"
              variant="flat"
              startContent={<Icon icon="lucide:arrow-left" />}
            >
              {t('nav.dashboard')}
            </Button>
            
            <Button
              as={Link}
              to={`/test/${testResult.test_type}`}
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:refresh-cw" />}
            >
              {t('results.retakeTest')}
            </Button>
          </div>
        </div>
        
        <div>
          <Card>
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('results.certificate')}</h3>
              
              {allTestsCompleted ? (
                <div>
                  <div className="mb-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center bg-primary-100 rounded-full">
                      <Icon icon="lucide:award" className="text-primary text-4xl" />
                    </div>
                    <h4 className="font-semibold mb-1">{t('results.certificateAvailable')}</h4>
                    <p className="text-default-500 text-sm">
                      {t('results.certificateDescription')}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      color="primary"
                      fullWidth
                      startContent={<Icon icon="lucide:download" />}
                      onPress={generateCertificate}
                      isLoading={isGeneratingCertificate}
                    >
                      {t('results.downloadCertificate')}
                    </Button>
                    
                    <Button
                      color="secondary"
                      variant="flat"
                      fullWidth
                      startContent={<Icon icon="lucide:share-2" />}
                      onPress={shareCertificate}
                    >
                      {t('results.shareCertificate')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <Icon icon="lucide:lock" className="text-default-400 text-4xl mx-auto mb-3" />
                  <h4 className="font-semibold mb-1">{t('results.certificateLocked')}</h4>
                  <p className="text-default-500 text-sm mb-4">
                    {t('results.noCertificate')}
                  </p>
                  
                  <div className="space-y-2 mt-4">
                    {!['listening', 'reading', 'writing', 'speaking'].includes(testResult.test_type) && (
                      <Button
                        as={Link}
                        to="/test/listening"
                        variant="flat"
                        color="primary"
                        fullWidth
                        startContent={<Icon icon="lucide:headphones" />}
                      >
                        {t('tests.listening.title')}
                      </Button>
                    )}
                    
                    {!['reading', 'writing', 'speaking'].includes(testResult.test_type) && (
                      <Button
                        as={Link}
                        to="/test/reading"
                        variant="flat"
                        color="primary"
                        fullWidth
                        startContent={<Icon icon="lucide:book-open" />}
                      >
                        {t('tests.reading.title')}
                      </Button>
                    )}
                    
                    {!['writing', 'speaking'].includes(testResult.test_type) && (
                      <Button
                        as={Link}
                        to="/test/writing"
                        variant="flat"
                        color="primary"
                        fullWidth
                        startContent={<Icon icon="lucide:pen-tool" />}
                      >
                        {t('tests.writing.title')}
                      </Button>
                    )}
                    
                    {!['speaking'].includes(testResult.test_type) && (
                      <Button
                        as={Link}
                        to="/test/speaking"
                        variant="flat"
                        color="primary"
                        fullWidth
                        startContent={<Icon icon="lucide:mic" />}
                      >
                        {t('tests.speaking.title')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
          
          <Card className="mt-6">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('results.overallProgress')}</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-default-600">{t('results.listening')}</span>
                    <span className="font-medium">7.5/9.0</span>
                  </div>
                  <Progress value={75} color="primary" size="sm" aria-label="Listening score" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-default-600">{t('results.reading')}</span>
                    <span className="font-medium">8.0/9.0</span>
                  </div>
                  <Progress value={80} color="secondary" size="sm" aria-label="Reading score" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-default-600">{t('results.writing')}</span>
                    <span className="font-medium">7.0/9.0</span>
                  </div>
                  <Progress value={70} color="success" size="sm" aria-label="Writing score" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-default-600">{t('results.speaking')}</span>
                    <span className="font-medium">7.5/9.0</span>
                  </div>
                  <Progress value={75} color="warning" size="sm" aria-label="Speaking score" />
                </div>
                
                <Divider className="my-3" />
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{t('results.overall')}</span>
                    <span className="font-bold">7.5/9.0</span>
                  </div>
                  <Progress value={75} color="primary" size="md" aria-label="Overall score" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Results;