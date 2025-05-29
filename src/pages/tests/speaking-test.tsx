// Create the missing speaking-test.tsx file
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
  Chip,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';
import { supabase } from '../../services/supabase';
import { analyzeSpeaking, SpeakingFeedback } from '../../services/ai-service';
import TestTimer from '../../components/test-timer';

type SpeakingQuestion = {
  id: string;
  part: number;
  question: string;
  preparationTimeInSeconds: number;
  speakingTimeInSeconds: number;
  followUpQuestions?: string[];
};

const SpeakingTest: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [isTestStarted, setIsTestStarted] = React.useState(false);
  const [isPreparationMode, setIsPreparationMode] = React.useState(false);
  const [isRecordingMode, setIsRecordingMode] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [feedback, setFeedback] = React.useState<SpeakingFeedback | null>(null);
  const [timeRemaining, setTimeRemaining] = React.useState(0);
  const [recordings, setRecordings] = React.useState<Record<string, Blob>>({});
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = React.useState<MediaStream | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = React.useState(false);
  
  // Mock speaking test questions
  const speakingQuestions: SpeakingQuestion[] = [
    {
      id: 'q1',
      part: 1,
      question: 'Tell me about your hometown. What do you like about living there?',
      preparationTimeInSeconds: 30,
      speakingTimeInSeconds: 120,
      followUpQuestions: [
        'How long have you lived there?',
        'What changes have you seen in your hometown over the years?',
        'Would you recommend your hometown as a place to visit? Why or why not?'
      ]
    },
    {
      id: 'q2',
      part: 2,
      question: 'Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and how useful this skill would be to you.',
      preparationTimeInSeconds: 60,
      speakingTimeInSeconds: 120,
      followUpQuestions: [
        'Do you think this skill will be useful in the future?',
        'What skills do you think are most important for young people to learn today?'
      ]
    },
    {
      id: 'q3',
      part: 3,
      question: 'Do you think technology has made communication between people better or worse? Why?',
      preparationTimeInSeconds: 30,
      speakingTimeInSeconds: 120,
      followUpQuestions: [
        'How has social media changed the way people interact?',
        'Do you think face-to-face communication is still important? Why?',
        'How might communication technology change in the future?'
      ]
    }
  ];
  
  const currentQuestion = speakingQuestions[currentQuestionIndex];
  
  // Request microphone access
  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsPermissionDenied(true);
      addToast({
        title: t('error'),
        description: t('tests.speaking.microphoneAccessDenied'),
        severity: 'danger',
      });
      return false;
    }
  };
  
  // Start the test
  const handleStartTest = async () => {
    const hasAccess = await requestMicrophoneAccess();
    if (hasAccess) {
      setIsTestStarted(true);
      startPreparation();
    }
  };
  
  // Start preparation time
  const startPreparation = () => {
    setIsPreparationMode(true);
    setTimeRemaining(currentQuestion.preparationTimeInSeconds);
  };
  
  // Start recording
  const startRecording = () => {
    if (!audioStream) return;
    
    setIsPreparationMode(false);
    setIsRecordingMode(true);
    setTimeRemaining(currentQuestion.speakingTimeInSeconds);
    
    const recorder = new MediaRecorder(audioStream);
    const chunks: BlobPart[] = [];
    
    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setRecordings(prev => ({
        ...prev,
        [currentQuestion.id]: blob
      }));
    };
    
    recorder.start();
    setMediaRecorder(recorder);
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    setIsRecordingMode(false);
  };
  
  // Handle preparation time expired
  const handlePreparationTimeExpired = () => {
    startRecording();
  };
  
  // Handle recording time expired
  const handleRecordingTimeExpired = () => {
    stopRecording();
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < speakingQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      startPreparation();
    } else {
      // End of test
      confirmSubmit();
    }
  };
  
  // Submit the test
  const handleSubmitTest = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    setIsAnalyzing(true);
    
    try {
      // In a real implementation, we would:
      // 1. Upload the audio recordings to storage
      // 2. Send the audio URLs to the AI service for analysis
      // 3. Save the results to the database
      
      // For now, we'll simulate this with a mock response
      const mockFeedback = await analyzeSpeaking(
        'mock-audio-url',
        'general',
        currentQuestion.question
      );
      
      setFeedback(mockFeedback);
      
      // Save test result to Supabase
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          test_type: 'speaking',
          score: Math.round(mockFeedback.score * 10), // Scale to 0-90
          max_score: 90, // IELTS is scored out of 9, we multiply by 10
          duration: 600, // Mock duration
          completed_at: new Date().toISOString(),
          feedback: JSON.stringify(mockFeedback),
          strengths: mockFeedback.strengths,
          weaknesses: mockFeedback.weaknesses
        })
        .select();
      
      if (error) throw error;
      
      // Update user's total points and tests completed
      await supabase.rpc('increment_user_stats', {
        user_id: user.id,
        points_to_add: Math.round(mockFeedback.score * 10),
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
      setIsAnalyzing(false);
      onClose();
    }
  };
  
  // Confirm test submission
  const confirmSubmit = () => {
    // Stop any ongoing recording
    if (isRecordingMode) {
      stopRecording();
    }
    
    onOpen();
  };
  
  // Clean up resources when component unmounts
  React.useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);
  
  // Calculate progress
  const calculateProgress = () => {
    return ((currentQuestionIndex + 1) / speakingQuestions.length) * 100;
  };
  
  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">{t('tests.speaking.title')}</h1>
      
      {!isTestStarted ? (
        <Card>
          <CardBody className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{t('tests.instructions')}</h2>
              <p className="text-default-600 mb-4">{t('tests.speaking.instructions')}</p>
              
              <div className="bg-default-50 p-4 rounded-medium mb-4">
                <h3 className="font-medium mb-2">{t('tests.speaking.testFormat')}</h3>
                <ul className="list-disc list-inside text-default-600 ml-4 space-y-1">
                  <li>{t('tests.speaking.formatBullet1')}</li>
                  <li>{t('tests.speaking.formatBullet2')}</li>
                  <li>{t('tests.speaking.formatBullet3')}</li>
                </ul>
              </div>
              
              <div className="bg-default-50 p-4 rounded-medium">
                <h3 className="font-medium mb-2">{t('tests.speaking.tips')}</h3>
                <ul className="list-disc list-inside text-default-600 ml-4 space-y-1">
                  <li>{t('tests.speaking.tipBullet1')}</li>
                  <li>{t('tests.speaking.tipBullet2')}</li>
                  <li>{t('tests.speaking.tipBullet3')}</li>
                </ul>
              </div>
              
              <div className="mt-4 p-4 bg-warning-100 border border-warning-200 text-warning-700 rounded-medium">
                <div className="flex items-start gap-2">
                  <Icon icon="lucide:mic" className="mt-0.5" />
                  <div>
                    <p className="font-medium">{t('tests.speaking.microphoneRequired')}</p>
                    <p className="text-sm mt-1">{t('tests.speaking.microphonePermission')}</p>
                  </div>
                </div>
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
            <div className="flex items-center gap-2">
              <Chip color="primary" variant="flat">
                {t('tests.speaking.part')} {currentQuestion.part}
              </Chip>
              <Chip color="default" variant="flat">
                {t('tests.questionOf', { 
                  current: currentQuestionIndex + 1, 
                  total: speakingQuestions.length 
                })}
              </Chip>
            </div>
            
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
          
          <Card>
            <CardBody className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {t('tests.speaking.question')}:
                </h3>
                <p className="text-default-700 p-4 bg-default-50 rounded-medium">
                  {currentQuestion.question}
                </p>
              </div>
              
              {isPreparationMode && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">
                      {t('tests.speaking.preparationTime')}
                    </h3>
                    <span className="text-default-700 font-medium">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  <Progress 
                    value={(timeRemaining / currentQuestion.preparationTimeInSeconds) * 100} 
                    color="warning" 
                    size="md"
                    className="mb-4"
                    aria-label="Preparation time"
                  />
                  
                  <p className="text-default-600">
                    {t('tests.speaking.preparationInstructions')}
                  </p>
                  
                  <Button
                    color="primary"
                    className="mt-4"
                    onPress={startRecording}
                  >
                    {t('tests.speaking.skipPreparation')}
                  </Button>
                </div>
              )}
              
              {isRecordingMode && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="animate-pulse text-danger">●</span>
                      {t('tests.speaking.recording')}
                    </h3>
                    <span className="text-default-700 font-medium">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  <Progress 
                    value={(timeRemaining / currentQuestion.speakingTimeInSeconds) * 100} 
                    color="danger" 
                    size="md"
                    className="mb-4"
                    aria-label="Speaking time"
                  />
                  
                  <p className="text-default-600">
                    {t('tests.speaking.recordingInstructions')}
                  </p>
                  
                  <Button
                    color="danger"
                    variant="flat"
                    className="mt-4"
                    onPress={stopRecording}
                    startContent={<Icon icon="lucide:stop-circle" />}
                  >
                    {t('tests.speaking.stopRecording')}
                  </Button>
                </div>
              )}
              
              {!isPreparationMode && !isRecordingMode && (
                <div className="mb-6">
                  <div className="p-4 bg-success-100 border border-success-200 text-success-700 rounded-medium mb-4">
                    <div className="flex items-start gap-2">
                      <Icon icon="lucide:check-circle" className="mt-0.5" />
                      <div>
                        <p className="font-medium">{t('tests.speaking.responseRecorded')}</p>
                        <p className="text-sm mt-1">{t('tests.speaking.responseConfirmation')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {recordings[currentQuestion.id] && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">{t('tests.speaking.yourRecording')}</h4>
                      <audio 
                        controls 
                        src={URL.createObjectURL(recordings[currentQuestion.id])}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {currentQuestion.followUpQuestions && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">{t('tests.speaking.followUpQuestions')}</h4>
                      <div className="space-y-2">
                        {currentQuestion.followUpQuestions.map((question, index) => (
                          <p key={index} className="p-3 bg-default-50 rounded-medium">
                            {question}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    color="primary"
                    onPress={handleNextQuestion}
                    endContent={<Icon icon="lucide:arrow-right" />}
                  >
                    {currentQuestionIndex === speakingQuestions.length - 1
                      ? t('tests.submitTest')
                      : t('common.next')
                    }
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
      
      {/* Timer for preparation and recording */}
      {(isPreparationMode || isRecordingMode) && (
        <div className="fixed bottom-4 right-4">
          <TestTimer 
            initialTime={isPreparationMode ? currentQuestion.preparationTimeInSeconds : currentQuestion.speakingTimeInSeconds} 
            onTimeUpdate={setTimeRemaining} 
            onTimeExpired={isPreparationMode ? handlePreparationTimeExpired : handleRecordingTimeExpired}
          />
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
                    <p>{t('tests.speaking.confirmSubmitMessage')}</p>
                    <div className="mt-4">
                      <p className="text-default-600">
                        {t('tests.speaking.recordedResponses', { 
                          recorded: Object.keys(recordings).length,
                          total: speakingQuestions.length
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

export default SpeakingTest;