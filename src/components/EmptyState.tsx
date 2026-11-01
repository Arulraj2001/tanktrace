import React from 'react';
import { SearchX, RotateCcw, AlertTriangle, Loader2, UploadCloud } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'loading' | 'error' | 'no-data';
  message?: string;
  onResetFilters?: () => void;
  onOpenImport?: () => void;
  onRetry?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  onResetFilters,
  onOpenImport,
  onRetry
}) => {
  if (type === 'loading') {
    return (
      <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin" />
          <Loader2 className="w-8 h-8 text-sky-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Loading Tamil Nadu Water Network...
        </h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Streaming verified hydrological records and district boundaries from geospatial storage.
        </p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          Geospatial Data Error
        </h3>
        <p className="text-xs text-slate-400 max-w-md mb-4">
          {message || 'Could not load water body records. Please verify your connection or import a GeoJSON file.'}
        </p>
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-colors"
            >
              Retry
            </button>
          )}
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Import GeoJSON
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-5 py-4 shadow-xl text-white flex items-center gap-4 text-xs animate-in fade-in duration-200">
        <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
          <SearchX className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="font-semibold text-slate-200">No matching water bodies</div>
          <div className="text-[11px] text-slate-400">
            Try adjusting your search query, district filter, or area range.
          </div>
        </div>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors ml-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-sky-400 border border-slate-800 flex items-center justify-center mb-3">
        <UploadCloud className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">
        No Dataset Active
      </h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4">
        Import a GeoJSON file with Tamil Nadu water bodies or load the pre-processed dataset.
      </p>
      {onOpenImport && (
        <button
          onClick={onOpenImport}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-colors"
        >
          Import Dataset
        </button>
      )}
    </div>
  );
};
