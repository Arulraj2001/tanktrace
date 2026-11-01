import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  WaterbodyFeature, 
  DistrictCollection, 
  BasemapProvider, 
  AWSConfig 
} from '../types';
import { getTileLayerConfig } from '../services/awsLocationService';

interface MapViewProps {
  waterbodies: WaterbodyFeature[];
  districts: DistrictCollection | null;
  selectedWaterbody: WaterbodyFeature | null;
  onSelectWaterbody: (wb: WaterbodyFeature | null) => void;
  onSelectDistrict: (districtName: string) => void;
  selectedDistrict: string;
  basemapProvider: BasemapProvider;
  awsConfig: AWSConfig;
  flyToTarget: { coords: [number, number]; zoom: number; key: number } | null;
  showDistricts: boolean;
  showWaterbodies: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  waterbodies,
  districts,
  selectedWaterbody,
  onSelectWaterbody,
  onSelectDistrict,
  selectedDistrict,
  basemapProvider,
  awsConfig,
  flyToTarget,
  showDistricts,
  showWaterbodies
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const districtLayerRef = useRef<L.GeoJSON | null>(null);
  const waterbodiesLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);

  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(7);

  // Helper to color water bodies by type
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'Tank/Pond':
        return '#38bdf8'; // Sky blue
      case 'Reservoir/Barrage':
        return '#c084fc'; // Purple
      case 'Lake/Pond':
        return '#2dd4bf'; // Teal
      case 'Aquaculture Pond':
        return '#34d399'; // Emerald
      case 'Creek':
      case 'Lagoon':
      case 'Waterlogged':
      case 'Riverine Wetlands':
        return '#fbbf24'; // Amber
      default:
        return '#94a3b8'; // Slate
    }
  };

  // Helper to color districts by waterbody count density
  const getDistrictFillColor = (count: number): string => {
    if (count > 5000) return '#0369a1';
    if (count > 3000) return '#0284c7';
    if (count > 2000) return '#0ea5e9';
    if (count > 1000) return '#38bdf8';
    return '#7dd3fc';
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on Tamil Nadu: lat 10.85, lon 78.65, zoom 7
    const map = L.map(mapContainerRef.current, {
      center: [10.8505, 78.6569],
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false
    });

    // Custom positioned zoom control and scale bar
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Canvas renderer for high-performance vector points
    canvasRendererRef.current = L.canvas({ padding: 0.5 });
    mapInstanceRef.current = map;

    // Track viewport for efficient LOD / viewport filtering
    const updateViewport = () => {
      setMapBounds(map.getBounds());
      setZoomLevel(map.getZoom());
    };

    map.on('moveend zoomend', updateViewport);
    updateViewport();

    return () => {
      map.off('moveend zoomend', updateViewport);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = getTileLayerConfig(basemapProvider, awsConfig);
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      subdomains: cfg.subdomains || 'abc'
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;
  }, [basemapProvider, awsConfig]);

  // Update District Polygon Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (districtLayerRef.current) {
      map.removeLayer(districtLayerRef.current);
      districtLayerRef.current = null;
    }

    if (!districts || !showDistricts) return;

    const layer = L.geoJSON(districts as any, {
      style: (feature) => {
        const dName = feature?.properties?.name;
        const count = feature?.properties?.waterbody_count || 0;
        const isSelected = selectedDistrict !== 'All' && selectedDistrict === dName;

        return {
          fillColor: getDistrictFillColor(count),
          fillOpacity: isSelected ? 0.45 : 0.15,
          color: isSelected ? '#38bdf8' : '#64748b',
          weight: isSelected ? 2.5 : 1.2,
          dashArray: isSelected ? undefined : '3, 3'
        };
      },
      onEachFeature: (feature, l) => {
        const props = feature.properties;
        const dName = props.name;
        const count = props.waterbody_count;
        const area = props.total_area_ha;
        const tanks = props.tank_count;
        const reservoirs = props.reservoir_count;

        l.bindTooltip(`
          <div class="px-2 py-1 text-xs font-sans">
            <strong class="text-sky-300 font-semibold">${dName} District</strong><br/>
            <span class="text-slate-300">Water Bodies:</span> <b>${count?.toLocaleString()}</b><br/>
            <span class="text-slate-300">Total Water Area:</span> <b>${area?.toLocaleString()} ha</b><br/>
            <span class="text-slate-400 text-[10px]">Tanks (Eris): ${tanks} | Reservoirs: ${reservoirs}</span>
          </div>
        `, { sticky: true, className: 'leaflet-custom-tooltip' });

        l.on('click', () => {
          onSelectDistrict(dName);
          if ('getBounds' in l) {
            const bounds = (l as any).getBounds();
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
          }
        });

        l.on('mouseover', (e) => {
          const target = e.target;
          target.setStyle({
            fillOpacity: 0.35,
            weight: 2,
            color: '#38bdf8'
          });
        });

        l.on('mouseout', (e) => {
          const isSelected = selectedDistrict !== 'All' && selectedDistrict === dName;
          layer.resetStyle(e.target);
          if (isSelected) {
            e.target.setStyle({
              fillOpacity: 0.45,
              weight: 2.5,
              color: '#38bdf8'
            });
          }
        });
      }
    });

    layer.addTo(map);
    districtLayerRef.current = layer;
  }, [districts, showDistricts, selectedDistrict, onSelectDistrict]);

  // Efficient Viewport-Filtered Waterbodies Set
  const visibleWaterbodies = useMemo(() => {
    if (!showWaterbodies || waterbodies.length === 0) return [];
    if (!mapBounds) return waterbodies.slice(0, 10000);

    const padLat = 0.2;
    const padLon = 0.2;
    const south = mapBounds.getSouth() - padLat;
    const north = mapBounds.getNorth() + padLat;
    const west = mapBounds.getWest() - padLon;
    const east = mapBounds.getEast() + padLon;

    // Filter strictly to viewport bounds
    const inViewport = waterbodies.filter((wb) => 
      wb.lat >= south && wb.lat <= north && wb.long >= west && wb.long <= east
    );

    // If statewide overview (zoom <= 8) with huge count, prioritize prominent structures
    if (zoomLevel <= 8 && inViewport.length > 12000 && selectedDistrict === 'All') {
      return inViewport.filter((wb) => wb.area_ha >= 3.0 || wb.type === 'Reservoir/Barrage' || Boolean(wb.name));
    }

    return inViewport;
  }, [waterbodies, showWaterbodies, mapBounds, zoomLevel, selectedDistrict]);

  // Update Waterbodies Points Layer (HTML5 Canvas rendering for speed)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (waterbodiesLayerRef.current) {
      map.removeLayer(waterbodiesLayerRef.current);
      waterbodiesLayerRef.current = null;
    }

    if (!showWaterbodies || visibleWaterbodies.length === 0) return;

    const layerGroup = L.layerGroup();
    const renderer = canvasRendererRef.current || L.canvas({ padding: 0.5 });

    visibleWaterbodies.forEach((wb) => {
      const isSelected = selectedWaterbody?.id === wb.id;
      const radius = Math.max(3.5, Math.min(15, Math.sqrt(wb.area_ha || 1) * 1.2));
      const color = getTypeColor(wb.type);

      const marker = L.circleMarker([wb.lat, wb.long], {
        renderer,
        radius: isSelected ? radius + 4 : radius,
        fillColor: isSelected ? '#ffffff' : color,
        fillOpacity: isSelected ? 0.95 : 0.75,
        color: isSelected ? '#38bdf8' : '#041c2c',
        weight: isSelected ? 2.5 : 1
      });

      const displayTitle = wb.name ? wb.name : `${wb.type} #${wb.id}`;

      marker.bindTooltip(`
        <div class="px-2 py-1 text-xs font-sans">
          <div class="font-bold text-sky-300">${displayTitle}</div>
          <div class="text-slate-300">Type: <span class="text-white">${wb.type}</span></div>
          <div class="text-slate-300">District: <span class="text-white">${wb.district}</span></div>
          <div class="text-slate-300">Area: <span class="text-sky-300 font-medium">${wb.area_ha.toFixed(1)} ha</span> (${(wb.area_ha * 2.471).toFixed(1)} acres)</div>
        </div>
      `, { sticky: true, className: 'leaflet-custom-tooltip' });

      marker.on('click', () => {
        onSelectWaterbody(wb);
      });

      layerGroup.addLayer(marker);
    });

    layerGroup.addTo(map);
    waterbodiesLayerRef.current = layerGroup;
  }, [visibleWaterbodies, showWaterbodies, selectedWaterbody, onSelectWaterbody]);

  // Handle FlyTo animations (triggered by Story Mode or feature selection)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !flyToTarget) return;

    map.flyTo(flyToTarget.coords, flyToTarget.zoom, {
      duration: 1.8,
      easeLinearity: 0.25
    });
  }, [flyToTarget]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};
