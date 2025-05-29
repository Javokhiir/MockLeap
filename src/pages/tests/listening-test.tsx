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
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';
import { supabase } from '../../services/supabase';
import TestTimer from '../../components/test-timer';

type ListeningQuestion = {
  id: string;
  audioUrl: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

type ListeningSection = {
  id: string;
  title: string;
  description: string;
  timeInMinutes: number;
  questions: ListeningQuestion[];
};

const ListeningTest: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [currentSection, setCurrentSection] = React.useState(0);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = React.useState(40 * 60); // 40 minutes
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTestStarted, setIsTestStarted] = React.useState(false);
  const [isTestCompleted, setIsTestCompleted] = React.useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false);
  const [audioEnded, setAudioEnded] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Listening test data with real audio URLs
  const listeningTest: ListeningSection[] = [
    {
      id: 'section1',
      title: t('tests.listening.section1Title'),
      description: t('tests.listening.section1Description'),
      timeInMinutes: 10,
      questions: [
        {
          id: 'q1s1',
          audioUrl: 'https://ieltsfever.org/wp-content/uploads/2016/03/ielts-fever-listening-practice-test-1-mp3.mp3',
          question: 'Where is the Holiday Centre located?',
          options: ['North', 'East', 'Central', 'South'],
          correctAnswer: 2
        },
        {
          id: 'q2s1',
          audioUrl: 'https://ieltsfever.org/wp-content/uploads/2016/03/ielts-fever-listening-practice-test-1-mp3.mp3',
          question: 'What detail is missing from the hotel address?',
          options: ['Name of the hotel', 'Postal code', 'Street name', 'Phone number'],
          correctAnswer:2
        },
        {
          id: 'q3s1',
          audioUrl: 'https://ieltsfever.org/wp-content/uploads/2016/03/ielts-fever-listening-practice-test-1-mp3.mp3',
          question: 'What facility is available at the hotel?',
          options: ['Gym', 'Swimming pool', 'Sauna', 'Tennis court'],
          correctAnswer: 1
        },
        {
          id: 'q4s1',
          audioUrl: 'https://ieltsfever.org/wp-content/uploads/2016/03/ielts-fever-listening-practice-test-1-mp3.mp3',
          question: 'What is missing at the hotel reception?',
          options: ['Clock', 'Receptionist', 'Sign', 'Phone'],
          correctAnswer: 2
        },
        {
          id: 'q5s1',
          audioUrl: 'https://ieltsfever.org/wp-content/uploads/2016/03/ielts-fever-listening-practice-test-1-mp3.mp3',
          question: 'What do the hotel rooms offer?',
          options: ['Wi-Fi', 'TV', 'Great views', 'Complimentary breakfast'],
          correctAnswer: 2
        }
      ]

    },
    {
      id: 'section2',
      title: t('tests.listening.section2Title'),
      description: t('tests.listening.section2Description'),
      timeInMinutes: 10,
      questions: [
        {
          id: 'q1s2',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
          question: 'What type of accommodation is the speaker describing?',
          options: [
            'A hotel',
            'A hostel',
            'An apartment',
            'A guest house'
          ],
          correctAnswer: 2
        },
        {
          id: 'q2s2',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
          question: 'How much does the accommodation cost per night?',
          options: [
            '$45',
            '$55',
            '$65',
            '$75'
          ],
          correctAnswer: 1
        },
        {
          id: 'q3s2',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
          question: 'What facility is NOT mentioned by the speaker?',
          options: [
            'Swimming pool',
            'Wi-Fi',
            'Kitchen',
            'Laundry service'
          ],
          correctAnswer: 0
        },
        {
          id: 'q4s2',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
          question: 'What is the minimum stay requirement?',
          options: [
            '1 night',
            '3 nights',
            '1 week',
            '2 weeks'
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 'section3',
      title: t('tests.listening.section3Title'),
      description: t('tests.listening.section3Description'),
      timeInMinutes: 10,
      questions: [
        {
          id: 'q1s3',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
          question: 'What is the purpose of the lecture?',
          options: [
            'To explain a scientific theory',
            'To describe a historical event',
            'To analyze a literary work',
            'To discuss a social issue'
          ],
          correctAnswer: 0
        },
        {
          id: 'q2s3',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
          question: 'According to the speaker, what is the main challenge in this field?',
          options: [
            'Lack of funding',
            'Limited technology',
            'Insufficient data',
            'Public misconceptions'
          ],
          correctAnswer: 3
        },
        {
          id: 'q3s3',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
          question: 'What does the speaker predict for the future?',
          options: [
            'Rapid advancement',
            'Gradual decline',
            'Stable continuation',
            'Uncertain changes'
          ],
          correctAnswer: 0
        },
        {
          id: 'q4s3',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
          question: 'What example does the speaker use to illustrate the point?',
          options: [
            'Climate change research',
            'Space exploration',
            'Medical breakthroughs',
            'Artificial intelligence'
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 'section4',
      title: t('tests.listening.section4Title'),
      description: t('tests.listening.section4Description'),
      timeInMinutes: 10,
      questions: [
        {
          id: 'q1s4',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
          question: 'What is the main argument of the discussion?',
          options: [
            'Economic growth is slowing down',
            'Environmental protection is essential',
            'Technology is changing too quickly',
            'Education systems need reform'
          ],
          correctAnswer: 1
        },
        {
          id: 'q2s4',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
          question: 'Which solution does the speaker emphasize most?',
          options: [
            'Government regulation',
            'Individual action',
            'Corporate responsibility',
            'International cooperation'
          ],
          correctAnswer: 3
        },
        {
          id: 'q3s4',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
          question: 'What evidence does the speaker use to support their point?',
          options: [
            'Personal experience',
            'Historical examples',
            'Scientific research',
            'Expert opinions'
          ],
          correctAnswer: 2
        },
        {
          id: 'q4s4',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
          question: 'What does the speaker suggest listeners should do?',
          options: [
            'Contact their representatives',
            'Change their daily habits',
            'Join an organization',
            'Educate others'
          ],
          correctAnswer: 1
        }
      ]
    }
  ];

  // Get current section and question
  const currentSectionData = listeningTest[currentSection];
  const currentQuestionData = currentSectionData?.questions[currentQuestion];

  // Handle answer selection
  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionData.id]: parseInt(value)
    }));
  };

  // Start the test
  const handleStartTest = () => {
    setIsTestStarted(true);
  };

  // Play audio
  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  // Handle audio end
  const handleAudioEnd = () => {
    setIsAudioPlaying(false);
    setAudioEnded(true);
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAudioEnded(false);
    } else if (currentSection < listeningTest.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
      setAudioEnded(false);
    } else {
      // End of test
      confirmSubmit();
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(listeningTest[currentSection - 1].questions.length - 1);
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

      listeningTest.forEach(section => {
        section.questions.forEach(question => {
          totalQuestions++;
          if (answers[question.id] === question.correctAnswer) {
            correctAnswers++;
          }
        });
      });

      const score = Math.round((correctAnswers / totalQuestions) * 90); // Scale to 0-90

      // Save test result to Supabase
      const { data, error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            test_type: 'listening',
            score: score,
            max_score: 90, // IELTS is scored out of 9, we multiply by 10
            duration: 40 * 60 - timeRemaining, // Time taken in seconds
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
      onClose();
    }
  };

  // Confirm test submission
  const confirmSubmit = () => {
    onOpen();
  };

  // Calculate progress
  const calculateProgress = () => {
    const totalQuestions = listeningTest.reduce(
        (sum, section) => sum + section.questions.length,
        0
    );

    const currentQuestionNumber = listeningTest
        .slice(0, currentSection)
        .reduce((sum, section) => sum + section.questions.length, 0) + currentQuestion + 1;

    return (currentQuestionNumber / totalQuestions) * 100;
  };

  // Anti-cheat: Detect tab switching
  React.useEffect(() => {
    if (!isTestStarted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        addToast({
          title: t('warning'),
          description: t('tests.listening.tabSwitchWarning'),
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
        <h1 className="text-3xl font-bold mb-6">{t('tests.listening.title')}</h1>

        {!isTestStarted ? (
            <Card>
              <CardBody className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">{t('tests.instructions')}</h2>
                  <p className="text-default-600 mb-4">{t('tests.listening.instructions')}</p>

                  <div className="bg-default-50 p-4 rounded-medium mb-4">
                    <h3 className="font-medium mb-2">{t('tests.listening.testFormat')}</h3>
                    <ul className="list-disc list-inside text-default-600 ml-4 space-y-1">
                      <li>{t('tests.listening.formatBullet1')}</li>
                      <li>{t('tests.listening.formatBullet2')}</li>
                      <li>{t('tests.listening.formatBullet3')}</li>
                      <li>{t('tests.listening.formatBullet4')}</li>
                    </ul>
                  </div>

                  <div className="bg-default-50 p-4 rounded-medium">
                    <h3 className="font-medium mb-2">{t('tests.listening.tips')}</h3>
                    <ul className="list-disc list-inside text-default-600 ml-4 space-y-1">
                      <li>{t('tests.listening.tipBullet1')}</li>
                      <li>{t('tests.listening.tipBullet2')}</li>
                      <li>{t('tests.listening.tipBullet3')}</li>
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
                    initialTime={40 * 60}
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

              <Card>
                <CardBody className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">
                        {currentSectionData.title}
                      </h3>
                      <span className="text-sm text-default-500">
                    {t('tests.questionOf', {
                      current: currentQuestion + 1,
                      total: currentSectionData.questions.length
                    })}
                  </span>
                    </div>

                    <Progress
                        value={calculateProgress()}
                        color="primary"
                        size="sm"
                        className="mb-4"
                        aria-label="Test progress"
                    />

                    <p className="text-default-600 mb-4">
                      {currentSectionData.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-center mb-4">
                      <audio
                          ref={audioRef}
                          onEnded={handleAudioEnd}
                          controls={false}
                          className="hidden"
                      >
                        <source src={currentQuestionData.audioUrl} type="audio/mpeg" />
                        {t('tests.listening.audioNotSupported')}
                      </audio>

                      <Button
                          color="primary"
                          isDisabled={isAudioPlaying}
                          onPress={handlePlayAudio}
                          startContent={<Icon icon="lucide:volume-2" />}
                      >
                        {isAudioPlaying
                            ? t('tests.listening.audioPlaying')
                            : audioEnded
                                ? t('tests.listening.playAgain')
                                : t('tests.listening.playAudio')
                        }
                      </Button>
                    </div>

                    <div className="p-4 bg-default-50 rounded-medium mb-4">
                      <h4 className="font-medium mb-2">
                        {currentQuestionData.question}
                      </h4>

                      <RadioGroup
                          value={answers[currentQuestionData.id]?.toString() || ''}
                          onValueChange={handleAnswerChange}
                          isDisabled={!audioEnded}
                          className="mt-4"
                      >
                        {currentQuestionData.options.map((option, index) => (
                            <Radio key={index} value={index.toString()}>
                              {option}
                            </Radio>
                        ))}
                      </RadioGroup>

                      {!audioEnded && (
                          <div className="mt-4 p-3 bg-warning-100 text-warning-700 rounded-medium text-sm">
                            <Icon icon="lucide:info" className="inline-block mr-2" />
                            {t('tests.listening.listenBeforeAnswer')}
                          </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                        variant="flat"
                        onPress={handlePreviousQuestion}
                        isDisabled={currentSection === 0 && currentQuestion === 0}
                        startContent={<Icon icon="lucide:arrow-left" />}
                    >
                      {t('common.previous')}
                    </Button>

                    <Button
                        color="primary"
                        onPress={handleNextQuestion}
                        endContent={<Icon icon="lucide:arrow-right" />}
                    >
                      {currentSection === listeningTest.length - 1 &&
                      currentQuestion === currentSectionData.questions.length - 1
                          ? t('tests.submitTest')
                          : t('common.next')
                      }
                    </Button>
                  </div>
                </CardBody>
              </Card>
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
                          <p>{t('tests.listening.confirmSubmitMessage')}</p>
                          <div className="mt-4">
                            <p className="text-default-600">
                              {t('tests.listening.answeredQuestions', {
                                answered: Object.keys(answers).length,
                                total: listeningTest.reduce((sum, section) => sum + section.questions.length, 0)
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

export default ListeningTest;