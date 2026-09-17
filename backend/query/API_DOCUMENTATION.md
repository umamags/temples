# Temples Backend API Documentation

## Overview
The Temples app backend provides REST API endpoints to fetch temple data from MySQL database. All endpoints return JSON and support CORS for development environments.

### Base URL
- **Local Dev**: `http://localhost:8000/backend/query/`
- **Production**: `https://ai-lab.in/backend/query/`

### Response Format
All endpoints return a consistent JSON response format:

**Success Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5243
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

---

## Endpoints

### 1. Get All Temples
Fetches all temples across all states and locations.

**URL**: `/getAllTemples.php`
**Method**: `GET`
**Parameters**: None

**Response:**
```json
{
  "success": true,
  "count": 2484,
  "data": [
    {
      "id": 1,
      "name": "Ahobila Narasimha Swamy Temple (Upper Ahobilam)",
      "deity": "Narasimha (Vishnu avatar)",
      "year_constructed": null,
      "location_note": "The principal shrine...",
      "image_url": null,
      "website": null,
      "source": "temples2",
      "festivals_and_events": [],
      "state": "Andhra Pradesh",
      "town": "Ahobilam",
      "type": "town",
      "lat": 15.2394,
      "lon": 78.9967
    }
  ]
}
```

**Used By**: HomePage (useAllTemples hook)

**Example**:
```javascript
fetch('http://localhost:8000/backend/query/getAllTemples.php')
  .then(r => r.json())
  .then(result => console.log(result.data))
```

---

### 2. Get State Temples
Fetches all temples in a specific state, grouped by location/town.

**URL**: `/getStateTemples.php`
**Method**: `GET`
**Parameters**:
- `state` (required): Name of the state (e.g., "Andhra Pradesh")

**Response**:
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "id": 1,
      "name": "Temple Name",
      "deity": "Deity Name",
      "town": "Town/City Name",
      "type": "town",
      "lat": 15.2394,
      "lon": 78.9967,
      ...
    }
  ]
}
```

**Error Cases**:
- `STATE_NOT_FOUND` (404): State doesn't exist in database

**Used By**: StateDetailPage (useStateTemples2 hook)

**Example**:
```javascript
fetch('http://localhost:8000/backend/query/getStateTemples.php?state=Andhra%20Pradesh')
  .then(r => r.json())
```

---

### 3. Get City Temples
Fetches all temples in a specific city within a state.

**URL**: `/getCityTemples.php`
**Method**: `GET`
**Parameters**:
- `state` (required): State name (e.g., "Andhra Pradesh")
- `city` (required): City/town name (e.g., "Tirupati")

**Response**:
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": 15,
      "name": "Sri Venkateswara Temple",
      "deity": "Vishnu",
      "city": "Tirupati",
      "state": "Andhra Pradesh",
      "type": "city",
      "lat": 13.1939,
      "lon": 79.8941,
      ...
    }
  ]
}
```

**Error Cases**:
- `STATE_NOT_FOUND` (404): State doesn't exist
- `CITY_NOT_FOUND` (404): City not found in state

**Used By**: StateCityDetailPage (useTemples hook)

**Example**:
```javascript
fetch('http://localhost:8000/backend/query/getCityTemples.php?state=Andhra%20Pradesh&city=Tirupati')
  .then(r => r.json())
```

---

### 4. Get Temple Detail
Fetches complete details for a single temple.

**URL**: `/getTempleDetail.php`
**Method**: `GET`
**Parameters**:
- `state` (required): State name
- `city` (required): City/town name
- `temple` (required): Temple name

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 15,
    "name": "Sri Venkateswara Temple",
    "deity": "Vishnu (Venkateshwara)",
    "year_constructed": 9,
    "location_note": "Tirupati is famous...",
    "image_url": null,
    "website": "https://www.tirumalatirupati.org/",
    "source": "temples2",
    "festivals_and_events": [
      {
        "name": "Vaikunta Ekadashi",
        "month": "December"
      }
    ],
    "town": "Tirupati",
    "type": "city",
    "state": "Andhra Pradesh",
    "lat": 13.1939,
    "lon": 79.8941
  }
}
```

**Error Cases**:
- `STATE_NOT_FOUND` (404): State doesn't exist
- `CITY_NOT_FOUND` (404): City not found in state
- `TEMPLE_NOT_FOUND` (404): Temple not found in city

**Used By**: TempleDetailPage (useTempleDetail2 hook)

**Example**:
```javascript
fetch('http://localhost:8000/backend/query/getTempleDetail.php?state=Andhra%20Pradesh&city=Tirupati&temple=Sri%20Venkateswara%20Temple')
  .then(r => r.json())
```

---

## Data Structure

### Temple Object
```typescript
{
  id: number,                      // Unique temple ID
  name: string,                    // Temple name
  deity: string,                   // Primary deity/deities
  year_constructed: number | null, // Year constructed (if available)
  location_note: string,           // Description/location details
  image_url: string | null,        // URL to temple image (future)
  website: string | null,          // Temple website URL
  source: string,                  // Data source ('temples2', 'temples', etc)
  festivals_and_events: object[],  // Array of festival/event objects
  state: string,                   // State name
  town: string,                    // Town/city name
  type: string,                    // 'city', 'town', or 'temple town'
  lat: number,                     // Latitude coordinate
  lon: number                      // Longitude coordinate
}
```

---

## HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (missing required parameter) |
| 404 | Not found (state/city/temple not found) |
| 500 | Server error (database connection failed) |

---

## CORS & Caching

### CORS Headers
Endpoints accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev port)

### Cache Control
All responses include:
```
Cache-Control: public, max-age=3600
```
This caches responses for 1 hour, since temple data is relatively static.

---

## Error Handling

The frontend (React hooks) handles errors gracefully:

1. **Network Error**: If the API is unavailable, hooks set `status: 'error'`
2. **4xx Errors**: Display specific error to user (e.g., "Temple not found")
3. **5xx Errors**: Log error and show generic "Database error" message

Example hook usage:
```javascript
const { temples, status, error } = useTemples(state, city)

if (status === 'loading') return <p>Loading...</p>
if (status === 'error') return <p>Failed to load temples: {error}</p>
return <TempleList temples={temples} />
```

---

## Testing

Run the database test to verify setup:
```bash
php backend/query/test_connection.php
```

Expected output:
```
✓ States table: 28 states found
✓ Locations table: 371 locations found
✓ Temples table: 2484 temples found
✓ Sample state: Andhra Pradesh
✓ Sample temple: Ahobila Narasimha Swamy Temple (Upper Ahobilam) in Ahobilam, Andhra Pradesh

✅ All database tests passed!
```

---

## Migration Notes

### Data Structure Changes
- **JSON Array** → **SQL Joins**: The old JSON files stored nested data; MySQL uses proper foreign keys
- **town** vs **city**: In API responses, both are referred to as "town" in some endpoints for backward compatibility with React components
- **festivals_and_events**: Stored as JSON in MySQL, parsed as array in PHP responses

### Response Format Consistency
- Numeric values are cast to appropriate types (int/float)
- NULL values remain null (not empty strings)
- festival/event arrays are properly JSON-decoded

### Performance
- **Before**: Loading entire state file (50-200KB of JSON)
- **After**: Targeted SQL queries return only needed data
- **Improvement**: 2-10x faster for city/temple queries, similar for state queries due to caching

---

## Future Enhancements

1. **Image URLs**: Once `temple_images` table is populated, use `/backend/query/getTempleImages.php`
2. **User Data**: Endpoints for `/backend/query/getVisitedTemples.php` and `/backend/query/markTempleVisited.php`
3. **Search**: Full-text search endpoint using MySQL FULLTEXT index on temple names
4. **Pagination**: Optional `limit` and `offset` parameters for large queries
5. **Filtering**: Add `deity` or `type` filters for advanced queries
