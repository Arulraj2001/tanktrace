import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

export const Legend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="absolute bottom-6 left-4 z-20 w-64 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl text-white overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between font-semibold text-slate-300 hover:text-white border-b border-slate-800/80 bg-slate-950/40"
      >
        <div className="flex items-center gap-1.5 text-[11px]">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Map Legend & Classification</span>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="p-3 space-y-3">
          {/* Waterbody Types */}
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 tracking-wider">
              Water Body Type
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400 border border-sky-300"></span>
                <span className="text-slate-200">Tank / Pond (Traditional Eri)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-400 border border-purple-300"></span>
                <span className="text-slate-200">Reservoir / Barrage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-400 border border-teal-300"></span>
                <span className="text-slate-200">Lake / Natural Pond</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-300"></span>
                <span className="text-slate-200">Aquaculture Pond</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-300"></span>
                <span className="text-slate-200">Creek / Lagoon / Wetland</span>
              </div>
            </div>
          </div>

          {/* District Density Scale */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 tracking-wider">
              District Eri Density
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Low (&lt;1,000)</span>
              <span>High (5,000+)</span>
            </div>
            <div className="h-2 rounded-full w-full bg-gradient-to-r from-sky-200 via-sky-500 to-sky-900 border border-slate-700/60" />
          </div>

          {/* Marker Size Scale */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Marker Radius:</span>
            <span className="text-slate-300">Scaled to Surface Area (ha)</span>
          </div>
        </div>
      )}
    </div>
  );
};
