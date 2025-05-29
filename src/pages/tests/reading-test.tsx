// Create the missing reading-test.tsx file
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardBody, 
  Button, 
  Progress, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Spinner,
  RadioGroup,
  Radio,
  Input,
  Tabs,
  Tab,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';
import { supabase } from '../../services/supabase';
import TestTimer from '../../components/test-timer';

type ReadingQuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';

type ReadingQuestion = {
  id: string;
  type: ReadingQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
};

type ReadingPassage = {
  id: string;
  title: string;
  content: string;
  questions: ReadingQuestion[];
};

const ReadingTest: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [currentPassage, setCurrentPassage] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string | number>>({});
  const [timeRemaining, setTimeRemaining] = React.useState(60 * 60); // 60 minutes
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTestStarted, setIsTestStarted] = React.useState(false);
  
  // Mock reading test data
  const readingTest: ReadingPassage[] = [
    {
      id: 'passage1',
      title: 'The History of Tea',
      content: `Tea is one of the most widely consumed beverages in the world, second only to water. Its origins can be traced back to ancient China, where legend has it that in 2737 BCE, Emperor Shen Nong discovered tea when leaves from a wild tree blew into his pot of boiling water.

For thousands of years, tea was used primarily for medicinal purposes. It wasn't until the Tang Dynasty (618-907 CE) that tea became a popular recreational drink. During this period, Lu Yu wrote "The Classic of Tea," the first known monograph on tea cultivation and preparation.

Tea was introduced to Japan in the 6th century by Japanese monks who had traveled to China to study Buddhism. The Japanese tea ceremony, known as chanoyu, developed as a transformative cultural activity, an art form, and a spiritual discipline.

European traders first encountered tea in the 16th century, but it wasn't until the 17th century that tea became popular in Britain. The British East India Company had a monopoly on importing goods from outside Europe, and tea was one of its most important commodities.

In the 18th century, tea played a significant role in colonial politics. The British government's decision to tax tea imported to the American colonies led to the Boston Tea Party in 1773, a significant event leading up to the American Revolution.

Today, tea is grown in more than 30 countries, with China, India, Kenya, and Sri Lanka being the largest producers. Different varieties of tea, such as black, green, white, oolong, and herbal teas, are enjoyed worldwide, each with its unique flavor profile and cultural significance.`,
      questions: [
        {
          id: 'q1p1',
          type: 'multiple-choice',
          question: 'According to the passage, when did tea become a popular recreational drink?',
          options: [
            'During the reign of Emperor Shen Nong',
            'In the 6th century',
            'During the Tang Dynasty',
            'In the 17th century'
          ],
          correctAnswer: 2
        },
        {
          id: 'q2p1',
          type: 'true-false',
          question: 'The Japanese tea ceremony was introduced to Japan by Chinese monks.',
          options: ['True', 'False'],
          correctAnswer: 1
        },
        {
          id: 'q3p1',
          type: 'fill-blank',
          question: 'The first known monograph on tea cultivation and preparation was written by _______.',
          correctAnswer: 'Lu Yu'
        },
        {
          id: 'q4p1',
          type: 'multiple-choice',
          question: 'Which of the following is NOT mentioned as a major tea-producing country?',
          options: [
            'China',
            'India',
            'Japan',
            'Kenya'
          ],
          correctAnswer: 2
        }
      ]
    },
    {
      id: 'passage2',
      title: 'Renewable Energy Sources',
      content: `Renewable energy comes from sources that are naturally replenishing but flow-limited. They are virtually inexhaustible in duration but limited in the amount of energy that is available per unit of time. Renewable energy sources include biomass, hydropower, geothermal, wind, and solar.

Solar energy is the most abundant energy resource on Earth. The sun's rays that reach the earth contain more than 10,000 times the energy used by humans globally. Solar technologies convert sunlight into electrical energy using photovoltaic panels or mirrors that concentrate solar radiation.

Wind energy harnesses the kinetic energy of moving air. Wind turbines convert this kinetic energy into mechanical power, which can then be converted into electricity. Wind power is one of the fastest-growing renewable energy technologies and is becoming increasingly cost-competitive with traditional energy sources.

Hydropower is energy derived from flowing water. It is the largest source of renewable electricity in the world. Hydroelectric power plants capture the energy of falling water to generate electricity. The most common type of hydroelectric power plant uses a dam on a river to store water in a reservoir.

Geothermal energy is heat derived from the sub-surface of the earth. It is contained in the rocks and fluids beneath the earth's crust and can be found as far down as the earth's hot molten rock, magma. Wells can be drilled into underground reservoirs to tap steam and very hot water that can be brought to the surface for use in a variety of applications.

Biomass is organic material that comes from plants and animals, and it is a renewable source of energy. Biomass contains stored energy from the sun. When biomass is burned, the chemical energy in biomass is released as heat. Biomass can be burned directly or converted to liquid biofuels or biogas that can be burned as fuels.

The transition to renewable energy is crucial for addressing climate change, as these sources produce little to no greenhouse gas emissions. However, challenges remain, including intermittency issues, storage limitations, and the need for significant infrastructure development.`,
      questions: [
        {
          id: 'q1p2',
          type: 'multiple-choice',
          question: 'Which renewable energy source is described as the most abundant on Earth?',
          options: [
            'Wind',
            'Solar',
            'Hydropower',
            'Geothermal'
          ],
          correctAnswer: 1
        },
        {
          id: 'q2p2',
          type: 'true-false',
          question: 'Hydropower is the largest source of renewable electricity in the world.',
          options: ['True', 'False'],
          correctAnswer: 0
        },
        {
          id: 'q3p2',
          type: 'fill-blank',
          question: 'Geothermal energy is heat derived from the _______ of the earth.',
          correctAnswer: 'sub-surface'
        },
        {
          id: 'q4p2',
          type: 'multiple-choice',
          question: 'According to the passage, what is one of the challenges of renewable energy?',
          options: [
            'High greenhouse gas emissions',
            'Limited availability',
            'Intermittency issues',
            'High operational costs'
          ],
          correctAnswer: 2
        }
      ]
    },
    {
      id: 'passage3',
      title: 'Artificial Intelligence Ethics',
      content: `Artificial Intelligence (AI) ethics is a branch of ethics that evaluates the moral implications of developing and deploying AI systems. As AI becomes increasingly integrated into our daily lives, ethical considerations have become paramount to ensure that these technologies benefit humanity while minimizing potential harms.

One of the primary ethical concerns is privacy. AI systems often require vast amounts of data to function effectively, raising questions about data collection, consent, and usage. There's a delicate balance between leveraging data for innovation and respecting individuals' privacy rights.

Bias and fairness are also critical considerations. AI systems learn from historical data, which may contain inherent biases. If not addressed, these biases can be perpetuated or even amplified by AI, leading to unfair outcomes in areas such as hiring, lending, and criminal justice.

Transparency and explainability are essential for building trust in AI systems. Users should understand how decisions affecting them are made, yet many advanced AI systems, particularly deep learning models, operate as "black boxes," making their decision-making processes opaque.

Accountability is another key issue. When AI systems make mistakes or cause harm, it's not always clear who should be held responsible—the developers, the users, or the systems themselves. Establishing clear lines of accountability is crucial for addressing potential harms.

Autonomy and human oversight are also important considerations. As AI systems become more autonomous, questions arise about the appropriate level of human oversight and intervention. Striking the right balance is essential to prevent unintended consequences while allowing for technological advancement.

Job displacement due to automation is a significant societal concern. While AI can create new job opportunities, it also has the potential to automate tasks currently performed by humans, potentially leading to unemployment and economic inequality if not managed properly.

The global nature of AI development also raises questions about governance and regulation. Different countries and cultures may have varying perspectives on ethical issues, making it challenging to establish universal ethical standards for AI.

As AI continues to evolve, ongoing dialogue among technologists, ethicists, policymakers, and the public is essential to navigate these complex ethical issues and ensure that AI development aligns with human values and societal well-being.`,
      questions: [
        {
          id: 'q1p3',
          type: 'multiple-choice',
          question: 'What is described as a "black box" in the context of AI ethics?',
          options: [
            'Privacy violations',
            'Data collection methods',
            'Deep learning models',
            'Regulatory frameworks'
          ],
          correctAnswer: 2
        },
        {
          id: 'q2p3',
          type: 'true-false',
          question: 'According to the passage, AI systems can amplify biases present in historical data.',
          options: ['True', 'False'],
          correctAnswer: 0
        },
        {
          id: 'q3p3',
          type: 'fill-blank',
          question: 'The text suggests that ongoing dialogue among technologists, ethicists, policymakers, and the public is essential to ensure AI development aligns with _______ and societal well-being.',
          correctAnswer: 'human values'
        },
        {
          id: 'q4p3',
          type: 'multiple-choice',
          question: 'Which of the following is NOT mentioned as an ethical concern related to AI?',
          options: [
            'Privacy',
            'Bias and fairness',
            'Environmental impact',
            'Job displacement'
          ],
          correctAnswer: 2
        }
      ]
    }
  ];
  
  // Get current passage
  const currentPassageData = readingTest[currentPassage];
  
  // Handle answer change for multiple choice and true/false questions
  const handleMultipleChoiceAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };
  
  // Handle answer change for fill-in-the-blank questions
  const handleFillBlankAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Start the test
  const handleStartTest = () => {
    setIsTestStarted(true);
  };
  
  // Navigate to next passage
  const handleNextPassage = () => {
    if (currentPassage < readingTest.length - 1) {
      setCurrentPassage(currentPassage + 1);
    } else {
      // End of test
      confirmSubmit();
    }
  };
  
  // Navigate to previous passage
  const handlePreviousPassage = () => {
    if (currentPassage > 0) {
      setCurrentPassage(currentPassage - 1);
    }
  };
  
  // Submit the test
  const handleSubmitTest = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      let totalQuestions = 0;
      
      readingTest.forEach(passage => {
        passage.questions.forEach(question => {
          totalQuestions++;
          const userAnswer = answers[question.id];
          
          if (question.type === 'fill-blank') {
            // Case-insensitive comparison for fill-in-the-blank
            if (typeof userAnswer === 'string' && 
                userAnswer.toLowerCase() === (question.correctAnswer as string).toLowerCase()) {
              correctAnswers++;
            }
          } else {
            // Direct comparison for multiple-choice and true/false
            if (userAnswer === question.correctAnswer) {
              correctAnswers++;
            }
          }
        });
      });
      
      const score = Math.round((correctAnswers / totalQuestions) * 90); // Scale to 0-90
      
      // Save test result to Supabase
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          test_type: 'reading',
          score: score,
          max_score: 90, // IELTS is scored out of 9, we multiply by 10
          duration: 60 * 60 - timeRemaining, // Time taken in seconds
          completed_at: new Date().toISOString(),
          strengths: ['Good comprehension of main ideas'],
          weaknesses: ['Needs improvement in understanding details']
        })
        .select();
      
      if (error) throw error;
      
      // Update user's total points and tests completed
      await supabase.rpc('increment_user_stats', {
        user_id: user.id,
        points_to_add: score,
        tests_to_add: 1
      });
      
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
      onClose();
    }
  };
  
  // Confirm test submission
  const confirmSubmit = () => {
    onOpen();
  };
  
  // Calculate progress
  const calculateProgress = () => {
    return ((currentPassage + 1) / readingTest.length) * 100;
  };
  
  // Render question based on type
  const renderQuestion = (question: ReadingQuestion) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <RadioGroup
            value={answers[question.id]?.toString() || ''}
            onValueChange={(value) => handleMultipleChoiceAnswer(question.id, value)}
            className="mt-2"
          >
            {question.options?.map((option, index) => (
              <Radio key={index} value={index.toString()}>
                {option}
              </Radio>
            ))}
          </RadioGroup>
        );
      case 'true-false':
        return (
          <RadioGroup
            value={answers[question.id]?.toString() || ''}
            onValueChange={(value) => handleMultipleChoiceAnswer(question.id, value)}
            orientation="horizontal"
            className="mt-2"
          >
            <Radio value="0">True</Radio>
            <Radio value="1">False</Radio>
          </RadioGroup>
        );
      case 'fill-blank':
        return (
          <Input
            value={answers[question.id]?.toString() || ''}
            onValueChange={(value) => handleFillBlankAnswer(question.id, value)}
            placeholder={t('tests.reading.enterAnswer')}
            className="mt-2"
          />
        );
      default:
        return null;
    }
  };
  
  // Anti-cheat: Detect tab switching
  React.useEffect(() => {
    if (!isTestStarted) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        addToast({
          title: t('warning'),
          description: t('tests.reading.tabSwitchWarning'),
          severity: 'warning',
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTestStarted, t]);
  
  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">{t('tests.reading.title')}</h1>
      
      {!isTestStarted ? (
        <Card>
          <CardBody className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{t('tests.instructions')}</h2>
              <p className="text-default-600 mb-4">{t('tests.reading.instructions')}</p>
              
              <div className="bg-default-50 p-4 rounded-medium mb-4">
                <h3 className="font-medium mb-2">{t('tests.reading.testFormat')}</h3>
                <ul className="list-disc list-inside text-default-600 ml-4 space-y-1">
                  <li>{t('tests.reading.formatBullet1')}</li>
                  <li>{t('tests.reading.formatBullet2')}</li>
                  <li>{t('tests.reading.formatBullet3')}</li>
                </ul>
              </div>
              
              <div className="bg-default-50 p-4 rounded-medium">
                <h3 className="font-medium mb-2">{t('tests.reading.tips')}</h3>
                <ul className="list-disc list-inside text-default-600 ml-4 space-y-1">
                  <li>{t('tests.reading.tipBullet1')}</li>
                  <li>{t('tests.reading.tipBullet2')}</li>
                  <li>{t('tests.reading.tipBullet3')}</li>
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
          
          <Progress 
            value={calculateProgress()} 
            color="primary" 
            size="sm"
            className="mb-4"
            aria-label="Test progress"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardBody className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {currentPassageData.title}
                  </h3>
                  
                  <div className="prose max-w-none">
                    {currentPassageData.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-default-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {t('tests.reading.questions')}
                  </h3>
                  
                  <div className="space-y-6">
                    {currentPassageData.questions.map((question, index) => (
                      <div key={question.id} className="p-3 bg-default-50 rounded-medium">
                        <p className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </p>
                        {renderQuestion(question)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="flat"
                      onPress={handlePreviousPassage}
                      isDisabled={currentPassage === 0}
                      startContent={<Icon icon="lucide:arrow-left" />}
                    >
                      {t('common.previous')}
                    </Button>
                    
                    <Button
                      color="primary"
                      onPress={handleNextPassage}
                      endContent={<Icon icon="lucide:arrow-right" />}
                    >
                      {currentPassage === readingTest.length - 1
                        ? t('tests.submitTest')
                        : t('common.next')
                      }
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t('tests.confirmSubmit')}</ModalHeader>
              <ModalBody>
                {isSubmitting ? (
                  <div className="py-8 flex flex-col items-center">
                    <Spinner size="lg" color="primary" className="mb-4" />
                    <p className="text-center text-default-600">
                      {t('tests.processing')}
                    </p>
                    <Progress 
                      size="sm" 
                      isIndeterminate 
                      aria-label="Processing" 
                      className="max-w-md mt-4" 
                    />
                  </div>
                ) : (
                  <>
                    <p>{t('tests.reading.confirmSubmitMessage')}</p>
                    <div className="mt-4">
                      <p className="text-default-600">
                        {t('tests.reading.answeredQuestions', { 
                          answered: Object.keys(answers).length,
                          total: readingTest.reduce((sum, passage) => sum + passage.questions.length, 0)
                        })}
                      </p>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSubmitTest}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
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

export default ReadingTest;