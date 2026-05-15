import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { Activity, Clock, Music, Trophy, Disc } from 'lucide-react';
import { startOfDay, format, subDays } from 'date-fns';

export default function StatsView() {
  const stats = useLiveQuery(() => db.stats.toArray());
  const songCount = useLiveQuery(() => db.songs.count());
  
  if (!stats) return null;

  // Process data for charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), i);
    const dTime = startOfDay(d).getTime();
    return {
      name: format(d, 'eee'),
      count: stats.filter(s => startOfDay(new Date(s.timestamp)).getTime() === dTime).length
    };
  }).reverse();

  const totalListens = stats.length;
  const topSongId = stats.reduce((acc, curr) => {
    acc[curr.songId] = (acc[curr.songId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const entries = Object.entries(topSongId) as [string, number][];
  const topSongEntry = entries.sort((a,b) => b[1] - a[1])[0];

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">إحصائيات وجودية</h2>
        <Activity className="text-dazai-accent animate-pulse" />
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-6 rounded-[2rem] border-white/5 space-y-2">
          <Clock className="text-dazai-muted" size={24} />
          <h3 className="text-3xl font-mono font-bold">{totalListens}</h3>
          <p className="text-[10px] uppercase tracking-widest text-dazai-muted">إجمالي الاستماع</p>
        </div>
        <div className="glass p-6 rounded-[2rem] border-white/5 space-y-2">
          <Music className="text-dazai-muted" size={24} />
          <h3 className="text-3xl font-mono font-bold">{songCount || 0}</h3>
          <p className="text-[10px] uppercase tracking-widest text-dazai-muted">مقطوعة فريدة</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass p-6 rounded-[2rem] border-white/5 h-64">
        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-dazai-muted">نشاط الاستماع</h4>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={last7Days}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8E0A0A" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8E0A0A" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#808080', fontSize: 10}}
                padding={{ left: 10, right: 10 }}
            />
            <Tooltip 
              contentStyle={{ background: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '12px' }}
              itemStyle={{ color: '#E0E0E0' }}
            />
            <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#8E0A0A" 
                fillOpacity={1} 
                fill="url(#colorCount)" 
                strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Motivation/Existential quote */}
      <div className="p-8 border border-dazai-accent/20 rounded-[2rem] bg-dazai-accent/5 relative overflow-hidden">
        <Disc className="absolute -bottom-8 -right-8 text-dazai-accent/10 w-48 h-48 animate-spin-slow" />
        <div className="relative z-10 space-y-2">
           <Trophy className="text-dazai-accent mb-2" size={20} />
           <p className="text-sm italic leading-relaxed text-dazai-text/80">
             "أعتقد أن الاستماع للموسيقى هو محاولة أخيرة للهرب من الصمت الوجودي."
           </p>
           <p className="text-[10px] uppercase tracking-widest text-dazai-accent">- فلسفة دازاي</p>
        </div>
      </div>
    </div>
  );
}
