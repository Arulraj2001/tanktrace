import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  WaterbodyFeature, 
  DistrictCollection, 
  FilterState, 
  BasemapProvider, 
  AWSConfig 
} from './types';
import { DataService } from './services/dataService';
import { getAWSConfig } from './services/awsLocationService';

// Components
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { FilterPanel } from './components/FilterPanel';
import { FeatureDetail } from './components/FeatureDetail';
import { StoryMode } from './components/StoryMode';
import { GeoJsonImporter } from './components/GeoJsonImporter';
import { Legend } from './components/Legend';
import { AboutModal } from './components/AboutModal';
import { EmptyState } from './components/EmptyState';

export const App: React.FC = () => {
  // AWS Configuration
  const [awsConfig] = useState<AWSConfig>(getAWSConfig());
  const [basemapProvider, setBasemapProvider] = useState<BasemapProvider>(
    awsConfig.isConfigured ? 'aws-location' : 'carto-dark'
  );

  // Geospatial Data State
  const [allWaterbodies, setAllWaterbodies] = useState<WaterbodyFeature[]>([]);
  const [districts, setDistricts] = useState<DistrictCollection | null>(null);


  // UI & Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showStory, setShowStory] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showDistricts, setShowDistricts] = useState<boolean>(true);
  const [showWaterbodies, setShowWaterbodies] = useState<boolean>(true);

  // Selected Feature & Camera Target
  const [selectedWaterbody, setSelectedWaterbody] = useState<WaterbodyFeature | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{ coords: [number, number]; zoom: number; key: number } | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedDistrict: 'All',
    selectedType: 'All',
    selectedTurbidity: 'All',
    selectedVegetation: 'All',
    minAreaHa: 0,
    maxAreaHa: 100000
  });

  // Load Primary Datasets on Mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      // Parallel loading of districts, summary, and waterbodies
      const [districtsData, , wbResult] = await Promise.all([
        DataService.loadDistricts(),
        DataService.loadSummary(),
        DataService.loadWaterbodies(true) // Loads full verified dataset
      ]);

      setDistricts(districtsData);
      setAllWaterbodies(wbResult.features);
    } catch (err: any) {
      console.error('Failed to load geospatial datasets:', err);
      setDataError(err.message || 'Error loading datasets. Please try again or import GeoJSON.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract unique district names and types for filter dropdowns
  const availableDistricts = useMemo(() => {
    if (districts && districts.features) {
      return districts.features
        .map((f) => f.properties.name)
        .sort((a, b) => a.localeCompare(b));
    }
    const distSet = new Set<string>();
    allWaterbodies.forEach((wb) => {
      if (wb.district) distSet.add(wb.district);
    });
    return Array.from(distSet).sort();
  }, [districts, allWaterbodies]);

  const availableTypes = useMemo(() => {
    const typeSet = new Set<string>();
    allWaterbodies.forEach((wb) => {
      if (wb.type) typeSet.add(wb.type);
    });
    return Array.from(typeSet).sort();
  }, [allWaterbodies]);

  // Compute Filtered Features
  const filteredWaterbodies = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();

    return allWaterbodies.filter((wb) => {
      // 1. Text Search (name or ID)
      if (query) {
        const matchesName = wb.name && wb.name.toLowerCase().includes(query);
        const matchesId = String(wb.id).includes(query);
        const matchesDist = wb.district && wb.district.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesDist) return false;
      }

      // 2. District Filter
      if (filters.selectedDistrict !== 'All' && wb.district !== filters.selectedDistrict) {
        return false;
      }

      // 3. Type Filter
      if (filters.selectedType !== 'All' && wb.type !== filters.selectedType) {
        return false;
      }

      // 4. Turbidity Filter
      if (filters.selectedTurbidity !== 'All' && wb.turbidity !== filters.selectedTurbidity) {
        return false;
      }

      // 5. Aquatic Vegetation Filter
      if (filters.selectedVegetation !== 'All' && wb.vegetation !== filters.selectedVegetation) {
        return false;
      }

      // 6. Minimum Area Filter
      if (filters.minAreaHa > 0 && wb.area_ha < filters.minAreaHa) {
        return false;
      }

      return true;
    });
  }, [allWaterbodies, filters]);

  // Camera fly-to triggers
  const triggerFlyTo = useCallback((coords: [number, number], zoom: number) => {
    setFlyToTarget({ coords, zoom, key: Date.now() });
  }, []);

  const handleFocusFeature = (wb: WaterbodyFeature) => {
    triggerFlyTo([wb.lat, wb.long], 14);
  };

  const handleSelectDistrictFromMap = (distName: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedDistrict: distName
    }));
  };

  // User GeoJSON Import handler
  const handleImportSuccess = (newFeatures: WaterbodyFeature[]) => {
    setAllWaterbodies((prev) => [...newFeatures, ...prev]);
    setShowImport(false);
    if (newFeatures.length > 0) {
      setSelectedWaterbody(newFeatures[0]);
      triggerFlyTo([newFeatures[0].lat, newFeatures[0].long], 11);
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        awsConfig={awsConfig}
        currentBasemap={basemapProvider}
        onSelectBasemap={setBasemapProvider}
        onOpenStory={() => setShowStory(true)}
        onOpenImport={() => setShowImport(true)}
        onOpenAbout={() => setShowAbout(true)}
        totalVisibleCount={filteredWaterbodies.length}
        totalDatasetCount={allWaterbodies.length}
      />

      {/* Main Map Workspace */}
      <main className="relative flex-1 w-full h-[calc(100vh-64px)] overflow-hidden">
        {/* Leaflet / AWS Map View */}
        <MapView
          waterbodies={filteredWaterbodies}
          districts={districts}
          selectedWaterbody={selectedWaterbody}
          onSelectWaterbody={setSelectedWaterbody}
          onSelectDistrict={handleSelectDistrictFromMap}
          selectedDistrict={filters.selectedDistrict}
          basemapProvider={basemapProvider}
          awsConfig={awsConfig}
          flyToTarget={flyToTarget}
          showDistricts={showDistricts}
          showWaterbodies={showWaterbodies}
        />

        {/* Floating Sidebar Filters */}
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          districts={availableDistricts}
          types={availableTypes}
          totalFilteredCount={filteredWaterbodies.length}
          totalDatasetCount={allWaterbodies.length}
          showDistricts={showDistricts}
          setShowDistricts={setShowDistricts}
          showWaterbodies={showWaterbodies}
          setShowWaterbodies={setShowWaterbodies}
        />

        {/* Legend */}
        <Legend />

        {/* Feature Detail Drawer / Card */}
        <FeatureDetail
          waterbody={selectedWaterbody}
          onClose={() => setSelectedWaterbody(null)}
          onFocus={handleFocusFeature}
        />

        {/* Story Mode Tour */}
        {showStory && (
          <StoryMode
            onClose={() => setShowStory(false)}
            onFlyTo={triggerFlyTo}
            onSetDistrictFilter={(d) => setFilters((prev) => ({ ...prev, selectedDistrict: d }))}
            onSetTypeFilter={(t) => setFilters((prev) => ({ ...prev, selectedType: t }))}
          />
        )}

        {/* Empty / Error / Loading States */}
        {isLoading && <EmptyState type="loading" />}
        {dataError && !isLoading && (
          <EmptyState
            type="error"
            message={dataError}
            onRetry={loadData}
            onOpenImport={() => setShowImport(true)}
          />
        )}
        {!isLoading && !dataError && filteredWaterbodies.length === 0 && (
          <EmptyState
            type="no-results"
            onResetFilters={() =>
              setFilters({
                searchQuery: '',
                selectedDistrict: 'All',
                selectedType: 'All',
                selectedTurbidity: 'All',
                selectedVegetation: 'All',
                minAreaHa: 0,
                maxAreaHa: 100000
              })
            }
          />
        )}
      </main>

      {/* Import Modal */}
      {showImport && (
        <GeoJsonImporter
          onClose={() => setShowImport(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {/* About & Sources Modal */}
      {showAbout && (
        <AboutModal
          onClose={() => setShowAbout(false)}
          awsConfig={awsConfig}
        />
      )}
    </div>
  );
};

export default App;
