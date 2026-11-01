import React from 'react';
import { 
  X, 
  Droplets, 
  Cloud, 
  MapPin, 
  ShieldCheck, 
  Database, 
  Cpu,
  Layers
} from 'lucide-react';
import { AWSConfig } from '../types';

interface AboutModalProps {
  onClose: () => void;
  awsConfig: AWSConfig;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, awsConfig }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">TankTrace</h2>
              <p className="text-xs text-sky-400 font-medium">
                Tamil Nadu's Hidden Water Network • AWS Builder Center Challenge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Mission Overview */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400" /> Project Overview
            </h4>
            <p>
              TankTrace maps and analyzes Tamil Nadu's traditional cascading water bodies (known historically as <i>Eris</i>), reservoirs, and wetland networks. Built for the AWS Builder Center "Weekend Challenge: Map It", the application reveals how ancient community water harvesting systems continue to form the backbone of peninsular India's hydrological resilience.
            </p>
          </div>

          {/* Authentic Dataset Verification */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Dataset & Attribution
            </h4>
            <p className="mb-2">
              Every point and boundary in TankTrace originates from authentic, official geospatial datasets:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li>
                <strong className="text-white">Water Bodies Inventory:</strong> Space Applications Centre (SAC), Indian Space Research Organisation (ISRO) & National Water Informatics Centre (NWIC), Ministry of Jal Shakti. Contains 64,493 verified water bodies mapped across Tamil Nadu.
              </li>
              <li>
                <strong className="text-white">Attributes Captured:</strong> Surface area (ha), type classification (Tank/Pond, Reservoir, Lake, Wetland), man-made vs natural classification, turbidity index, aquatic vegetation, and exact geographic coordinates.
              </li>
              <li>
                <strong className="text-white">Strict Compliance:</strong> No synthetic groundwater stress values, fabricated risk metrics, or fake markers are used.
              </li>
            </ul>
          </div>

          {/* AWS Architecture */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-400" /> AWS Architecture & Cloud Integration
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Amazon Location Service:</strong>
                  <span>Provides secure, performant map tiles. Configurable via <code>VITE_AWS_LOCATION_API_KEY</code> and <code>VITE_AWS_LOCATION_MAP_NAME</code>. Current status: </span>
                  <span className={`font-semibold ${awsConfig.isConfigured ? 'text-emerald-400' : 'text-sky-400'}`}>
                    {awsConfig.isConfigured ? 'Connected to AWS Location' : 'Using graceful OpenStreetMap / Carto fallback (AWS Ready)'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Database className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Amazon Simple Storage Service (S3):</strong>
                  <span>Hosts processed geospatial datasets (GeoJSON and binary compact records) for global edge distribution via S3 bucket endpoints (<code>VITE_S3_DATA_URL</code>).</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block">AWS Amplify Hosting:</strong>
                  <span>Continuous deployment and edge hosting via <code>amplify.yml</code> build specifications.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Traditional Hydrological Heritage */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-1.5">
              The Hydrological Significance of the Eri System
            </h4>
            <p>
              Over <b>97.1% (62,639)</b> of all mapped water bodies in Tamil Nadu are man-made tanks. Built by Pallava, Chola, and Pandya dynasties over 1,000 years ago, these cascading systems capture monsoon torrents, slow down runoff, prevent severe soil erosion, and replenish unconfined aquifers across drought-prone plains.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            TankTrace v1.0 • Built with React, Vite & AWS
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
