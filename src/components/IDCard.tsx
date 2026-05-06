/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, Database } from 'lucide-react';
import { CardConfig, UserData } from '../types';

interface IDCardProps {
  config: CardConfig;
  data: UserData;
}

export default function IDCard({ config, data }: IDCardProps) {
  return (
    <div 
      className="w-full max-w-[480px] aspect-[1.6/1] rounded-3xl shadow-2xl border flex flex-col justify-between relative overflow-hidden transition-all duration-500"
      style={{ 
        backgroundColor: config.colors.secondary,
        borderColor: `${config.colors.primary}40`,
        fontFamily: `var(--${config.font})`
      }}
    >
      {/* Animated Glow */}
      <div 
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: config.colors.accent }}
      ></div>
      
      <div className="relative h-full w-full">
        {/* Avatar / User Image */}
        <div 
          className="absolute bg-slate-800 overflow-hidden flex items-center justify-center border border-white/10"
          style={{ 
            left: config.elements.avatar.x, 
            top: config.elements.avatar.y, 
            width: config.elements.avatar.size, 
            height: config.elements.avatar.size,
            borderRadius: config.elements.avatar.rounded || 0
          }}
        >
          {data.imageUrl ? (
            <img src={data.imageUrl} alt="User Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <Activity size={config.elements.avatar.size * 0.5} style={{ color: config.colors.primary }} className="animate-pulse" />
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: config.colors.primary }}></div>
        </div>

        {/* Title / Name */}
        <h3 
          className="absolute leading-none tracking-tight transition-all"
          style={{ 
            left: config.elements.title.x, 
            top: config.elements.title.y, 
            fontSize: config.elements.title.size,
            color: config.colors.text,
            fontWeight: config.elements.title.weight === 'black' ? 900 : 700
          }}
        >
          {data.fullName || "John Doe"}
        </h3>

        {/* Subtitle / Role */}
        <p 
          className="absolute uppercase tracking-[0.2em] transition-all opacity-80"
          style={{ 
            left: config.elements.subtitle.x, 
            top: config.elements.subtitle.y, 
            fontSize: config.elements.subtitle.size,
            color: config.colors.primary,
            fontWeight: 500
          }}
        >
          {data.role || "Operational Identity"}
        </p>

        {/* Badge/Info */}
        <div 
           className="absolute flex items-center gap-1.5 transition-all"
           style={{ 
             left: config.elements.badge.x, 
             top: config.elements.badge.y
           }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span 
            className="font-bold uppercase tracking-wider opacity-60"
            style={{ 
              fontSize: config.elements.badge.size,
              color: config.colors.text
            }}
          >
            Verified Identity
          </span>
        </div>

        {/* QR / ID Symbol */}
        <div 
          className="absolute w-16 h-16 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur flex items-center justify-center"
          style={{ right: 24, top: 24 }}
        >
          <Database size={24} style={{ color: config.colors.accent }} />
        </div>
      </div>

      {/* Card Footer */}
      <div 
        className="h-20 flex justify-between items-end p-8 border-t"
        style={{ borderColor: `${config.colors.text}10` }}
      >
        <div className="space-y-1">
          <p className="text-[9px] uppercase font-black tracking-widest opacity-40" style={{ color: config.colors.text }}>Issue Date</p>
          <p className="text-xs font-mono tracking-tighter" style={{ color: config.colors.text }}>{data.issueDate}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[9px] uppercase font-black tracking-widest opacity-40" style={{ color: config.colors.text }}>Serial Number</p>
          <p className="text-xs font-mono" style={{ color: config.colors.primary }}>{data.idNumber}</p>
        </div>
      </div>
    </div>
  );
}
