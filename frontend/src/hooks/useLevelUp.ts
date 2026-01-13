import { useEffect, useRef, useState } from "react";

export const useLevelUp = (currentLevel: number | null, onLevelUp: (lvl: number) => void) => {
  const [prevLevel, setPrevLevel] = useState<number | null>(null);
  const hasHydrated = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
  }, []);

  useEffect(() => {
    if (currentLevel === null) return;

    if (!hasHydrated.current) {
      setPrevLevel(currentLevel);
      hasHydrated.current = true;
      return;
    }

    if (prevLevel !== null && currentLevel > prevLevel) {
      onLevelUp(currentLevel);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setPrevLevel(currentLevel);
    }
  }, [currentLevel, prevLevel, onLevelUp]);
};