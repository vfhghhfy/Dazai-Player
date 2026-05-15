import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  ChevronUp, 
  Music2, 
  Volume2, 
  Clock, 
  Heart,
  Shuffle,
  Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function PlayerBar() {
  const { 
    currentSong, isPlaying, togglePlay, progress, seek, next, previous, duration, 
    sleepTimer, setSleepTimer 
  } = useAudio();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);

  const isFavorite = useLiveQuery(
    () => db.favorites.where('songId').equals(currentSong?.id || -1).first(),
    [currentSong]
  );

  const toggleFavorite = async () => {
    if (!currentSong?.id) return;
    if (isFavorite) {
      await db.favorites.where('songId').equals(currentSong.id).delete();
    } else {
      await db.favorites.add({ songId: currentSong.id, userId: 'local' });
    }
  };

  if (!currentSong) return null;

  return (
    <>
      {/* Mini Player */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={() => setIsExpanded(true)}
            className="fixed bottom-20 left-4 right-4 glass rounded-3xl p-3 flex items-center gap-3 z-30 cursor-pointer shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-dazai-dim flex-shrink-0 overflow-hidden">
              {currentSong.cover ? (
                <img src={currentSong.cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="text-dazai-muted" size={24} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold truncate text-white uppercase tracking-tight">{currentSong.title}</h4>
              <p className="text-[10px] text-dazai-muted truncate uppercase tracking-widest">{currentSong.artist}</p>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="p-3 bg-dazai-accent text-white rounded-full shadow-lg active:scale-90 transition-transform"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
            </div>

            {/* Progress bar line fixed at bottom of bar */}
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-white/5 overflow-hidden rounded-full">
              <div 
                className="h-full bg-dazai-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-dazai-black z-50 flex flex-col p-8 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-dazai-dim rounded-full transition-colors">
                <ChevronUp className="rotate-180" size={28} />
              </button>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-dazai-muted">جارِ الاستكشاف</h2>
              <button className="p-2 hover:bg-dazai-dim rounded-full transition-colors">
                <Music2 size={24} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-12">
              {/* Album Art Container */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-[320px] aspect-square"
              >
                <div className="absolute inset-0 bg-dazai-accent/20 blur-[60px] rounded-full" />
                <div className="relative w-full h-full glass rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
                  {currentSong.cover ? (
                    <img src={currentSong.cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-dazai-dim">
                      <Music2 size={120} className="text-dazai-accent/20" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Title & Artist */}
              <div className="w-full text-center space-y-2">
                <h1 className="text-2xl font-bold text-white tracking-tight uppercase">{currentSong.title}</h1>
                <p className="text-sm font-medium text-dazai-accent tracking-[0.2em] uppercase">{currentSong.artist}</p>
              </div>

              {/* Progress Slider */}
              <div className="w-full space-y-4">
                <div className="relative h-1.5 w-full bg-dazai-dim rounded-full cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  seek((x / rect.width) * 100);
                }}>
                  <div className="absolute h-full bg-dazai-accent rounded-full" style={{ width: `${progress}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg border-2 border-dazai-accent" style={{ left: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-dazai-muted">
                  <span>{formatTime(Math.floor((progress / 100) * duration))}</span>
                  <span>{formatTime(Math.floor(duration))}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full flex items-center justify-between px-4">
                <button 
                  onClick={() => setShowSleepPicker(!showSleepPicker)}
                  className={`p-2 rounded-full transition-colors ${sleepTimer ? 'text-dazai-accent bg-dazai-accent/10' : 'text-dazai-muted hover:bg-dazai-dim'}`}
                >
                  <Clock size={20} />
                </button>
                <div className="flex items-center gap-8">
                  <button onClick={previous} className="text-white hover:text-dazai-accent transition-colors"><SkipBack size={32} /></button>
                  <button onClick={togglePlay} className="w-20 h-20 bg-white text-dazai-black rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all">
                    {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} className="ml-1.5" fill="currentColor" />}
                  </button>
                  <button onClick={next} className="text-white hover:text-dazai-accent transition-colors"><SkipForward size={32} /></button>
                </div>
                <button 
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-dazai-accent bg-dazai-accent/10' : 'text-dazai-muted hover:bg-dazai-dim'}`}
                >
                  <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Sleep Timer Picker */}
            <AnimatePresence>
              {showSleepPicker && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-24 left-8 right-8 glass p-6 rounded-3xl z-50 flex flex-wrap gap-2 justify-center"
                >
                  {[15, 30, 45, 60, 0].map(mins => (
                    <button
                      key={mins}
                      onClick={() => {
                        setSleepTimer(mins === 0 ? null : mins);
                        setShowSleepPicker(false);
                      }}
                      className="px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-dazai-accent transition-colors"
                    >
                      {mins === 0 ? 'إيقاف المؤقت' : `${mins} دقيقة`}
                    </button>
                  ))}
                  {sleepTimer && (
                    <p className="w-full text-center text-[10px] text-dazai-accent mt-2 font-mono">
                      باقي {sleepTimer} دقيقة على الصمت الوجودي
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
