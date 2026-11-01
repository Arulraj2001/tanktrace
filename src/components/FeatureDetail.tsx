import React, { useState } from 'react';
import { WaterbodyFeature } from '../types';
import { 
  X, 
  MapPin, 
  Maximize2, 
  Copy, 
  Check, 
  Droplet, 
  ShieldCheck 
} from 'lucide-react';

interface FeatureDetailProps {
  waterbody: WaterbodyFeature | null;
  onClose: () => void;
  onFocus: (wb: WaterbodyFeature) => void;
}

export const FeatureDetail: React.FC<FeatureDetailProps> = ({
  waterbody,
  onClose,
  onFocus
}) => {
  const [copied, setCopied] = useState(false);

  if (!waterbody) return null;

  const handleCopyCoords = () => {
    const text = `${waterbody.lat.toFixed(5)}, ${waterbody.long.toFixed(5)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const areaHa = waterbody.area_ha || 0;
  const areaAcres = (areaHa * 2.47105).toFixed(1);
  const areaSqKm = (areaHa / 100.0).toFixed(3);

  return (
    <div className="absolute bottom-6 right-6 z-20 w-84 md:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-white animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Top Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div className="pr-4">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
            <Droplet className="w-3.5 h-3.5" />
            <span>{waterbody.type}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-normal">#{waterbody.id}</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 leading-snug">
            {waterbody.name || `${waterbody.type} #${waterbody.id}`}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Details */}
      <div className="py-4 space-y-3.5 text-xs">
        {/* District & Location */}
        <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">District</div>
              <div className="font-semibold text-slate-200">{waterbody.district}</div>
            </div>
          </div>
          <button
            onClick={() => onFocus(waterbody)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600/80 hover:bg-sky-500 text-white text-[11px] font-medium transition-colors"
            title="Focus camera on this water body"
          >
            <Maximize2 className="w-3 h-3" /> Focus
          </button>
        </div>

        {/* Surface Area Breakdown */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
            Verified Surface Water Area
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <div className="text-sm font-bold text-sky-300">{areaHa.toFixed(1)}</div>
              <div className="text-[10px] text-slate-400">Hectares</div>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <div className="text-sm font-bold text-cyan-300">{areaAcres}</div>
              <div className="text-[10px] text-slate-400">Acres</div>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <div className="text-sm font-bold text-emerald-300">{areaSqKm}</div>
              <div className="text-[10px] text-slate-400">Sq Km</div>
            </div>
          </div>
        </div>

        {/* Hydrological Attributes */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Classification</span>
            <span className="font-semibold text-slate-200">{waterbody.classification}</span>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Turbidity</span>
            <span className={`font-semibold ${
              waterbody.turbidity === 'High' ? 'text-amber-400' :
              waterbody.turbidity === 'Moderate' ? 'text-sky-300' : 'text-emerald-400'
            }`}>
              {waterbody.turbidity}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Aquatic Vegetation</span>
            <span className="font-semibold text-slate-200">
              {waterbody.vegetation === 'Yes' ? 'Present' : 'Clear / Absent'}
            </span>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Coordinates (WGS84)</span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-300">
                {waterbody.lat.toFixed(4)}, {waterbody.long.toFixed(4)}
              </span>
              <button
                onClick={handleCopyCoords}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy coordinates"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Data Source Footnote */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          <span>Source: {waterbody.source}</span>
        </div>
      </div>
    </div>
  );
};
