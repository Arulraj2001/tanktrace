import { AWSConfig, BasemapProvider } from '../types';

export const getAWSConfig = (): AWSConfig => {
  const apiKey = import.meta.env.VITE_AWS_LOCATION_API_KEY || '';
  const mapName = import.meta.env.VITE_AWS_LOCATION_MAP_NAME || 'explore.map';
  const region = import.meta.env.VITE_AWS_LOCATION_REGION || 'us-east-1';
  const s3DataUrl = import.meta.env.VITE_S3_DATA_URL || '';

  const isConfigured = Boolean(apiKey && apiKey.trim().length > 0);

  return {
    apiKey,
    mapName,
    region,
    s3DataUrl,
    isConfigured
  };
};

export interface TileLayerConfig {
  id: BasemapProvider;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
  isAWS: boolean;
}

export const getTileLayerConfig = (provider: BasemapProvider, awsConfig: AWSConfig): TileLayerConfig => {
  switch (provider) {
    case 'aws-location':
      if (awsConfig.isConfigured) {
        return {
          id: 'aws-location',
          name: `Amazon Location Service (${awsConfig.mapName})`,
          url: `https://maps.geo.${awsConfig.region}.amazonaws.com/maps/v0/maps/${awsConfig.mapName}/tiles/{z}/{x}/{y}?key=${awsConfig.apiKey}`,
          attribution: '&copy; <a href="https://aws.amazon.com/location/" target="_blank" rel="noopener">Amazon Location Service</a> &copy; Esri / HERE / OSM contributors',
          maxZoom: 19,
          isAWS: true
        };
      }
      // If AWS is selected but key is missing, return a graceful fallback marked with fallback note
      return {
        id: 'carto-dark',
        name: 'Amazon Location Fallback (Carto Dark)',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
        isAWS: false
      };

    case 'carto-dark':
      return {
        id: 'carto-dark',
        name: 'Carto Dark Matter',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
        isAWS: false
      };

    case 'carto-light':
      return {
        id: 'carto-light',
        name: 'Carto Positron',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
        isAWS: false
      };

    case 'satellite':
      return {
        id: 'satellite',
        name: 'Satellite (Esri World Imagery)',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
        maxZoom: 18,
        isAWS: false
      };

    case 'osm':
    default:
      return {
        id: 'osm',
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        isAWS: false
      };
  }
};

