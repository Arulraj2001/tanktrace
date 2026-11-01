import React, { useState, useRef } from 'react';
import { WaterbodyFeature } from '../types';
import { DataService } from '../services/dataService';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  AlertTriangle, 
  FileText, 
  Database
} from 'lucide-react';

interface GeoJsonImporterProps {
  onClose: () => void;
  onImportSuccess: (features: WaterbodyFeature[]) => void;
}

export const GeoJsonImporter: React.FC<GeoJsonImporterProps> = ({
  onClose,
  onImportSuccess
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    setWarnings([]);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { features, warnings: parseWarnings } = DataService.parseUserGeoJson(text);
        setWarnings(parseWarnings);
        onImportSuccess(features);
      } catch (err: any) {
        setError(err.message || 'Failed to parse GeoJSON file.');
      }
    };
    reader.onerror = () => {
      setError('Error reading file from disk.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const loadSampleDataset = async () => {
    setIsLoadingSample(true);
    setError(null);
    try {
      const res = await fetch('/data/sample_import.geojson');
      if (!res.ok) throw new Error('Sample GeoJSON not found on server.');
      const text = await res.text();
      const { features, warnings: parseWarnings } = DataService.parseUserGeoJson(text);
      setWarnings(parseWarnings);
      setFileName('sample_import.geojson');
      onImportSuccess(features);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample dataset.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/80">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Waterbodies GeoJSON</h3>
              <p className="text-xs text-slate-400">
                Add custom water body surveys, field points, or shapefile extracts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag and Drop Box */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-sky-400 bg-sky-950/40 scale-[1.01]'
              : 'border-slate-700 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".geojson,.json"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <div className="text-sm font-semibold text-slate-200">
            {fileName ? (
              <span className="text-sky-400 flex items-center justify-center gap-1.5">
                <FileCheck className="w-4 h-4" /> {fileName}
              </span>
            ) : (
              'Click to browse or drop your .geojson file here'
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Accepts standard WGS84 GeoJSON FeatureCollection (Points or Polygons)
          </p>
        </div>

        {/* Quick Sample Button */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div>
            <div className="font-semibold text-slate-300">Test with Verified Sample</div>
            <div className="text-[11px] text-slate-500">
              50 landmark tanks and historical reservoirs in Tamil Nadu
            </div>
          </div>
          <button
            onClick={loadSampleDataset}
            disabled={isLoadingSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            {isLoadingSample ? 'Loading...' : 'Load Sample'}
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Import Error</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Warnings Feedback */}
        {warnings.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs max-h-24 overflow-y-auto">
            <div className="font-semibold mb-0.5">Coordinates Notice:</div>
            {warnings.slice(0, 3).map((w, i) => (
              <div key={i} className="text-[11px] text-amber-300/80">{w}</div>
            ))}
            {warnings.length > 3 && (
              <div className="text-[10px] text-amber-400">...and {warnings.length - 3} more</div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
