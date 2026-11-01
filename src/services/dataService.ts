import { DistrictCollection, WaterbodyFeature, WaterbodyType, TurbidityLevel, LevelII } from '../types';
import { getAWSConfig } from './awsLocationService';

export interface DatasetPayload {
  districts: DistrictCollection;
  waterbodies: WaterbodyFeature[];
  summary: any;
  sourceType: 's3' | 'local' | 'custom_upload';
  totalLoaded: number;
}

export class DataService {
  private static cachedSummary: any = null;
  private static cachedDistricts: DistrictCollection | null = null;
  private static cachedWaterbodies: WaterbodyFeature[] | null = null;

  /**
   * Resolves URL for a given data asset: checks S3 endpoint first if configured, else uses local public /data.
   */
  private static resolveDataUrl(filename: string): { primary: string; fallback: string } {
    const aws = getAWSConfig();
    const fallback = `/data/${filename}`;

    if (aws.s3DataUrl && aws.s3DataUrl.trim().length > 0) {
      const baseUrl = aws.s3DataUrl.endsWith('/') ? aws.s3DataUrl.slice(0, -1) : aws.s3DataUrl;
      return {
        primary: `${baseUrl}/${filename}`,
        fallback
      };
    }

    return {
      primary: fallback,
      fallback
    };
  }

  /**
   * Robust fetcher with S3 primary and local fallback
   */
  private static async fetchWithFallback(filename: string): Promise<{ data: any; fromS3: boolean }> {
    const { primary, fallback } = this.resolveDataUrl(filename);

    if (primary !== fallback) {
      try {
        const res = await fetch(primary);
        if (res.ok) {
          const data = await res.json();
          return { data, fromS3: true };
        }
      } catch (err) {
        console.warn(`[TankTrace DataService] S3 fetch failed for ${filename}, falling back to local asset:`, err);
      }
    }

    const localRes = await fetch(fallback);
    if (!localRes.ok) {
      throw new Error(`Failed to load ${filename} from local fallback: status ${localRes.status}`);
    }
    const data = await localRes.json();
    return { data, fromS3: false };
  }

  /**
   * Loads state-level summary and district rankings
   */
  public static async loadSummary(): Promise<any> {
    if (this.cachedSummary) return this.cachedSummary;
    const { data } = await this.fetchWithFallback('tn_summary.json');
    this.cachedSummary = data;
    return data;
  }

  /**
   * Loads Tamil Nadu district boundary polygons with embedded stats
   */
  public static async loadDistricts(): Promise<DistrictCollection> {
    if (this.cachedDistricts) return this.cachedDistricts;
    const { data } = await this.fetchWithFallback('tn_districts.geojson');
    this.cachedDistricts = data as DistrictCollection;
    return data;
  }

  /**
   * Loads waterbodies.
   * By default loads all 64,493 points from tn_waterbodies_all.json (compact representation).
   * Falls back to tn_waterbodies_major.geojson if compact decoding is unavailable.
   */
  public static async loadWaterbodies(loadAll: boolean = true): Promise<{ features: WaterbodyFeature[]; fromS3: boolean }> {
    if (this.cachedWaterbodies && this.cachedWaterbodies.length > 0) {
      return { features: this.cachedWaterbodies, fromS3: false };
    }

    if (loadAll) {
      try {
        const { data, fromS3 } = await this.fetchWithFallback('tn_waterbodies_all.json');
        
        const typeDict = data.dictionaries.types as string[];
        const distDict = data.dictionaries.districts as string[];
        const turbDict = data.dictionaries.turbidity as string[];
        const vegDict = data.dictionaries.vegetation as string[];
        const rawRecords = data.records as any[][];

        const features: WaterbodyFeature[] = rawRecords.map((r) => {
          const fid = r[0] as number;
          const lat = r[1] as number;
          const lon = r[2] as number;
          const area_ha = r[3] as number;
          const type = (typeDict[r[4]] || 'Tank/Pond') as WaterbodyType;
          const district = distDict[r[5]] || 'Tamil Nadu';
          const turb = (turbDict[r[6]] || 'NA') as TurbidityLevel;
          const veg = (vegDict[r[7]] || 'No') as 'Yes' | 'No';
          const name = (r[8] as string) || (area_ha > 50 ? `${type} #${fid}` : '');

          return {
            id: fid,
            name,
            type,
            classification: (type === 'Tank/Pond' || type === 'Aquaculture Pond') ? 'Man-made' : 'Natural',
            area_ha,
            district,
            turbidity: turb,
            vegetation: veg,
            lat,
            long: lon,
            source: 'Space Applications Centre (SAC), ISRO / NWIC'
          };
        });

        this.cachedWaterbodies = features;
        return { features, fromS3 };
      } catch (e) {
        console.warn('[TankTrace DataService] Could not parse compact tn_waterbodies_all.json, attempting major GeoJSON:', e);
      }
    }

    // Load major waterbodies GeoJSON
    const { data: majorGeo, fromS3 } = await this.fetchWithFallback('tn_waterbodies_major.geojson');
    const features: WaterbodyFeature[] = majorGeo.features.map((f: any) => ({
      id: f.properties.id,
      name: f.properties.name,
      type: f.properties.type as WaterbodyType,
      classification: f.properties.classification as LevelII,
      area_ha: f.properties.area_ha,
      district: f.properties.district,
      turbidity: f.properties.turbidity as TurbidityLevel,
      vegetation: f.properties.vegetation || 'No',
      lat: f.geometry.coordinates[1],
      long: f.geometry.coordinates[0],
      source: f.properties.source || 'SAC / NWIC'
    }));

    this.cachedWaterbodies = features;
    return { features, fromS3 };
  }

  /**
   * Parse user-imported GeoJSON file
   */
  public static parseUserGeoJson(jsonContent: string): { features: WaterbodyFeature[]; warnings: string[] } {
    const warnings: string[] = [];
    let parsed: any;
    try {
      parsed = JSON.parse(jsonContent);
    } catch {
      throw new Error('Invalid JSON format. Please ensure the file is valid GeoJSON.');
    }

    let rawFeatures: any[] = [];
    if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      rawFeatures = parsed.features;
    } else if (parsed.type === 'Feature') {
      rawFeatures = [parsed];
    } else if (Array.isArray(parsed)) {
      rawFeatures = parsed;
    } else {
      throw new Error('Unsupported format. Expected GeoJSON FeatureCollection or Feature.');
    }

    const validFeatures: WaterbodyFeature[] = [];
    let idCounter = 900000;

    for (let i = 0; i < rawFeatures.length; i++) {
      const f = rawFeatures[i];
      let lat: number | null = null;
      let lon: number | null = null;

      if (f.geometry && f.geometry.type === 'Point' && Array.isArray(f.geometry.coordinates)) {
        lon = Number(f.geometry.coordinates[0]);
        lat = Number(f.geometry.coordinates[1]);
      } else if (f.properties && f.properties.lat !== undefined && f.properties.long !== undefined) {
        lat = Number(f.properties.lat);
        lon = Number(f.properties.long);
      } else if (f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')) {
        // Calculate approximate centroid of polygon
        const coords = f.geometry.coordinates;
        const ring = f.geometry.type === 'Polygon' ? coords[0] : coords[0][0];
        if (Array.isArray(ring) && ring.length > 0) {
          let sumLon = 0;
          let sumLat = 0;
          for (const pt of ring) {
            sumLon += Number(pt[0]);
            sumLat += Number(pt[1]);
          }
          lon = sumLon / ring.length;
          lat = sumLat / ring.length;
        }
      }

      if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
        continue;
      }

      // Check whether it is within Tamil Nadu approximate bounds
      if (lat < 7.5 || lat > 14.5 || lon < 75.5 || lon > 81.5) {
        warnings.push(`Feature #${i + 1} (${lat.toFixed(2)}, ${lon.toFixed(2)}) is outside Tamil Nadu bounding box.`);
      }

      const props = f.properties || {};
      const fid = Number(props.id || props.objectid_1 || ++idCounter);
      const name = String(props.name || props.wetname || `User Waterbody #${fid}`);
      const type = (props.type || props.level_iii || 'Tank/Pond') as WaterbodyType;
      const classification = (props.classification || props.level_ii || 'Man-made') as LevelII;
      const area_ha = Number(props.area_ha || props.area || 1.0);
      const district = String(props.district || 'Imported');
      const turbidity = (props.turbidity || 'NA') as TurbidityLevel;
      const vegetation = (props.vegetation || props.aqveg || 'No') as 'Yes' | 'No';

      validFeatures.push({
        id: fid,
        name,
        type,
        classification,
        area_ha,
        district,
        turbidity,
        vegetation,
        lat,
        long: lon,
        source: 'User Imported GeoJSON'
      });
    }

    if (validFeatures.length === 0) {
      throw new Error('No valid point or polygon coordinates could be extracted from this GeoJSON file.');
    }

    return { features: validFeatures, warnings };
  }
}
