/**
 * Texas geographic lookup library for city-to-county and region filtering.
 * Data sourced from Simplemaps.com (CC-BY 4.0)
 */

export interface CityInfo {
  county: string;
  county_fips: string;
  region: string | null;
}

export interface TexasGeoData {
  cities: Record<string, CityInfo>;
  counties: string[];
  regions: Record<string, string[]>;
  attribution: string;
  lastUpdated: string;
}

let geoData: TexasGeoData | null = null;
let loadPromise: Promise<TexasGeoData> | null = null;

/**
 * Load the Texas geographic data from the public JSON file.
 * Returns cached data if already loaded.
 */
export async function loadTexasGeo(): Promise<TexasGeoData> {
  if (geoData) return geoData;

  if (loadPromise) return loadPromise;

  loadPromise = fetch('/texas_geo.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load texas_geo.json');
      return res.json();
    })
    .then((data: TexasGeoData) => {
      geoData = data;
      return data;
    });

  return loadPromise;
}

/**
 * Normalize a city name for lookup matching.
 * Must match the Python version exactly.
 */
export function normalizeCity(city: string): string {
  if (!city) return '';
  return city
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ')                      // collapse whitespace
    .replace(/^FT\.?\s+/i, 'FORT ')             // FT WORTH -> FORT WORTH
    .replace(/^ST\.?\s+/i, 'SAINT ')            // ST HEDWIG -> SAINT HEDWIG
    .replace(/,?\s*(TX|TEXAS)$/i, '')           // strip trailing state
    .replace(/\s+TX\s+USA$/i, '')               // DALLAS TX USA -> DALLAS
    .trim();
}

/**
 * Look up city info by name.
 */
export function getCityInfo(city: string): CityInfo | null {
  if (!geoData) return null;
  const normalized = normalizeCity(city);
  return geoData.cities[normalized] || null;
}

/**
 * Get all normalized city names in a given county.
 */
export function getCitiesInCounty(county: string): string[] {
  if (!geoData) return [];
  const countyLower = county.toLowerCase();
  return Object.entries(geoData.cities)
    .filter(([_, info]) => info.county.toLowerCase() === countyLower)
    .map(([city]) => city);
}

/**
 * Get all normalized city names in a given metro region.
 */
export function getCitiesInRegion(region: string): string[] {
  if (!geoData) return [];
  const counties = geoData.regions[region];
  if (!counties) return [];

  return Object.entries(geoData.cities)
    .filter(([_, info]) => info.region === region)
    .map(([city]) => city);
}

/**
 * Get list of all Texas counties.
 */
export function getAllCounties(): string[] {
  return geoData?.counties || [];
}

/**
 * Get list of all metro region names.
 */
export function getAllRegions(): string[] {
  return geoData ? Object.keys(geoData.regions) : [];
}

/**
 * Get the counties that belong to a metro region.
 */
export function getCountiesInRegion(region: string): string[] {
  return geoData?.regions[region] || [];
}

/**
 * Get the attribution text for the data source.
 */
export function getAttribution(): string {
  return geoData?.attribution || 'City data from Simplemaps.com (CC-BY 4.0)';
}
