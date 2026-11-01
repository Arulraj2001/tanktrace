# TankTrace — 3-Minute Video Demo Script
**Challenge:** AWS Builder Center "Weekend Challenge: Map It"  
**Project:** TankTrace: Mapping Tamil Nadu's Hidden Water Network  
**Target Video Duration:** 2 minutes 45 seconds (Under 3-minute limit)  

---

### [0:00 - 0:25] Introduction & The Problem
**Visual:**  
Camera pans across the glowing dark basemap of Tamil Nadu in TankTrace. The header displays *"TankTrace — Tamil Nadu's Hidden Water Network"* alongside the live stats counter showing *64,493 water bodies, 696,538 hectares*.

**Voiceover:**  
*"Welcome to TankTrace. Tamil Nadu lies in the rain-shadow of the Western Ghats. For over a millennium, life and agriculture here have depended on the Northeast Monsoon—a brief, unpredictable window of torrential rain.  
To survive and thrive, ancient builders engineered one of the most sophisticated hydrological systems in human history: interconnected cascading tank networks called Eris.  
For the AWS Builder Center 'Map It' Challenge, we built TankTrace to map, analyze, and make visible this entire 64,400-strong water network using Amazon Location Service, Amazon S3, and modern geospatial engineering."*

---

### [0:25 - 0:55] Architecture & AWS Integration
**Visual:**  
Mouse cursor hovers over the AWS status pill in the top bar. Switch basemap between Amazon Location Service, Carto Dark Matter, and Satellite imagery. Show smooth, 60fps tile rendering.

**Voiceover:**  
*"Under the hood, TankTrace integrates directly with Amazon Location Service. Using scoped API keys and Amazon Location map resources, the app streams crisp vector and raster tiles tailored for geospatial visualization. If credentials are not set, it features a seamless fallback to Carto and OpenStreetMap so anyone can run it locally without setup friction.  
Furthermore, our geospatial data pipeline processes 64,493 real water bodies mapped by ISRO's Space Applications Centre and NWIC. Processed datasets are hosted on Amazon S3 and edge-cached via AWS Amplify Hosting."*

---

### [0:55 - 1:35] Explore, Filters & Real-Time Analytics
**Visual:**  
Expand the 'Explore & Filter' sidebar on the left.
1. Select **District: Pudukkottai**. Watch the map zoom in and filter to 6,793 water bodies.
2. Filter by **Classification: Tank/Pond**.
3. Move the **Surface Area** filter to `>25 ha`.
4. Click on a large water body. The detail panel slides in from the bottom right, displaying verified hectares, acres, turbidity rating, and WGS84 coordinates.

**Voiceover:**  
*"Every marker you see is an authentic, verified water body—zero synthetic data or hallucinated markers.  
Using our high-performance canvas engine, users can filter through 30 districts in real-time.  
Notice how when we isolate Pudukkottai and Sivaganga, over 99% of the water bodies are classified as man-made tanks. Clicking any feature immediately displays its verified surface area, classification, turbidity index, and coordinates with one-click copying."*

---

### [1:35 - 2:15] Guided Storytelling: "Discover the Network"
**Visual:**  
Click the **"Discover Network"** button in the header. The Story Mode drawer opens.
- Step 1: Shows the statewide distribution overview.
- Click 'Next Step' -> The map smoothly animates with a flyTo transition down to Pudukkottai & Sivaganga.
- Click 'Next Step' -> The camera flies up to the Pallava heartland in Kanchipuram and Thiruvallur.
- Click 'Next Step' -> Highlights Mettur Reservoir in Salem and explains how modern reservoirs feed traditional delta tanks.

**Voiceover:**  
*"To help users understand the geographic patterns, TankTrace includes a guided storytelling tour: 'Discover the Network'.  
In Step 1, we observe the sheer statewide density.  
In Step 2, the tour flies us to the southern epicenters in Pudukkottai and Sivaganga—where tanks are connected in series so overflow from upper tanks fills downstream tanks via surplus weirs called Kalingu.  
Step 3 reveals the northern Pallava reservoirs that have guarded Chennai's basin for over a thousand years.  
And Step 4 demonstrates how modern river regulators like Mettur Dam interface with centuries-old downstream irrigation canals."*

---

### [2:15 - 2:35] Custom GeoJSON Importer
**Visual:**  
Click the **"Import"** button. The modal opens. Click **"Load Sample"**. The map instantly imports 50 landmark reservoirs and historical eris, flies directly to the first feature, and selects it.

**Voiceover:**  
*"TankTrace also features a graceful GeoJSON importer. Hydrologists, researchers, and local surveyors can drag and drop custom survey files or test our pre-packaged sample dataset of historic landmark eris with complete validation."*

---

### [2:35 - 2:45] Conclusion & Call to Action
**Visual:**  
Zoom out to full statewide view showing the glowing network. Open the About modal displaying dataset citations (ISRO / NWIC / AWS).

**Voiceover:**  
*"TankTrace turns raw geospatial data into actionable, historical, and environmental discovery.  
Explore the live app on AWS Amplify, check out our open-source repository, and discover Tamil Nadu's hidden water network. Thank you!"*

