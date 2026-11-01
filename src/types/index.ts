export type WaterbodyType = 
  | 'Tank/Pond'
  | 'Lake/Pond'
  | 'Reservoir/Barrage'
  | 'Aquaculture Pond'
  | 'Creek'
  | 'Waterlogged'
  | 'Lagoon'
  | 'Riverine Wetlands'
  | 'Ox-bow lake/cut-off meander'
  | 'Other';

export type TurbidityLevel = 'High' | 'Moderate' | 'Low' | 'NA';
export type VegetationPresence = 'Yes' | 'No' | 'NA';
export type LevelII = 'Man-made' | 'Natural' | 'Other';

export interface WaterbodyFeature {
  id: number;
  name: string;
  type: WaterbodyType;
  classification: LevelII;
  area_ha: number;
  district: string;
  turbidity: TurbidityLevel;
  vegetation: VegetationPresence;
  lat: number;
  long: number;
  source: string;
  historical_note?: string;
}

export interface DistrictProperties {
  id: number;
  name: string;
  waterbody_count: number;
  total_area_ha: number;
  tank_count: number;
  reservoir_count: number;
  lake_count: number;
  man_made_pct: number;
  turbidity_high_pct: number;
  veg_pct: number;
  largest_waterbody_name: string;
  largest_waterbody_ha: number;
}

export interface DistrictFeature {
  type: 'Feature';
  id: number;
  properties: DistrictProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
}

export interface DistrictCollection {
  type: 'FeatureCollection';
  name: string;
  features: DistrictFeature[];
}

export interface FilterState {
  searchQuery: string;
  selectedDistrict: string; // 'All' or district name
  selectedType: string; // 'All' or WaterbodyType
  selectedTurbidity: string; // 'All' or TurbidityLevel
  selectedVegetation: string; // 'All' or 'Yes' | 'No'
  minAreaHa: number;
  maxAreaHa: number;
}

export interface StoryStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  highlightStats: { label: string; value: string }[];
  historicalContext: string;
  targetCoords: [number, number];
  targetZoom: number;
  filterDistrict?: string;
  filterType?: string;
}

export interface AWSConfig {
  apiKey?: string;
  mapName?: string;
  region?: string;
  s3DataUrl?: string;
  isConfigured: boolean;
}

export type BasemapProvider = 'aws-location' | 'carto-dark' | 'carto-light' | 'osm' | 'satellite';

