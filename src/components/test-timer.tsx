import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Progress } from '@heroui/react';
import { Icon } from '@iconify/react';

interface TestTimerProps {
  initialTime: number; // in seconds
  onTimeUpdate: (timeRemaining: number) => void;
  onTimeExpired: () => void;
}

const TestTimer: React.FC<TestTimerProps> = ({
  initialTime,
  onTimeUpdate,
  onTimeExpired
}) => {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = React.useState(initialTime);
  const [isWarning, setIsWarning] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeExpired]);

  React.useEffect(() => {
    onTimeUpdate(timeRemaining);

    // Set warning when less than 10% time remains
    if (timeRemaining < initialTime * 0.1 && !isWarning) {
      setIsWarning(true);
    }
  }, [timeRemaining, initialTime, isWarning, onTimeUpdate]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Calculate progress percentage
  const progressPercentage = (timeRemaining / initialTime) * 100;

  return (
    <Card className={`w-64 ${isWarning ? 'border-danger' : ''}`}>
      <CardBody className="py-2 px-4">
        <div className="flex items-center gap-2">
          <Icon
            icon="lucide:clock"
            className={`${isWarning ? 'text-danger' : 'text-default-500'}`}
          />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-default-500">
                {t('tests.timeRemaining')}
              </span>
              <span className={`font-medium ${isWarning ? 'text-danger' : ''}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Progress
              value={progressPercentage}
              color={isWarning ? 'danger' : 'primary'}
              size="sm"
              aria-label="Time remaining"
              className={isWarning ? 'animate-pulse' : ''}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TestTimer;