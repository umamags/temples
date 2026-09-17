# ID-Based URLs Migration - Complete

**Date**: September 16, 2026  
**Status**: ✅ Implementation Complete

---

## What Changed

### URL Structure
**Before** (Name-based, fragile):
```
/state/tamil-nadu
/state/tamil-nadu/city/chennai
/temple/tamil-nadu/city/chennai/ashtalakshmi-temple
```

**After** (ID-based, bookmarkable, robust):
```
/state/23
/city/193
/temple/930
```

### Benefits
✅ **Bookmarkable** — URLs never break due to name changes  
✅ **Unique** — Database IDs are always unique  
✅ **Simple** — Shorter, cleaner URLs  
✅ **RESTful** — Standard REST patterns  
✅ **Fast** — Direct database lookups instead of string matching

---

## Changes Summary

### 1. API Endpoints Updated (5 files)

#### `getStateTemples.php`
- **Before**: `?state=Tamil%20Nadu` (name-based)
- **After**: `?state_id=23` (ID-based)
- **Response**: Now includes `location_id` for each temple

#### `getCityTemples.php`
- **Before**: `?state=...&city=...` (dual name params)
- **After**: `?city_id=145` (single ID param)
- **Response**: Includes `state_id` and `location_id`

#### `getTempleDetail.php`
- **Before**: `?state=...&city=...&temple=...` (triple name match)
- **After**: `?temple_id=930` (direct ID lookup)
- **Response**: Includes all parent IDs

#### `getAllTemples.php`
- Now includes `state_id` and `location_id` in every temple object

### 2. React Routing Updated

File: `src/App.jsx`
```javascript
// Before
<Route path="state/:stateName" />
<Route path="state/:stateName/:townName" />
<Route path="temple/:stateName/:cityName/:templeName" />

// After
<Route path="state/:stateId" />
<Route path="city/:cityId" />
<Route path="temple/:templeId" />
```

### 3. React Hooks Updated (4 files)

#### `useStateTemples2.js`
```javascript
// Before: useStateTemples2(stateName)
// After: useStateTemples2(stateId)
```
- Takes numeric `stateId` instead of string state name
- Returns additional `state` object with name info
- Much simpler lookup logic

#### `useTemples.js` (was city fetcher)
```javascript
// Before: useTemples(state, city)
// After: useTemples(cityId)
```
- Single ID parameter instead of dual names
- Returns `city` object with parent info
- Cleaner parameter passing

#### `useTempleDetail2.js`
```javascript
// Before: useTempleDetail2(stateName, cityName, templeName)
// After: useTempleDetail2(templeId)
```
- Direct ID lookup instead of three-level name matching
- No more complex string comparison logic
- O(1) database lookup instead of O(n)

#### `useAllTemples.js`
- Already simple, unchanged logic
- Now includes IDs in response data

### 4. React Pages Updated (3 files)

#### `StateDetailPage.jsx`
```javascript
// Extract from URL
const { stateId } = useParams()
const { temples, status, state } = useStateTemples2(parseInt(stateId))

// Navigate to cities using IDs
navigate(`/city/${town.location_id}`)
```

#### `StateCityDetailPage.jsx` (simplified)
```javascript
// Extract from URL
const { cityId } = useParams()
const { temples, status, error, city } = useTemples(parseInt(cityId))

// All breadcrumb navigation uses IDs
navigate(`/state/${stateId}`)
```

#### `TempleDetailPage.jsx`
```javascript
// Extract from URL
const { templeId } = useParams()
const { temple, status, error } = useTempleDetail2(parseInt(templeId))

// Navigation uses IDs
navigate(`/city/${temple.location_id}`)
```

### 5. Components Updated (1 file)

#### `TempleTable.jsx`
```javascript
// Before
navigate(`/temple/${stateSlug}/${citySlug}/${templeSlug}`)

// After
navigate(`/temple/${temple.id}`)
```
- Removed slug generation completely
- Uses direct IDs from data objects

### 6. HomePage Updated

Significant refactor to derive IDs from temple data:
- Extracts unique states and cities from `allTemples` response
- Builds maps: `stateId` → state, `cityId` → city
- Navigates using IDs instead of slugs
- No longer depends on hardcoded `statesData.js`

---

## Testing the New URLs

### Manual Testing URLs
```bash
# State 23 = Tamil Nadu
http://localhost:5173/temples/state/23

# City 193 = Chennai
http://localhost:5173/temples/city/193

# Temple 930 = Ashtalakshmi Temple
http://localhost:5173/temples/temple/930
```

### Expected Behavior
1. Click "Home" → All temples load with state/city IDs
2. Click on any state → Navigate to `/state/{stateId}`
3. Click on any city → Navigate to `/city/{cityId}`
4. Click on any temple → Navigate to `/temple/{templeId}`
5. All navigation uses IDs, no more slug generation

---

## Files Modified

### Backend (5 PHP files)
```
backend/query/
├── getAllTemples.php        [MODIFIED] - Added state_id, location_id
├── getStateTemples.php      [MODIFIED] - Changed to state_id param
├── getCityTemples.php       [MODIFIED] - Changed to city_id param
├── getTempleDetail.php      [MODIFIED] - Changed to temple_id param
└── db.php                   [UNCHANGED]
```

### Frontend (8 React files)
```
src/
├── App.jsx                  [MODIFIED] - Updated routing
├── pages/
│   ├── HomePage.jsx         [MODIFIED] - Extract IDs from temples
│   ├── StateDetailPage.jsx  [MODIFIED] - Use stateId from URL
│   ├── StateCityDetailPage.jsx [MODIFIED] - Use cityId from URL
│   └── TempleDetailPage.jsx [MODIFIED] - Use templeId from URL
├── data/
│   ├── useAllTemples.js     [UNCHANGED]
│   ├── useStateTemples2.js  [MODIFIED] - Accept stateId
│   ├── useTemples.js        [MODIFIED] - Accept cityId
│   └── useTempleDetail2.js  [MODIFIED] - Accept templeId
└── components/
    └── TempleTable.jsx      [MODIFIED] - Use IDs for navigation
```

---

## Backwards Compatibility

❌ **Not backwards compatible with old URLs**
- Old URLs like `/state/tamil-nadu` will no longer work
- This is intentional for clean migration
- All navigation is updated to use IDs

---

## Performance Impact

| Operation | Impact |
|-----------|--------|
| Temple lookup | ⚡ Faster (direct ID vs string search) |
| URL generation | ⚡ Faster (no slug computation) |
| Bookmarkability | 📈 Much better |
| URL stability | 📈 Much better (immune to name changes) |

---

## Next Steps

1. **Test all pages** in browser at http://localhost:5173
2. **Verify all navigation** works with new ID-based URLs
3. **Check Network tab** to confirm API endpoints are being called correctly
4. **Test bookmarking** — URLs should remain valid indefinitely
5. **Consider adding** a state/city list API if needed for future features

---

## Rollback (if needed)

If issues arise, the old code is still in git history:
```bash
git log --oneline -- src/pages/
git show HEAD~1:src/pages/StateDetailPage.jsx
```

But given the robustness of ID-based URLs, rollback should not be necessary.

---

**Status**: Ready for full testing! 🚀
