import React, { useCallback, useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useAudio } from '../context/AudioContext';
import { useDropzone } from 'react-dropzone';
import { addSongsToLibrary, scanDirectory } from '../lib/scanner';
import { Play, MoreVertical, Disc, Loader2, Plus, Clock, Music2, Edit2, X, Check, FolderSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Song } from '../types';

export default function LibraryView({ filter = 'all' }: { filter?: 'all' | 'favorites' }) {
  const { playSong, currentSong, isPlaying } = useAudio();
  const [isScanning, setIsScanning] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);

  const songs = useLiveQuery(
    async () => {
      if (filter === 'favorites') {
        const favs = await db.favorites.toArray();
        const ids = favs.map(f => f.songId);
        return db.songs.where('id').anyOf(ids).toArray();
      }
      return db.songs.orderBy('addedAt').reverse().toArray();
    },
    [filter]
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsScanning(true);
    await addSongsToLibrary(acceptedFiles);
    setIsScanning(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.flac', '.wav', '.m4a', '.ogg'] },
    noClick: !!songs?.length,
  } as any);

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong?.id) return;
    await db.songs.update(editingSong.id, editingSong);
    setEditingSong(null);
  };

  const handleScanFolder = async () => {
    try {
      // First try the modern API if not in an iframe restriction
      if ('showDirectoryPicker' in window) {
        try {
          const handle = await (window as any).showDirectoryPicker();
          setIsScanning(true);
          await scanDirectory(handle);
          setIsScanning(false);
          return;
        } catch (err: any) {
          // If security error (like in iframe), fallback to input
          if (err.name !== 'SecurityError') {
            console.error(err);
            setIsScanning(false);
            return;
          }
        }
      }
      
      // Fallback for iframes and older browsers
      dirInputRef.current?.click();
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const handleDirInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsScanning(true);
    await addSongsToLibrary(Array.from(files));
    setIsScanning(false);
    e.target.value = ''; // Reset for next use
  };

  if (!songs) return <div className="p-8 text-center text-dazai-muted">جاري التحميل...</div>;

  return (
    <div className="p-4 space-y-6">
      {/* Hidden input for directory scanning fallback */}
      <input
        type="file"
        ref={dirInputRef}
        onChange={handleDirInputChange}
        className="hidden"
        {...( { webkitdirectory: "", directory: "" } as any)}
      />
      {songs.length === 0 && !isScanning ? (
        <div 
          {...getRootProps()} 
          className={`h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all ${isDragActive ? 'border-dazai-accent bg-dazai-accent/5' : 'border-white/10 bg-dazai-dark'}`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-dazai-dim rounded-full flex items-center justify-center mb-4">
            <Plus className="text-dazai-accent" size={32} />
          </div>
          <h2 className="text-lg font-medium">أضف بعض الموسيقى</h2>
          <p className="text-sm text-dazai-muted mt-2">اسحب الملفات هنا أو استخدم الفحص الذكي للمجلدات</p>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={(e) => { e.stopPropagation(); handleScanFolder(); }}
              className="px-6 py-2 bg-dazai-accent text-white rounded-full font-medium active:scale-95 transition-transform flex items-center gap-2"
            >
              <FolderSearch size={18} />
              فحص مجلد كامل
            </button>
            <button className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-full font-medium active:scale-95 transition-transform">
              اختيار ملفات
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Disc className="text-dazai-accent" size={24} />
              {filter === 'all' ? 'جميع المقطوعات' : 'المفضلة وجودياً'}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handleScanFolder}
                title="فحص مجلد"
                className="p-2 bg-dazai-accent/10 rounded-full hover:bg-dazai-accent/20 cursor-pointer transition-colors"
              >
                <FolderSearch className="text-dazai-accent" size={20} />
              </button>
              <div 
                {...getRootProps()} 
                className="p-2 bg-dazai-accent/10 rounded-full hover:bg-dazai-accent/20 cursor-pointer transition-colors"
              >
                <input {...getInputProps()} />
                {isScanning ? <Loader2 className="animate-spin text-dazai-accent" size={20} /> : <Plus className="text-dazai-accent" size={20} />}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            {songs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer group card-hover ${currentSong?.id === song.id ? 'bg-dazai-accent/5 border border-dazai-accent/20' : 'bg-white/5 border border-transparent'}`}
              >
                <div 
                  onClick={() => playSong(song)}
                  className="relative w-12 h-12 rounded-xl overflow-hidden bg-dazai-dim flex-shrink-0"
                >
                  {song.cover ? (
                    <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="text-dazai-muted" size={20} />
                    </div>
                  )}
                  {currentSong?.id === song.id && isPlaying && (
                    <div className="absolute inset-0 bg-dazai-accent/40 flex items-center justify-center">
                      <div className="flex gap-0.5 items-end h-4">
                        <div className="w-1 bg-white animate-[bounce_0.6s_ease-in-out_infinite]" />
                        <div className="w-1 bg-white animate-[bounce_0.8s_ease-in-out_infinite]" />
                        <div className="w-1 bg-white animate-[bounce_0.7s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0" onClick={() => playSong(song)}>
                  <h3 className={`font-medium truncate ${currentSong?.id === song.id ? 'text-dazai-accent' : 'text-white'}`}>
                    {song.title}
                  </h3>
                  <p className="text-xs text-dazai-muted truncate">{song.artist}</p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={() => setEditingSong(song)}
                    className="p-2 hover:bg-dazai-dim rounded-full transition-colors text-dazai-muted hover:text-white"
                   >
                    <Edit2 size={16} />
                   </button>
                </div>

                <div className="text-xs text-dazai-muted font-mono flex flex-col items-end gap-1">
                  <span>{Math.floor(song.duration / 60)}:{String(Math.floor(song.duration % 60)).padStart(2, '0')}</span>
                  {song.playCount > 0 && (
                    <span className="text-[9px] opacity-70">x{song.playCount}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <AnimatePresence>
        {editingSong && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onSubmit={handleUpdateSong}
              className="w-full max-w-md glass p-8 rounded-[2rem] space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">تعديل البيانات</h3>
                <button type="button" onClick={() => setEditingSong(null)} className="p-2 hover:bg-dazai-dim rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-dazai-muted px-2">العنوان</label>
                  <input 
                    value={editingSong.title}
                    onChange={e => setEditingSong({...editingSong, title: e.target.value})}
                    className="w-full bg-dazai-dim border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-dazai-accent outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-dazai-muted px-2">الفنان</label>
                  <input 
                    value={editingSong.artist}
                    onChange={e => setEditingSong({...editingSong, artist: e.target.value})}
                    className="w-full bg-dazai-dim border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-dazai-accent outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-dazai-muted px-2">الألبوم</label>
                  <input 
                    value={editingSong.album}
                    onChange={e => setEditingSong({...editingSong, album: e.target.value})}
                    className="w-full bg-dazai-dim border border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-dazai-accent outline-none transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-dazai-accent text-white py-4 rounded-3xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                حفظ التعديلات
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

