import React, { useState } from 'react';
import { StoryStep } from '../types';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  History, 
  ArrowRight
} from 'lucide-react';

interface StoryModeProps {
  onClose: () => void;
  onFlyTo: (coords: [number, number], zoom: number) => void;
  onSetDistrictFilter: (district: string) => void;
  onSetTypeFilter: (type: string) => void;
}

const STORY_STEPS: StoryStep[] = [
  {
    step: 1,
    title: "The Statewide Cascading Landscape",
    subtitle: "Over 64,400 water bodies mapped across 130,000 km²",
    description: "Tamil Nadu sits in the rain shadow of the Western Ghats, receiving the bulk of its precipitation during the brief, torrential Northeast Monsoon (Oct–Dec). To capture and store this flash runoff across flat river plains, medieval engineers developed one of the world's densest hydrological networks.",
    highlightStats: [
      { label: "Total Mapped Waterbodies", value: "64,493" },
      { label: "Total Surface Area", value: "696,538 ha" },
      { label: "Man-Made Share", value: "97.1%" }
    ],
    historicalContext: "Unlike perennial Himalayan rivers, Tamil Nadu's seasonal river basins (Palar, Cauvery, Vaigai, Thamirabarani) relied on community earthen bunds to hold monsoon waters for year-round agriculture.",
    targetCoords: [10.8505, 78.6569],
    targetZoom: 7,
    filterDistrict: 'All',
    filterType: 'All'
  },
  {
    step: 2,
    title: "The Southern Eri Epicenters: Pudukkottai & Sivaganga",
    subtitle: "A staggering 12,400+ water bodies in two districts alone",
    description: "Pudukkottai leads the entire state with 6,793 mapped water bodies, followed closely by Sivaganga with 5,659. In Sivaganga, 100% of the mapped water bodies are man-made cascading tanks (eris).",
    highlightStats: [
      { label: "Pudukkottai Count", value: "6,793 (6,693 eris)" },
      { label: "Sivaganga Count", value: "5,659 (100% man-made)" },
      { label: "Combined Area", value: "121,858 ha" }
    ],
    historicalContext: "Under the Pandya and Thondaiman rulers, eris were arranged in chain cascades. When the uppermost tank filled, excess water passed through stone masonry weirs (Kalingu) via earthen canals (Varathu Vaikkal) directly into the next tank, preventing devastating floods while recharging dry aquifers.",
    targetCoords: [10.05, 78.75],
    targetZoom: 9,
    filterDistrict: 'Pudukkottai',
    filterType: 'Tank/Pond'
  },
  {
    step: 3,
    title: "The Northern Pallava Strongholds: Kanchipuram & Thiruvallur",
    subtitle: "The historic 'Land of a Thousand Lakes'",
    description: "In the Palar and Kosasthalaiyar basins, Kanchipuram (3,970 water bodies) and Thiruvallur (3,218 water bodies) hold massive historical reservoirs and wetlands that supply the capital Chennai and prime agricultural belts.",
    highlightStats: [
      { label: "Kanchipuram Count", value: "3,970 water bodies" },
      { label: "Thiruvallur Count", value: "3,218 water bodies" },
      { label: "Major Feeder Lakes", value: "Chembarambakkam, Puzhal" }
    ],
    historicalContext: "Constructed during the Pallava dynasty (6th–9th centuries CE) and expanded under Raja Raja Chola, giant tanks such as Madurantakam and Chembarambakkam were engineered with sluices (Madagu) allowing gravity irrigation to downstream paddy fields.",
    targetCoords: [12.83, 79.70],
    targetZoom: 9,
    filterDistrict: 'Kanchipuram',
    filterType: 'All'
  },
  {
    step: 4,
    title: "River Basin Regulators & Modern Infrastructure",
    subtitle: "How modern reservoirs interface with ancient tank chains",
    description: "While 97% of Tamil Nadu's water infrastructure consists of traditional eris, 229 modern reservoirs and barrages (such as Stanley/Mettur, Bhavanisagar, and Vaigai) act as major storage regulators along the western hill slopes.",
    highlightStats: [
      { label: "Reservoirs & Barrages", value: "229 structures" },
      { label: "Stanley (Mettur)", value: "Cauvery regulator" },
      { label: "Interconnection", value: "Canals feed thousands of eris" }
    ],
    historicalContext: "Modern reservoirs do not replace the traditional network; rather, water released from reservoirs flows through canal systems to replenish downstream cascading tanks across the Delta districts (Thanjavur, Thiruvarur, Nagapattinam).",
    targetCoords: [11.80, 77.80],
    targetZoom: 9,
    filterDistrict: 'Salem',
    filterType: 'Reservoir/Barrage'
  }
];

export const StoryMode: React.FC<StoryModeProps> = ({
  onClose,
  onFlyTo,
  onSetDistrictFilter,
  onSetTypeFilter
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = STORY_STEPS[currentStepIndex];

  const goToStep = (idx: number) => {
    if (idx < 0 || idx >= STORY_STEPS.length) return;
    setCurrentStepIndex(idx);
    const step = STORY_STEPS[idx];
    onFlyTo(step.targetCoords, step.targetZoom);
    if (step.filterDistrict) onSetDistrictFilter(step.filterDistrict);
    if (step.filterType) onSetTypeFilter(step.filterType);
  };

  return (
    <div className="absolute top-20 right-4 z-30 w-88 md:w-104 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-white animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-sky-500/20 text-sky-400">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Discover the Network</h3>
            <span className="text-[10px] text-slate-400">
              Step {currentStep.step} of {STORY_STEPS.length}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Exit Story Mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-1.5 py-3 border-b border-slate-800/80">
        {STORY_STEPS.map((s, idx) => (
          <button
            key={s.step}
            onClick={() => goToStep(idx)}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentStepIndex
                ? 'bg-gradient-to-r from-sky-400 to-cyan-300 shadow-sm shadow-sky-400/50'
                : idx < currentStepIndex
                ? 'bg-sky-700'
                : 'bg-slate-800'
            }`}
            title={`Step ${s.step}: ${s.title}`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="py-3 space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
        <div>
          <h4 className="text-base font-bold text-white mb-0.5">
            {currentStep.title}
          </h4>
          <p className="text-xs text-sky-300/90 font-medium">
            {currentStep.subtitle}
          </p>
        </div>

        <p className="text-slate-300 leading-relaxed text-[12px]">
          {currentStep.description}
        </p>

        {/* Highlight Stats Pill */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
          {currentStep.highlightStats.map((st, i) => (
            <div key={i} className="text-center">
              <div className="text-[10px] text-slate-400">{st.label}</div>
              <div className="text-xs font-bold text-sky-300 mt-0.5">{st.value}</div>
            </div>
          ))}
        </div>

        {/* Historical Context Note */}
        <div className="bg-sky-950/30 border border-sky-900/50 rounded-xl p-3 text-slate-300">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px] mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Hydrological Engineering Heritage</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {currentStep.historicalContext}
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => goToStep(currentStepIndex - 1)}
          disabled={currentStepIndex === 0}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentStepIndex === 0
              ? 'text-slate-600 bg-slate-900 cursor-not-allowed border border-slate-800'
              : 'text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>

        {currentStepIndex < STORY_STEPS.length - 1 ? (
          <button
            onClick={() => goToStep(currentStepIndex + 1)}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-900/30 transition-all"
          >
            Next Step <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all"
          >
            Finish Tour <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
