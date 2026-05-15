import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { Song } from '../types';
import { db } from '../lib/db';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  seek: (percent: number) => void;
  next: () => void;
  previous: () => void;
  queue: Song[];
  volume: number;
  setVolume: (v: number) => void;
  sleepTimer: number | null; // minutes remaining
  setSleepTimer: (m: number | null) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [volume, setVolume] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  
  const soundRef = useRef<Howl | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (sleepTimer !== null) {
      const interval = setInterval(() => {
        setSleepTimer(prev => {
          if (prev === null || prev <= 0) {
            if (isPlaying) togglePlay();
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [sleepTimer, isPlaying]);

  const playSong = (song: Song) => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    const sound = new Howl({
      src: [song.url],
      html5: true,
      volume: volume,
      onplay: () => {
        setIsPlaying(true);
        setDuration(sound.duration());
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => {
        next();
      },
      onload: () => {
        setDuration(sound.duration());
      }
    });

    soundRef.current = sound;
    setCurrentSong(song);
    sound.play();

    // Log stat
    db.stats.add({
      songId: song.id!,
      timestamp: Date.now(),
      durationPlayed: 0 // Will update on pause/end if we want complex tracking
    });
    db.songs.update(song.id!, { playCount: (song.playCount || 0) + 1 });
  };

  const togglePlay = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const seek = (percent: number) => {
    if (!soundRef.current) return;
    const time = (percent / 100) * duration;
    soundRef.current.seek(time);
    setProgress(percent);
  };

  const next = () => {
    if (queue.length === 0) return;
    const currentIndex = currentSong ? queue.findIndex(s => s.id === currentSong.id) : -1;
    const nextIndex = (currentIndex + 1) % queue.length;
    playSong(queue[nextIndex]);
  };

  const previous = () => {
    if (queue.length === 0) return;
    const currentIndex = currentSong ? queue.findIndex(s => s.id === currentSong.id) : -1;
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    playSong(queue[prevIndex]);
  };

  // Update progress
  useEffect(() => {
    const updateProgress = () => {
      if (soundRef.current && isPlaying) {
        const seek = soundRef.current.seek() as number;
        const total = soundRef.current.duration();
        if (total > 0) {
          setProgress((seek / total) * 100);
        }
      }
      timerRef.current = requestAnimationFrame(updateProgress);
    };

    timerRef.current = requestAnimationFrame(updateProgress);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  // Load all songs into queue for now
  useEffect(() => {
    db.songs.toArray().then(setQueue);
  }, [currentSong]);

  return (
    <AudioContext.Provider value={{
      currentSong, isPlaying, progress, duration,
      playSong, togglePlay, seek, next, previous,
      queue, volume, setVolume, sleepTimer, setSleepTimer
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
