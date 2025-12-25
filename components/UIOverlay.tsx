
import React from 'react';
import { AppState } from '../types';

interface UIOverlayProps {
  state: AppState;
  onToggle: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ state, onToggle }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-12 select-none">
      {/* Top Heading */}
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold text-yellow-500 mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">
          MAGNIFICENT
        </h1>
        <h2 className="text-2xl md:text-3xl font-light text-yellow-100/80 italic tracking-[0.2em] uppercase">
          Holiday Celebration
        </h2>
      </div>

      {/* The Magic Letter - Only appears in CHAOS state */}
      {state === 'CHAOS' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm animate-fade-in z-50">
          <div className="relative bg-[#fdfaf1] w-full max-w-lg mx-4 p-10 md:p-16 border-[12px] border-double border-yellow-600 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-slide-up rotate-1">
            {/* Wax Seal Decoration */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-red-700 rounded-full shadow-lg border-4 border-red-800 flex items-center justify-center">
              <span className="text-yellow-500 font-bold text-2xl">M</span>
            </div>
            
            <div className="space-y-8 text-emerald-900">
              <div className="border-b-2 border-yellow-600/30 pb-4 text-center">
                <p className="text-sm tracking-[0.3em] uppercase font-bold text-yellow-700 font-serif">Magnificent Estate</p>
              </div>
              
              <div className="pt-4 text-center">
                <h3 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight text-emerald-950">
                  圣诞快乐
                </h3>
                <div className="h-1 w-24 bg-yellow-600 mx-auto mb-8 opacity-50"></div>
                
                <p className="text-4xl md:text-6xl font-extrabold text-yellow-700 tracking-widest py-4 drop-shadow-sm">
                  罗佳莹
                </p>
                
                <p className="text-lg md:text-xl mt-8 leading-relaxed text-emerald-800 font-medium">
                  愿星光璀璨，伴你岁岁平安。<br/>
                  愿繁花盛景，映你前程似锦。
                </p>
              </div>
              
              <div className="pt-8 text-right space-y-1">
                <p className="italic text-xl font-serif">With highest regards,</p>
                <p className="font-bold text-2xl text-yellow-700 tracking-tighter font-serif">The Grand Committee</p>
              </div>
            </div>

            {/* Corner Embellishments */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-yellow-600/20"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-yellow-600/20"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-yellow-600/20"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-yellow-600/20"></div>

            {/* Close Button on the letter */}
            <button 
              onClick={onToggle}
              className="mt-12 w-full py-4 border-2 border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white transition-colors font-bold tracking-widest uppercase text-sm"
            >
              Reconstruct the Glory
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-6 pointer-events-auto">
        <button
          onClick={onToggle}
          className="group relative px-10 py-4 overflow-hidden rounded-full border border-yellow-500/50 bg-black/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-400/20 to-yellow-600/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative text-yellow-400 font-bold tracking-widest text-lg">
            {state === 'CHAOS' ? 'RECONSTRUCT THE GLORY' : 'RELEASE THE MAGIC'}
          </span>
        </button>

        <p className="text-yellow-100/40 text-sm tracking-widest uppercase text-center max-w-md font-medium">
            Interactive Dual-Coordinate Morphed Geometry <br/>
            Engineered for High-Fidelity Performance
        </p>
      </div>

      {/* Side Decorative Text */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 -rotate-90 hidden lg:block">
        <span className="text-yellow-600/30 text-xs tracking-[1em] uppercase whitespace-nowrap font-bold">
            Emerald Gold & High-Gloss Brass
        </span>
      </div>
      <div className="absolute right-10 top-1/2 -translate-y-1/2 rotate-90 hidden lg:block">
        <span className="text-yellow-600/30 text-xs tracking-[1em] uppercase whitespace-nowrap font-bold">
            Cinematic Bloom Post-Process
        </span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up {
          from { transform: translateY(50px) rotate(1deg); opacity: 0; }
          to { transform: translateY(0) rotate(1deg); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default UIOverlay;
