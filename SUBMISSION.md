# AWS Builder Center Submission Draft

**Challenge:** Weekend Challenge: Map It  
**Project Name:** TankTrace: Mapping Tamil Nadu's Hidden Water Network  

---

## 📌 Submission Overview

| Field | Value |
|---|---|
| **Submission Title** | TankTrace: Mapping Tamil Nadu's Hidden Water Network with Amazon Location Service |
| **Short Description** | An interactive geospatial exploration platform mapping 64,493 verified water bodies and ancient cascading tank (*Eri*) systems across Tamil Nadu using Amazon Location Service, Amazon S3, and AWS Amplify. |
| **Live Application URL** | `https://main.d1abcdefghijklmn.amplifyapp.com` *(Replace with your deployed Amplify URL)* |
| **GitHub Repository URL**| `https://github.com/your-username/tanktrace` *(Replace with your public repository URL)* |
| **Demo Video URL** | `https://youtu.be/your-video-id` *(Replace with your unlisted/public video link, under 3 mins)* |
| **Primary AWS Services**| Amazon Location Service, Amazon Simple Storage Service (S3), AWS Amplify Hosting |
| **Tags** | `aws-location-service`, `geospatial`, `amplify`, `s3`, `react`, `vite`, `map-it-challenge`, `opendata` |

---

## 📝 Submission Body

### 1. Inspiration & Problem Statement
Tamil Nadu is one of India's most water-stressed regions, yet it is home to one of the ancient world's greatest hydrological triumphs: the cascading *Eri* tank network. Engineered by Pallava, Chola, and Pandya rulers over 1,000 years ago, these interconnected earthen reservoirs capture the erratic, torrential Northeast Monsoon, recharging groundwater tables and sustaining agriculture across drought-prone plains.

Despite their monumental historical and environmental significance, these water bodies are frequently overlooked in standard web mapping applications, treated as isolated ponds rather than an interconnected state-wide infrastructure. 

For the **AWS Builder Center "Map It" Challenge**, we built **TankTrace** to bring Tamil Nadu's hidden water network to light through high-performance spatial mapping, verified scientific data, and historical storytelling.

---

### 2. What We Built
TankTrace is a full-stack, hackathon-ready interactive geospatial dashboard:
- **64,493 Verified Features:** Maps every water body documented in Tamil Nadu by the Space Applications Centre (SAC), ISRO and the National Water Informatics Centre (NWIC).
- **Zero Hallucinated Metrics:** Every attribute—from surface water area in hectares, to classification (Tank/Pond, Reservoir, Lake, Aquaculture), to turbidity ratings—comes directly from verified government geospatial records.
- **Performant Vector Engine:** Renders tens of thousands of water bodies and 30 district polygon boundaries simultaneously at 60fps using HTML5 Canvas rendering.
- **Dynamic Exploration & Filtering:** Filter by district, water body type, surface area threshold (>5 ha, >25 ha, >100 ha), turbidity, and aquatic vegetation, or search by name and ID.
- **"Discover the Network" Guided Storytelling:** A 4-step narrated camera tour explaining the geomorphology of the Western Ghats rain-shadow, the southern eri epicenters (Pudukkottai and Sivaganga), the historic Pallava lakes of Kanchipuram, and modern river basin regulators like Mettur Dam.
- **GeoJSON Importer & Fallback:** Allows researchers and hydrologists to drag-and-drop custom survey data or test with our pre-loaded verified sample of landmark tanks.

---

### 3. How We Used AWS
TankTrace integrates three core AWS services into its architecture:
1. **Amazon Location Service:**
   - Powers the interactive basemap with secure, high-contrast vector and raster tile streams.
   - Configurable through scoped API keys (`geo:GetMap*`), ensuring client credentials remain secure without exposing AWS root credentials.
   - Includes graceful, automated fallback to Carto and OpenStreetMap tiles when AWS keys are absent, ensuring seamless zero-setup evaluation.
2. **Amazon Simple Storage Service (S3):**
   - Stores our optimized, pre-processed geospatial dataset (`tn_waterbodies_all.json` and `tn_districts.geojson`), enabling rapid edge delivery.
   - Configured with CORS support for seamless client fetching with automatic fallback to bundled assets.
3. **AWS Amplify Hosting:**
   - Configured with `amplify.yml` for automated CI/CD and edge delivery, building the TypeScript React frontend and deploying to Amazon CloudFront globally.

---

### 4. What the Data Reveals & Provenance Audit
- **696,538 Hectares of Water Surface:** Equivalent to nearly 7,000 square kilometers of water storage across Tamil Nadu (directly verified from SAC ISRO `area_ha`).
- **97.1% Man-Made:** 62,639 out of 64,493 water bodies are man-made tanks, disproving the misconception that Tamil Nadu's water bodies are purely natural lakes.
- **Pudukkottai & Sivaganga Lead the State:** Pudukkottai has 6,793 water bodies (6,693 eris), and Sivaganga has 5,659 (100% man-made).
- **Data Provenance Transparency:**
  - *Source-Backed:* Feature count (64,493), coordinates, surface area, classification levels I/II/III, turbidity states, aquatic vegetation, and official names (13 features).
  - *Derived:* District assignments (computed via point-in-polygon spatial join against Census 2011 district boundary polygons).
  - *Contextual:* Historical epigraphical context regarding dynastic tank cascades (*Kalingu*, *Varathu Vaikkal*).
  - *Non-Fabrication Standard:* Zero synthetic drought risk or groundwater stress metrics were created.

---

### 5. Repository Preparation & Verification Checklist

To push this repository to GitHub and publish your submission:

```bash
# 1. Initialize git and configure main branch
git init
git checkout -b main

# 2. Verify .gitignore excludes raw 400MB files and secrets
git status

# 3. Stage and commit files
git add .
git commit -m "feat: complete TankTrace application for AWS Map It Challenge"

# 4. Push to your public GitHub repository
git remote add origin https://github.com/your-username/tanktrace.git
git push -u origin main
```

---

### 6. What's Next for TankTrace
- Integrating the **Registry of Open Data on AWS** (Sentinel-2 and Landsat imagery) to track real-time seasonal water level fluctuations and surface area changes over time.
- Digitizing micro-canal networks (*Varathu Vaikkal*) connecting individual tank cascades.
- Crowdsourced lake restoration tracking for local civic and water stewardship groups.

