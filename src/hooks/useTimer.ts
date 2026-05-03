import { useState, useEffect, useCallback } from 'react';

export function useTimer(initialSeconds: number, onTimeUp?: () => void, autoStart: boolean = true) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    if (!isActive) return;

    if (seconds <= 0) {
      setIsActive(false);
      onTimeUp?.();
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const pause = useCallback(() => setIsActive(false), []);
  const play = useCallback(() => setIsActive(true), []);
  const reset = useCallback((newSeconds: number) => {
    setSeconds(newSeconds);
    setIsActive(false);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    seconds,
    formattedTime: formatTime(seconds),
    isActive,
    pause,
    play,
    reset
  };
}
