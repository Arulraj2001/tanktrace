import React, { useState } from 'react';
import { FilterState } from '../types';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  MapPin,
  Waves,
  Eye,
  EyeOff
} from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  districts: string[];
  types: string[];
  totalFilteredCount: number;
  totalDatasetCount: number;
  showDistricts: boolean;
  setShowDistricts: (val: boolean) => void;
  showWaterbodies: boolean;
  setShowWaterbodies: (val: boolean) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  districts,
  types,
  totalFilteredCount,
  totalDatasetCount,
  showDistricts,
  setShowDistricts,
  showWaterbodies,
  setShowWaterbodies
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      selectedDistrict: 'All',
      selectedType: 'All',
      selectedTurbidity: 'All',
      selectedVegetation: 'All',
      minAreaHa: 0,
      maxAreaHa: 100000
    });
  };

  const isFiltered = 
    filters.searchQuery !== '' ||
    filters.selectedDistrict !== 'All' ||
    filters.selectedType !== 'All' ||
    filters.selectedTurbidity !== 'All' ||
    filters.selectedVegetation !== 'All' ||
    filters.minAreaHa > 0;

  return (
    <div className={`absolute top-20 left-4 z-20 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-10' : 'w-80 md:w-88'
    }`}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-5 z-30 w-7 h-7 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center shadow-md shadow-black/40 transition-colors"
        title={isCollapsed ? 'Expand Filters' : 'Collapse Filters'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Collapsed State Icon Bar */}
      {isCollapsed ? (
        <div 
          onClick={() => setIsCollapsed(false)}
          className="w-10 h-32 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-xl text-slate-400 hover:text-sky-400 transition-colors"
        >
          <Filter className="w-5 h-5 text-sky-400" />
          <span className="text-[10px] font-bold text-slate-300 writing-mode-vertical rotate-180">
            FILTERS
          </span>
        </div>
      ) : (
        /* Expanded Floating Card */
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-4 text-white overflow-hidden max-h-[calc(100vh-120px)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-slate-100">Explore & Filter</h2>
            </div>
            {isFiltered && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          <div className="overflow-y-auto pr-1 py-3 space-y-4 text-xs scrollbar-thin">
            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Search Feature Name or ID
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Veeranam, Chembarambakkam, #5091..."
                  value={filters.searchQuery}
                  onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* District Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-400" /> District
                </label>
                <span className="text-[10px] text-slate-500">
                  {filters.selectedDistrict === 'All' ? 'All 30 Districts' : '1 Selected'}
                </span>
              </div>
              <select
                value={filters.selectedDistrict}
                onChange={(e) => onFilterChange({ ...filters, selectedDistrict: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="All">All Tamil Nadu Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Waterbody Type Filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                <Waves className="w-3 h-3 text-sky-400" /> Water Body Classification
              </label>
              <select
                value={filters.selectedType}
                onChange={(e) => onFilterChange({ ...filters, selectedType: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="All">All Types (Tanks, Lakes, Reservoirs...)</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Area Range */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Minimum Water Surface Area
                </label>
                <span className="text-[11px] font-semibold text-sky-400">
                  {filters.minAreaHa === 0 ? 'All sizes' : `> ${filters.minAreaHa} ha`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: 'All', val: 0 },
                  { label: '>5 ha', val: 5 },
                  { label: '>25 ha', val: 25 },
                  { label: '>100 ha', val: 100 }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => onFilterChange({ ...filters, minAreaHa: item.val })}
                    className={`py-1 rounded text-[11px] font-medium border transition-colors ${
                      filters.minAreaHa === item.val
                        ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Turbidity & Aquatic Vegetation Filters */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Turbidity State
                </label>
                <select
                  value={filters.selectedTurbidity}
                  onChange={(e) => onFilterChange({ ...filters, selectedTurbidity: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="All">All Turbidity</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Aquatic Vegetation
                </label>
                <select
                  value={filters.selectedVegetation}
                  onChange={(e) => onFilterChange({ ...filters, selectedVegetation: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Yes">Yes (Present)</option>
                  <option value="No">No (Clear)</option>
                </select>
              </div>
            </div>

            {/* Layer Visibility Toggles */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] font-medium text-slate-400">Map Layers</div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">District Boundaries</span>
                <button
                  onClick={() => setShowDistricts(!showDistricts)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    showDistricts
                      ? 'bg-sky-950 text-sky-300 border-sky-800'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  {showDistricts ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {showDistricts ? 'Visible' : 'Hidden'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Water Body Points</span>
                <button
                  onClick={() => setShowWaterbodies(!showWaterbodies)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    showWaterbodies
                      ? 'bg-sky-950 text-sky-300 border-sky-800'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  {showWaterbodies ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {showWaterbodies ? 'Visible' : 'Hidden'}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Filter Stats */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Active Results:</span>
            <span className="font-bold text-sky-400">
              {totalFilteredCount.toLocaleString()}{' '}
              <span className="font-normal text-slate-500">
                / {totalDatasetCount.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
