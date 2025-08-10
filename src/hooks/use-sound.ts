import { useCallback } from 'react';

type SoundType = 'place' | 'win' | 'draw' | 'click';

const soundMap: Record<SoundType, { text: string, pitch: number, rate: number }> = {
  place: { text: 'plink', pitch: 1.5, rate: 2 },
  win: { text: 'tada', pitch: 1, rate: 1.5 },
  draw: { text: 'womp womp', pitch: 0.8, rate: 0.8 },
  click: { text: 'click', pitch: 1.8, rate: 3 },
};

export const useSound = (soundType: SoundType) => {
  const playSound = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const soundConfig = soundMap[soundType];
      const utterance = new SpeechSynthesisUtterance(soundConfig.text);
      utterance.pitch = soundConfig.pitch;
      utterance.rate = soundConfig.rate;
      utterance.volume = 0.5; // Keep it subtle
      window.speechSynthesis.speak(utterance);
    }
  }, [soundType]);

  return playSound;
};
