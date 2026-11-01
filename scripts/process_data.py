import json
import math
import os
import sys
import time

def main():
    print("=== TankTrace Geospatial Processing Pipeline ===")
    t_start = time.time()

    districts_file = 'tn_districts_raw.geojson'
    waterbodies_file = 'wb_tn_geojson/wb_sac_tn.GeoJSON'
    out_dir = 'public/data'
    os.makedirs(out_dir, exist_ok=True)

    if not os.path.exists(districts_file):
        print(f"Error: {districts_file} not found.")
        sys.exit(1)

    if not os.path.exists(waterbodies_file):
        print(f"Error: {waterbodies_file} not found.")
        sys.exit(1)

    print("1. Loading Tamil Nadu district boundaries...")
    with open(districts_file, 'r', encoding='utf-8') as f:
        raw_districts = json.load(f)

    # Filter for Tamil Nadu
    tn_district_feats = [
        f for f in raw_districts['features']
        if f.get('properties', {}).get('NAME_1') == 'Tamil Nadu' or f.get('properties', {}).get('st_nm') == 'Tamil Nadu'
    ]
    print(f"Found {len(tn_district_feats)} districts.")

    # Ray casting helper
    def point_in_poly(x, y, poly):
        inside = False
        n = len(poly)
        p1x, p1y = poly[0]
        for i in range(1, n + 1):
            p2x, p2y = poly[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        return inside

    def point_in_geom(x, y, geom):
        gtype = geom['type']
        coords = geom['coordinates']
        if gtype == 'Polygon':
            if point_in_poly(x, y, coords[0]):
                for hole in coords[1:]:
                    if point_in_poly(x, y, hole):
                        return False
                return True
            return False
        elif gtype == 'MultiPolygon':
            for poly in coords:
                if point_in_poly(x, y, poly[0]):
                    in_hole = False
                    for hole in poly[1:]:
                        if point_in_poly(x, y, hole):
                            in_hole = True
                            break
                    if not in_hole:
                        return True
            return False
        return False

    def round_coords(c, decimals=4):
        if isinstance(c[0], (int, float)):
            return [round(c[0], decimals), round(c[1], decimals)]
        return [round_coords(sub, decimals) for sub in c]

    # Process districts
    districts = []
    district_names = []
    district_centers = {}

    for feat in tn_district_feats:
        name = feat['properties'].get('NAME_2') or feat['properties'].get('district') or 'Unknown'
        # Standardize name spelling
        name_clean = name.strip()
        if name_clean == 'Tirunelveli Kattabo':
            name_clean = 'Tirunelveli'
        if name_clean == 'Kancheepuram':
            name_clean = 'Kanchipuram'
        
        geom = feat['geometry']
        # Compute bounds & centroid
        all_lons = []
        all_lats = []
        def collect_pts(c, gtype):
            if gtype == 'Polygon':
                for ring in c:
                    for pt in ring:
                        all_lons.append(pt[0])
                        all_lats.append(pt[1])
            elif gtype == 'MultiPolygon':
                for poly in c:
                    for ring in poly:
                        for pt in ring:
                            all_lons.append(pt[0])
                            all_lats.append(pt[1])
        collect_pts(geom['coordinates'], geom['type'])
        
        min_x, max_x = min(all_lons), max(all_lons)
        min_y, max_y = min(all_lats), max(all_lats)
        cx = sum(all_lons) / len(all_lons)
        cy = sum(all_lats) / len(all_lats)

        district_centers[name_clean] = (cx, cy)
        district_names.append(name_clean)
        districts.append({
            'name': name_clean,
            'original_name': name,
            'id': feat['properties'].get('ID_2') or len(districts) + 1,
            'bbox': (min_x, min_y, max_x, max_y),
            'center': (cx, cy),
            'geom': {
                'type': geom['type'],
                'coordinates': round_coords(geom['coordinates'], 4)
            },
            'stats': {
                'count': 0,
                'total_area_ha': 0.0,
                'tank_count': 0,
                'reservoir_count': 0,
                'lake_count': 0,
                'other_count': 0,
                'man_made_count': 0,
                'natural_count': 0,
                'turbidity_high': 0,
                'turbidity_mod': 0,
                'turbidity_low': 0,
                'veg_yes': 0,
                'veg_no': 0,
                'largest_waterbody': {'id': None, 'name': '', 'area_ha': 0.0, 'lat': 0.0, 'lon': 0.0}
            }
        })

    district_names = sorted(list(set(district_names)))
    print(f"Standardized {len(districts)} districts.")

    # Known famous water bodies in Tamil Nadu with historical names to enrich records if coordinates match
    # Real coordinates of major historical eris and reservoirs
    known_landmarks = [
        {"name": "Veeranam Lake", "lat": 11.2828, "lon": 79.5442, "type": "Lake/Reservoir", "district": "Cuddalore", "hist": "Built in the 10th century by Rajaditya Chola; length 14 km."},
        {"name": "Chembarambakkam Lake", "lat": 13.0117, "lon": 80.0578, "type": "Reservoir", "district": "Kanchipuram", "hist": "Ancient Pallava-era feeder lake serving the Adyar River and Chennai basin."},
        {"name": "Madurantakam Tank", "lat": 12.5119, "lon": 79.8828, "type": "Tank/Pond", "district": "Kanchipuram", "hist": "Constructed by Uttama Chola (Madurantaka), protected by historic bunds."},
        {"name": "Kaveripakkam Tank", "lat": 12.9067, "lon": 79.4678, "type": "Tank/Pond", "district": "Vellore", "hist": "One of the largest tanks built by the Pallavas in the Palar river basin."},
        {"name": "Red Hills Lake (Puzhal)", "lat": 13.1950, "lon": 80.1764, "type": "Reservoir", "district": "Thiruvallur", "hist": "Key historical reservoir commissioned in 1876 connected to Jones Tower."},
        {"name": "Poondi Reservoir", "lat": 13.1878, "lon": 79.8600, "type": "Reservoir", "district": "Thiruvallur", "hist": "Constructed across the Kosasthalaiyar river to regulate monsoon runoff."},
        {"name": "Singanallur Lake", "lat": 10.9933, "lon": 77.0278, "type": "Lake/Pond", "district": "Coimbatore", "hist": "One of the 24 ancient lakes built during the medieval Kongu Chola era across Noyyal river."},
        {"name": "Ukkadam Periyakulam", "lat": 10.9906, "lon": 76.9589, "type": "Lake/Pond", "district": "Coimbatore", "hist": "Ancient cascading feeder lake in Noyyal river basin."},
        {"name": "Stanley Reservoir (Mettur)", "lat": 11.8014, "lon": 77.8017, "type": "Reservoir/Barrage", "district": "Salem", "hist": "Formed by Mettur Dam, the lifeblood of the Cauvery delta irrigation network."},
        {"name": "Bhavanisagar Reservoir", "lat": 11.4706, "lon": 77.1139, "type": "Reservoir/Barrage", "district": "Erode", "hist": "Built across Bhavani river, regulating canal supply across Western Tamil Nadu."},
        {"name": "Vaigai Reservoir", "lat": 10.0544, "lon": 77.5911, "type": "Reservoir/Barrage", "district": "Theni", "hist": "Primary irrigation storage for Madurai and Ramanathapuram cascading tanks."},
        {"name": "Manimuthar Reservoir", "lat": 8.5833, "lon": 77.4167, "type": "Reservoir/Barrage", "district": "Tirunelveli", "hist": "Vital irrigation reservoir in the Thamirabarani river basin."},
        {"name": "Pechiparai Reservoir", "lat": 8.4417, "lon": 77.2917, "type": "Reservoir/Barrage", "district": "Kanniyakumari", "hist": "Built during the reign of Maharaja Moolam Thirunal across the Kodayar river."}
    ]

    print("2. Reading SAC Waterbodies GeoJSON (64,493 features)...")
    t_load = time.time()
    with open(waterbodies_file, 'r', encoding='utf-8') as f:
        wb_data = json.load(f)
    print(f"Loaded GeoJSON in {time.time() - t_load:.2f}s.")

    raw_features = wb_data.get('features', [])
    total_count = len(raw_features)
    print(f"Total features to process: {total_count}")

    # Build dictionaries for compact encoding
    type_list = [
        'Tank/Pond',
        'Lake/Pond',
        'Reservoir/Barrage',
        'Aquaculture Pond',
        'Creek',
        'Waterlogged',
        'Lagoon',
        'Riverine Wetlands',
        'Ox-bow lake/cut-off meander',
        'Other'
    ]
    type_to_idx = {t: i for i, t in enumerate(type_list)}

    turbidity_list = ['High', 'Moderate', 'Low', 'NA']
    turb_to_idx = {t: i for i, t in enumerate(turbidity_list)}

    district_to_idx = {d: i for i, d in enumerate(district_names)}

    all_points_compact = []
    major_features = []

    state_stats = {
        'total_waterbodies': total_count,
        'total_area_ha': 0.0,
        'types': {},
        'levels_ii': {'Man-made': 0, 'Natural': 0, 'Other': 0},
        'turbidity': {'High': 0, 'Moderate': 0, 'Low': 0, 'NA': 0},
        'vegetation': {'Yes': 0, 'No': 0, 'NA': 0},
        'district_distribution': {}
    }

    print("3. Matching waterbodies to districts and computing statistics...")
    t_match = time.time()

    for idx, feat in enumerate(raw_features):
        props = feat.get('properties', {})
        fid = props.get('id') or props.get('objectid_1') or (idx + 1)
        lat = props.get('lat')
        lon = props.get('long')

        if lat is None or lon is None:
            continue

        area_ha = float(props.get('area_ha') or 0.0)
        l_iii = props.get('level_iii') or 'Other'
        if l_iii not in type_to_idx:
            l_iii = 'Other'
        type_idx = type_to_idx[l_iii]

        l_ii = props.get('level_ii') or 'Other'
        turb = props.get('turbidity') or 'NA'
        if turb not in turb_to_idx:
            turb = 'NA'
        turb_idx = turb_to_idx[turb]

        veg = props.get('aqveg') or 'No'
        veg_idx = 1 if veg == 'Yes' else 0

        name = (props.get('wetname') or '').strip()

        # Spatial lookup with bbox pre-filter
        matched_dist = None
        for d in districts:
            bbox = d['bbox']
            if bbox[0] <= lon <= bbox[2] and bbox[1] <= lat <= bbox[3]:
                if point_in_geom(lon, lat, d['geom']):
                    matched_dist = d
                    break

        # Fallback: nearest district centroid if on coastal boundary or edge
        if not matched_dist:
            min_dist_sq = 1e9
            for d in districts:
                cx, cy = d['center']
                dist_sq = (lon - cx)**2 + (lat - cy)**2
                if dist_sq < min_dist_sq:
                    min_dist_sq = dist_sq
                    matched_dist = d

        dist_name = matched_dist['name']
        dist_idx = district_to_idx.get(dist_name, 0)

        # Check if near known landmarks to enrich name
        if not name:
            for km in known_landmarks:
                if km['district'] == dist_name or abs(km['lat'] - lat) < 0.05:
                    dlat = (km['lat'] - lat) * 111.0
                    dlon = (km['lon'] - lon) * 111.0 * math.cos(math.radians(lat))
                    dist_km = math.sqrt(dlat*dlat + dlon*dlon)
                    if dist_km < 1.5 and area_ha > 50.0:
                        name = km['name']
                        break

        # Update district stats
        d_stats = matched_dist['stats']
        d_stats['count'] += 1
        d_stats['total_area_ha'] += area_ha
        if l_iii == 'Tank/Pond':
            d_stats['tank_count'] += 1
        elif l_iii == 'Reservoir/Barrage':
            d_stats['reservoir_count'] += 1
        elif l_iii == 'Lake/Pond':
            d_stats['lake_count'] += 1
        else:
            d_stats['other_count'] += 1

        if l_ii == 'Man-made':
            d_stats['man_made_count'] += 1
        elif l_ii == 'Natural':
            d_stats['natural_count'] += 1

        if turb == 'High':
            d_stats['turbidity_high'] += 1
        elif turb == 'Moderate':
            d_stats['turbidity_mod'] += 1
        elif turb == 'Low':
            d_stats['turbidity_low'] += 1

        if veg == 'Yes':
            d_stats['veg_yes'] += 1
        else:
            d_stats['veg_no'] += 1

        if area_ha > d_stats['largest_waterbody']['area_ha']:
            d_stats['largest_waterbody'] = {
                'id': fid,
                'name': name or f"{l_iii} #{fid}",
                'area_ha': round(area_ha, 2),
                'lat': round(lat, 5),
                'lon': round(lon, 5),
                'type': l_iii
            }

        # Update state stats
        state_stats['total_area_ha'] += area_ha
        state_stats['types'][l_iii] = state_stats['types'].get(l_iii, 0) + 1
        if l_ii in state_stats['levels_ii']:
            state_stats['levels_ii'][l_ii] += 1
        else:
            state_stats['levels_ii']['Other'] += 1

        if turb in state_stats['turbidity']:
            state_stats['turbidity'][turb] += 1
        if veg == 'Yes':
            state_stats['vegetation']['Yes'] += 1
        elif veg == 'No':
            state_stats['vegetation']['No'] += 1
        else:
            state_stats['vegetation']['NA'] += 1

        # Compact record: [id, round(lat, 5), round(lon, 5), round(area_ha, 2), type_idx, dist_idx, turb_idx, veg_idx, name]
        all_points_compact.append([
            fid,
            round(lat, 5),
            round(lon, 5),
            round(area_ha, 2),
            type_idx,
            dist_idx,
            turb_idx,
            veg_idx,
            name
        ])

        # Major waterbodies collection (> 25 hectares OR reservoirs OR named)
        if area_ha >= 25.0 or l_iii in ('Reservoir/Barrage', 'Lake/Pond', 'Lagoon') or bool(name):
            major_features.append({
                "type": "Feature",
                "id": fid,
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(lon, 5), round(lat, 5)]
                },
                "properties": {
                    "id": fid,
                    "name": name if name else f"{l_iii} #{fid}",
                    "type": l_iii,
                    "classification": l_ii,
                    "area_ha": round(area_ha, 2),
                    "district": dist_name,
                    "turbidity": turb,
                    "vegetation": veg,
                    "lat": round(lat, 5),
                    "long": round(lon, 5),
                    "source": "SAC / NWIC Hydrological Layer"
                }
            })

    print(f"Matched all {len(all_points_compact)} points in {time.time() - t_match:.2f}s.")
    print(f"Selected {len(major_features)} major waterbodies for instant vector layer.")

    # 4. Create tn_districts.geojson with attached stats
    print("4. Writing public/data/tn_districts.geojson...")
    district_features = []
    for d in districts:
        st = d['stats']
        total_d = st['count'] if st['count'] > 0 else 1
        man_made_pct = round((st['man_made_count'] / total_d) * 100, 1)
        turb_high_pct = round((st['turbidity_high'] / total_d) * 100, 1)
        veg_pct = round((st['veg_yes'] / total_d) * 100, 1)

        state_stats['district_distribution'][d['name']] = {
            'count': st['count'],
            'total_area_ha': round(st['total_area_ha'], 1),
            'tank_count': st['tank_count'],
            'reservoir_count': st['reservoir_count'],
            'lake_count': st['lake_count'],
            'man_made_pct': man_made_pct,
            'turbidity_high_pct': turb_high_pct,
            'veg_pct': veg_pct,
            'largest_waterbody': st['largest_waterbody']
        }

        district_features.append({
            "type": "Feature",
            "id": d['id'],
            "properties": {
                "id": d['id'],
                "name": d['name'],
                "waterbody_count": st['count'],
                "total_area_ha": round(st['total_area_ha'], 1),
                "tank_count": st['tank_count'],
                "reservoir_count": st['reservoir_count'],
                "lake_count": st['lake_count'],
                "man_made_pct": man_made_pct,
                "turbidity_high_pct": turb_high_pct,
                "veg_pct": veg_pct,
                "largest_waterbody_name": st['largest_waterbody']['name'],
                "largest_waterbody_ha": st['largest_waterbody']['area_ha']
            },
            "geometry": d['geom']
        })

    districts_geojson = {
        "type": "FeatureCollection",
        "name": "TamilNadu_Districts_Waterbodies",
        "features": district_features
    }

    with open(os.path.join(out_dir, 'tn_districts.geojson'), 'w', encoding='utf-8') as f:
        json.dump(districts_geojson, f)

    # 5. Write tn_waterbodies_major.geojson
    print("5. Writing public/data/tn_waterbodies_major.geojson...")
    major_geojson = {
        "type": "FeatureCollection",
        "name": "TamilNadu_Major_Waterbodies",
        "metadata": {
            "source": "Space Applications Centre (SAC), ISRO / NWIC National Wetland Inventory",
            "state": "Tamil Nadu",
            "feature_count": len(major_features),
            "description": "Major waterbodies, reservoirs, lakes, and prominent irrigation tanks in Tamil Nadu"
        },
        "features": major_features
    }
    with open(os.path.join(out_dir, 'tn_waterbodies_major.geojson'), 'w', encoding='utf-8') as f:
        json.dump(major_geojson, f)

    # 6. Write tn_waterbodies_all.json (compact 64,493 points)
    print("6. Writing public/data/tn_waterbodies_all.json...")
    compact_payload = {
        "metadata": {
            "title": "TankTrace: Tamil Nadu Water Bodies Dataset",
            "source_agency": "Space Applications Centre (SAC), ISRO / NWIC",
            "state": "Tamil Nadu",
            "total_count": len(all_points_compact),
            "schema": ["id", "lat", "lon", "area_ha", "type_idx", "district_idx", "turb_idx", "veg_idx", "name"],
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        },
        "dictionaries": {
            "types": type_list,
            "districts": district_names,
            "turbidity": turbidity_list,
            "vegetation": ["No", "Yes"]
        },
        "records": all_points_compact
    }
    with open(os.path.join(out_dir, 'tn_waterbodies_all.json'), 'w', encoding='utf-8') as f:
        json.dump(compact_payload, f)

    # 7. Write sample_import.geojson for test imports
    print("7. Writing public/data/sample_import.geojson...")
    sample_import = {
        "type": "FeatureCollection",
        "name": "Sample_Temple_Tanks_and_Eris",
        "features": major_features[:50]
    }
    with open(os.path.join(out_dir, 'sample_import.geojson'), 'w', encoding='utf-8') as f:
        json.dump(sample_import, f)

    # 8. Write tn_summary.json
    print("8. Writing public/data/tn_summary.json...")
    state_stats['total_area_ha'] = round(state_stats['total_area_ha'], 1)
    state_stats['total_area_sqkm'] = round(state_stats['total_area_ha'] / 100.0, 1)
    state_stats['data_source'] = "Space Applications Centre (SAC), ISRO / NWIC Hydrological Layer (SAC N)"
    state_stats['citation'] = "National Wetland Inventory and Assessment (NWIA), Space Applications Centre, ISRO & National Water Informatics Centre (NWIC)"
    state_stats['state'] = "Tamil Nadu"

    # Sort districts by count
    sorted_by_count = sorted(
        [{'district': k, **v} for k, v in state_stats['district_distribution'].items()],
        key=lambda x: x['count'],
        reverse=True
    )
    state_stats['rankings_by_count'] = sorted_by_count

    # Historical overview
    state_stats['historical_context'] = {
        "tradition": "Eri Cascading System",
        "antiquity": "1,000+ years (Pallava, Chola, and Pandya dynasties)",
        "hydrological_mechanism": "Cascading tanks where runoff from upper ridge tanks overflows into downstream tanks via supply channels (Varathu Vaikkal) and surplus weirs (Kalingu), creating an interconnected hydrological chain.",
        "man_made_dominance": f"{round((state_stats['levels_ii']['Man-made'] / total_count) * 100, 1)}% of all recorded water bodies in Tamil Nadu are man-made tanks, reflecting an extraordinary community-engineered rainwater harvesting legacy.",
        "top_eri_districts": [d['district'] for d in sorted_by_count[:5]]
    }

    with open(os.path.join(out_dir, 'tn_summary.json'), 'w', encoding='utf-8') as f:
        json.dump(state_stats, f, indent=2)

    elapsed = time.time() - t_start
    print(f"\n[DONE] Pipeline completed in {elapsed:.2f} seconds!")
    print(f"Generated files in {out_dir}:")
    for fname in os.listdir(out_dir):
        fpath = os.path.join(out_dir, fname)
        sz_mb = os.path.getsize(fpath) / (1024 * 1024)
        print(f" - {fname} ({sz_mb:.2f} MB)")

if __name__ == '__main__':
    main()
