import React from 'react';
import { BasemapProvider, AWSConfig } from '../types';
import { 
  Droplets, 
  UploadCloud, 
  Info, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  awsConfig: AWSConfig;
  currentBasemap: BasemapProvider;
  onSelectBasemap: (provider: BasemapProvider) => void;
  onOpenStory: () => void;
  onOpenImport: () => void;
  onOpenAbout: () => void;
  totalVisibleCount: number;
  totalDatasetCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  awsConfig,
  currentBasemap,
  onSelectBasemap,
  onOpenStory,
  onOpenImport,
  onOpenAbout,
  totalVisibleCount,
  totalDatasetCount
}) => {
  return (
    <header className="relative z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between text-white shadow-lg">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/20">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
              TankTrace
            </h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800/80">
              AWS Map It
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Tamil Nadu's Hidden Water Network
          </p>
        </div>
      </div>

      {/* Dataset Statistics Pill */}
      <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">Visible:</span>
          <span className="font-semibold text-white">{totalVisibleCount.toLocaleString()}</span>
          <span className="text-slate-500">/ {totalDatasetCount.toLocaleString()}</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="text-slate-300">
          State Water Area: <span className="font-semibold text-sky-400">696,538 ha</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="text-slate-300">
          Man-Made Eris: <span className="font-semibold text-cyan-400">97.1%</span>
        </div>
      </div>

      {/* Action Buttons & Basemap Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Basemap Switcher */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={currentBasemap}
              onChange={(e) => onSelectBasemap(e.target.value as BasemapProvider)}
              className="bg-transparent border-none text-xs focus:ring-0 focus:outline-none cursor-pointer pr-1 text-slate-200"
            >
              <option value="aws-location" className="bg-slate-900 text-white">
                Amazon Location {awsConfig.isConfigured ? '✓' : '(Fallback)'}
              </option>
              <option value="carto-dark" className="bg-slate-900 text-white">Carto Dark Matter</option>
              <option value="carto-light" className="bg-slate-900 text-white">Carto Positron</option>
              <option value="satellite" className="bg-slate-900 text-white">Esri Satellite</option>
              <option value="osm" className="bg-slate-900 text-white">OpenStreetMap</option>
            </select>
          </div>
        </div>

        {/* AWS Status Badge */}
        <div 
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border cursor-help transition-colors"
          title={awsConfig.isConfigured 
            ? `Connected to Amazon Location Service (Map: ${awsConfig.mapName}, Region: ${awsConfig.region})`
            : "Amazon Location Service ready. Configurable via VITE_AWS_LOCATION_API_KEY. Currently using Carto/OSM fallback."
          }
        >
          {awsConfig.isConfigured ? (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border-emerald-800/70 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" /> AWS Location Active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sky-400 bg-sky-950/60 border-sky-800/60 px-2 py-0.5 rounded">
              <HelpCircle className="w-3 h-3" /> AWS Ready (OSM Mode)
            </span>
          )}
        </div>

        {/* Story Mode */}
        <button
          onClick={onOpenStory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-sky-900/30 transition-all transform active:scale-95"
          title="Guided Tour: Discover the Network"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Discover Network</span>
          <span className="sm:hidden">Story</span>
        </button>

        {/* Import GeoJSON */}
        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition-colors"
          title="Import or upload custom GeoJSON"
        >
          <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Import</span>
        </button>

        {/* About / Sources */}
        <button
          onClick={onOpenAbout}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title="About Data Sources & AWS Architecture"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
