# Complete Database-Driven Migration

**Date**: September 16, 2026  
**Status**: ✅ All data now comes from MySQL database, no static JSON files used

---

## What Changed

### Previous Issues
- Map navigation used static JSON (`citiesWithTempleData.js`)
- State selection used static JSON (`statesData.js`)
- City selection used static JSON
- Only temple data came from database (inconsistency)
- URLs weren't truly ID-based because navigation still used slugs

### Solution
**All data now comes from MySQL database**
- States fetched from `states` table
- Cities/locations fetched from `locations` table
- Temples fetched from `temples` table
- **No more dependency on static JSON files**

---

## New API Endpoints

### 1. `getStates.php`
```
GET /backend/query/getStates.php
Response: List of all states with IDs, names, and temple counts
```

Example response:
```json
{
  "success": true,
  "count": 28,
  "data": [
    {
      "id": 1,
      "name": "Andhra Pradesh",
      "slug": "andhra-pradesh",
      "total_temples": 0,
      "city_count": 0,
      "location_count": 16,
      "temple_count": 101
    }
  ]
}
```

### 2. `getLocations.php`
```
GET /backend/query/getLocations.php
Response: List of all cities/towns with IDs, state info, and coordinates
```

Example response:
```json
{
  "success": true,
  "count": 371,
  "data": [
    {
      "id": 247,
      "name": "Ahobilam",
      "kind": "town",
      "lat": 15.2394,
      "lon": 78.9967,
      "state_id": 1,
      "state": "Andhra Pradesh",
      "temple_count": 2
    }
  ]
}
```

---

## Components Updated

### HomePage.jsx
**Before**: Used hardcoded `statesAndCities` and `citiesWithTempleData` from JSON  
**After**: Fetches states from `getStates.php` and locations from `getLocations.php`

```javascript
// Now fetches real data
const statesResponse = await fetch(`${baseUrl}/backend/query/getStates.php`)
const locationsResponse = await fetch(`${baseUrl}/backend/query/getLocations.php`)
```

### IndiaMap.jsx
**Before**: Used hardcoded `citiesWithTempleData` for city markers  
**After**: Accepts `locations` and `states` arrays as props with IDs

```javascript
// Receives data with IDs from parent
<IndiaMap 
  locations={mapLocations}    // From API
  states={mapStates}          // From API
  onCityClick={handleCityClick}
  onStateClick={handleStateClick}
/>
```

Callbacks now pass IDs:
```javascript
const handleStateClick = (stateId) => {  // Now receives ID
  navigate(`/state/${stateId}`)
}

const handleCityClick = (cityId) => {    // Now receives ID
  navigate(`/city/${cityId}`)
}
```

### CitySearch.jsx
**Before**: Used hardcoded `citiesWithTempleData`  
**After**: Fetches from `getLocations.php`

```javascript
// Now fetches from API
const response = await fetch(`${baseUrl}/backend/query/getLocations.php`)
const data = await response.json()
setLocations(data.data || [])
```

### StateTownDetailPage.jsx
**Before**: Used slugs from URL, used hardcoded `statesAndCities`  
**After**: Uses cityId from URL, gets all data from database

```javascript
const { cityId } = useParams()  // Now receives ID
const { temples, status, error, city } = useTemples(parseInt(cityId))
```

---

## URL Navigation Flow

### Before
1. User clicks on map
2. Map uses hardcoded city name from `citiesWithTempleData`
3. URL generated with slugs: `/state/tamil-nadu/city/chennai`
4. Component tries to fetch by name
5. Inconsistency: map data != actual available data

### After
1. User clicks on map
2. Map has real location data (ID, name, coordinates) from database
3. Map passes city ID to callback
4. Navigation: `/city/193`
5. Component fetches by ID directly
6. Single source of truth: database

---

## Data Flow

```
Database (MySQL)
├── states table → getStates.php → HomePage
├── locations table → getLocations.php → HomePage, IndiaMap, CitySearch
└── temples table → getAllTemples.php → HomePage

HomePage
├── Renders IndiaMap with real state/location data
├── Renders CitySearch with real location data
└── Renders TempleTable with real temple data

Navigation (all ID-based)
├── /state/{stateId} → StateDetailPage
├── /city/{cityId} → StateTownDetailPage
└── /temple/{templeId} → TempleDetailPage
```

---

## Static JSON Files (Now Unused)

The following files are **no longer used** and can be removed later:
- `src/data/statesData.js`
- `src/data/citiesWithTempleData.js`

They are kept for now as a reference but all navigation is database-driven.

---

## Benefits

✅ **Single Source of Truth** — All data from database  
✅ **Consistency** — Map data matches available data  
✅ **Real-time Updates** — Changes in DB reflect immediately  
✅ **ID-based Navigation** — URLs are stable and unique  
✅ **No More Hardcoding** — Add a state/city in DB, it's automatically available  
✅ **Scalable** — Can add/edit states/cities without code changes  

---

## Testing the Migration

### Test URLs (copy into browser)
```
http://localhost:5173/temples/state/1        # Andhra Pradesh
http://localhost:5173/temples/state/23       # Tamil Nadu
http://localhost:5173/temples/city/193       # Chennai
http://localhost:5173/temples/temple/930     # Ashtalakshmi Temple
```

### Test Navigation Flow
1. **HomePage** → Click on map
   - Should navigate to `/state/{stateId}` or `/city/{cityId}`
   
2. **StateDetailPage** → Click on city
   - Should navigate to `/city/{cityId}`
   
3. **CitySearchPage** → Search and select city
   - Should navigate to `/city/{cityId}`
   
4. **All Pages** → Click on temple name
   - Should navigate to `/temple/{templeId}`

### Expected Behavior
- ✅ Map shows all states and cities (from database)
- ✅ Clicking state/city navigates to correct URL with ID
- ✅ All pages load correct data from database
- ✅ No more "page not found" due to slug mismatches
- ✅ URLs are bookmarkable and permanent

---

## Files Created

```
backend/query/
├── getStates.php                [NEW]
└── getLocations.php             [NEW]
```

## Files Modified

```
src/
├── pages/
│   ├── HomePage.jsx             [MODIFIED] - Fetch from API
│   └── StateTownDetailPage.jsx  [MODIFIED] - Use cityId
├── components/
│   ├── IndiaMap.jsx             [MODIFIED] - Accept data with IDs
│   └── CitySearch.jsx           [MODIFIED] - Fetch from API
└── App.jsx                      [UNCHANGED] - Routes already ID-based
```

---

## Next Steps

1. **Test all navigation flows** in the browser
2. **Verify all page loads** work correctly
3. **Check Network tab** to confirm API calls
4. **Optional**: Remove unused JSON files later (`statesData.js`, `citiesWithTempleData.js`)

---

**Status**: Complete database-driven migration! 🎉  
All static JSON data has been replaced with real-time database queries.
