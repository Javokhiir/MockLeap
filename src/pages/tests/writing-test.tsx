import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardBody, 
  Button, 
  Textarea, 
  Tabs, 
  Tab, 
  Progress, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Spinner,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';
import { supabase } from '../../services/supabase';
import { analyzeWriting, WritingFeedback } from '../../services/ai-service';
import TestTimer from '../../components/test-timer';

type WritingTask = {
  id: string;
  type: 'task1' | 'task2';
  title: string;
  description: string;
  prompt: string;
  imageUrl?: string;
  minWords: number;
  maxWords: number;
  timeInMinutes: number;
};

const WritingTest: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [currentTask, setCurrentTask] = React.useState<'task1' | 'task2'>('task1');
  const [essay, setEssay] = React.useState({ task1: '', task2: '' });
  const [wordCount, setWordCount] = React.useState({ task1: 0, task2: 0 });
  const [timeRemaining, setTimeRemaining] = React.useState(60 * 60); // 60 minutes
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<WritingFeedback | null>(null);
  const [isTestStarted, setIsTestStarted] = React.useState(false);
  const [isTestCompleted, setIsTestCompleted] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  
  // Mock writing tasks
  const writingTasks: Record<string, WritingTask> = {
    task1: {
      id: 'task1',
      type: 'task1',
      title: t('tests.writing.task1Title'),
      description: t('tests.writing.task1Description'),
      prompt: 'The chart below shows the percentage of households with access to the internet in three different countries between 2000 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      imageUrl: 'https://img.heroui.chat/image/dashboard?w=600&h=400&u=chart1',
      minWords: 150,
      maxWords: 200,
      timeInMinutes: 20
    },
    task2: {
      id: 'task2',
      type: 'task2',
      title: t('tests.writing.task2Title'),
      description: t('tests.writing.task2Description'),
      prompt: 'Some people believe that technology has made our lives too complex and that we should return to a simpler way of living without so much technology. To what extent do you agree or disagree with this view?',
      minWords: 250,
      maxWords: 300,
      timeInMinutes: 40
    }
  };
  
  // Calculate word count
  const calculateWordCount = (text: string): number => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };
  
  // Handle essay change
  const handleEssayChange = (value: string) => {
    setEssay(prev => ({ ...prev, [currentTask]: value }));
    setWordCount(prev => ({ 
      ...prev, 
      [currentTask]: calculateWordCount(value) 
    }));
  };
  
  // Handle task change
  const handleTaskChange = (key: React.Key) => {
    setCurrentTask(key as 'task1' | 'task2');
  };
  
  // Start the test
  const handleStartTest = () => {
    setIsTestStarted(true);
  };
  
  // Submit the test
  const handleSubmitTest = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // First, analyze the writing with AI
      setIsAnalyzing(true);
      
      // Analyze both tasks
      const task1Feedback = await analyzeWriting(
        essay.task1, 
        'task1', 
        writingTasks.task1.prompt
      );
      
      const task2Feedback = await analyzeWriting(
        essay.task2, 
        'task2', 
        writingTasks.task2.prompt
      );
      
      // Calculate overall score (average of both tasks)
      const overallScore = (task1Feedback.score + task2Feedback.score) / 2;
      
      // Combine feedback
      const combinedFeedback = {
        task1: task1Feedback,
        task2: task2Feedback,
        overall: overallScore
      };
      
      // Save test result to Supabase
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          test_type: 'writing',
          score: Math.round(overallScore * 10), // Store as 0-90 score
          max_score: 90, // IELTS is scored out of 9, we multiply by 10
          duration: 60 * 60 - timeRemaining, // Time taken in seconds
          completed_at: new Date().toISOString(),
          feedback: JSON.stringify(combinedFeedback),
          strengths: [...task1Feedback.strengths, ...task2Feedback.strengths],
          weaknesses: [...task1Feedback.weaknesses, ...task2Feedback.weaknesses]
        })
        .select();
      
      if (error) throw error;
      
      // Update user's total points and tests completed
      await supabase.rpc('increment_user_stats', {
        user_id: user.id,
        points_to_add: Math.round(overallScore * 10),
        tests_to_add: 1
      });
      
      setFeedback(task1Feedback); // Show task 1 feedback initially
      setIsTestCompleted(true);
      
      addToast({
        title: t('success'),
        description: t('tests.testCompleted'),
        severity: 'success',
      });
      
      // Navigate to results page
      if (data && data[0]) {
        navigate(`/results?test=${data[0].id}`);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      addToast({
        title: t('error'),
        description: t('errors.generic'),
        severity: 'danger',
      });
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
      onClose();
    }
  };
  
  // Confirm test submission
  const confirmSubmit = () => {
    // Check if both tasks meet minimum word count
    if (wordCount.task1 < writingTasks.task1.minWords || 
        wordCount.task2 < writingTasks.task2.minWords) {
      addToast({
        title: t('warning'),
        description: t('tests.writing.minWordCountWarning'),
        severity: 'warning',
      });
      return;
    }
    
    onOpen();
  };
  
  // Anti-cheat: Detect copy-paste
  React.useEffect(() => {
    if (!isTestStarted) return;
    
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addToast({
        title: t('warning'),
        description: t('tests.writing.noPasteAllowed'),
        severity: 'warning',
      });
    };
    
    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isTestStarted, t]);
  
  // Word count indicator color
  const getWordCountColor = (count: number, min: number, max: number) => {
    if (count < min) return 'danger';
    if (count > max) return 'warning';
    return 'success';
  };
  
  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">{t('tests.writing.title')}</h1>
      
      {!isTestStarted ? (
        <Card>
          <CardBody className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{t('tests.instructions')}</h2>
              <p className="text-default-600 mb-4">{t('tests.writing.instructions')}</p>
              
              <div className="bg-default-50 p-4 rounded-medium mb-4">
                <h3 className="font-medium mb-2">{t('tests.writing.task1Title')}</h3>
                <p className="text-default-600 mb-1">
                  {t('tests.writing.task1Instructions')}
                </p>
                <ul className="list-disc list-inside text-default-600 ml-4 space-y-1">
                  <li>{t('tests.writing.task1Bullet1')}</li>
                  <li>{t('tests.writing.task1Bullet2', { min: writingTasks.task1.minWords, max: writingTasks.task1.maxWords })}</li>
                  <li>{t('tests.writing.task1Bullet3', { time: writingTasks.task1.timeInMinutes })}</li>
                </ul>
              </div>
              
              <div className="bg-default-50 p-4 rounded-medium">
                <h3 className="font-medium mb-2">{t('tests.writing.task2Title')}</h3>
                <p className="text-default-600 mb-1">
                  {t('tests.writing.task2Instructions')}
                </p>
                <ul className="list-disc list-inside text-default-600 ml-4 space-y-1">
                  <li>{t('tests.writing.task2Bullet1')}</li>
                  <li>{t('tests.writing.task2Bullet2', { min: writingTasks.task2.minWords, max: writingTasks.task2.maxWords })}</li>
                  <li>{t('tests.writing.task2Bullet3', { time: writingTasks.task2.timeInMinutes })}</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                color="primary" 
                size="lg"
                onPress={handleStartTest}
                startContent={<Icon icon="lucide:play" />}
              >
                {t('tests.startTest')}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <TestTimer 
              initialTime={60 * 60} 
              onTimeUpdate={setTimeRemaining} 
              onTimeExpired={confirmSubmit}
            />
            
            <Button 
              color="danger" 
              variant="flat"
              onPress={confirmSubmit}
            >
              {t('tests.submitTest')}
            </Button>
          </div>
          
          <Tabs 
            aria-label="Writing tasks" 
            selectedKey={currentTask}
            onSelectionChange={handleTaskChange}
            className="w-full"
          >
            <Tab key="task1" title={t('tests.writing.task1Title')}>
              <Card>
                <CardBody className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{writingTasks.task1.title}</h3>
                    <p className="text-default-600 mb-4">{writingTasks.task1.prompt}</p>
                    
                    {writingTasks.task1.imageUrl && (
                      <div className="mb-4 flex justify-center">
                        <img 
                          src={writingTasks.task1.imageUrl} 
                          alt="Task 1 Chart" 
                          className="max-w-full h-auto rounded-medium border border-default-200"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-2 flex justify-between items-center">
                    <div className="text-sm text-default-500">
                      {t('tests.writing.wordCount')}: 
                      <span className={`ml-1 font-medium text-${getWordCountColor(
                        wordCount.task1,
                        writingTasks.task1.minWords,
                        writingTasks.task1.maxWords
                      )}-600`}>
                        {wordCount.task1}
                      </span>
                      <span className="ml-1">
                        ({t('tests.writing.target')}: {writingTasks.task1.minWords}-{writingTasks.task1.maxWords})
                      </span>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder={t('tests.writing.startWriting')}
                    minRows={12}
                    value={essay.task1}
                    onValueChange={handleEssayChange}
                    variant="bordered"
                    className="w-full"
                  />
                </CardBody>
              </Card>
            </Tab>
            
            <Tab key="task2" title={t('tests.writing.task2Title')}>
              <Card>
                <CardBody className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{writingTasks.task2.title}</h3>
                    <p className="text-default-600 mb-4">{writingTasks.task2.prompt}</p>
                  </div>
                  
                  <div className="mb-2 flex justify-between items-center">
                    <div className="text-sm text-default-500">
                      {t('tests.writing.wordCount')}: 
                      <span className={`ml-1 font-medium text-${getWordCountColor(
                        wordCount.task2,
                        writingTasks.task2.minWords,
                        writingTasks.task2.maxWords
                      )}-600`}>
                        {wordCount.task2}
                      </span>
                      <span className="ml-1">
                        ({t('tests.writing.target')}: {writingTasks.task2.minWords}-{writingTasks.task2.maxWords})
                      </span>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder={t('tests.writing.startWriting')}
                    minRows={12}
                    value={essay.task2}
                    onValueChange={handleEssayChange}
                    variant="bordered"
                    className="w-full"
                  />
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t('tests.confirmSubmit')}</ModalHeader>
              <ModalBody>
                {isAnalyzing ? (
                  <div className="py-8 flex flex-col items-center">
                    <Spinner size="lg" color="primary" className="mb-4" />
                    <p className="text-center text-default-600">
                      {t('aiAssistant.analyzing')}
                    </p>
                    <Progress 
                      size="sm" 
                      isIndeterminate 
                      aria-label="Analyzing" 
                      className="max-w-md mt-4" 
                    />
                  </div>
                ) : (
                  <>
                    <p>{t('tests.writing.confirmSubmitMessage')}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>{t('tests.writing.task1Title')}</span>
                        <span className={`font-medium text-${getWordCountColor(
                          wordCount.task1,
                          writingTasks.task1.minWords,
                          writingTasks.task1.maxWords
                        )}-600`}>
                          {wordCount.task1} {t('tests.writing.words')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('tests.writing.task2Title')}</span>
                        <span className={`font-medium text-${getWordCountColor(
                          wordCount.task2,
                          writingTasks.task2.minWords,
                          writingTasks.task2.maxWords
                        )}-600`}>
                          {wordCount.task2} {t('tests.writing.words')}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={onClose}
                  isDisabled={isSubmitting || isAnalyzing}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSubmitTest}
                  isLoading={isSubmitting || isAnalyzing}
                  isDisabled={isSubmitting || isAnalyzing}
                >
                  {t('tests.submitTest')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default WritingTest;