# Setting Up Temple Data - Step by Step Guide

## Overview

This guide walks you through fetching temple data using OpenAI and integrating it into the React app.

## Prerequisites

- Python 3.8+
- OpenAI API key (get one at https://platform.openai.com/api-keys)
- `pip` (Python package manager)

## Step 1: Setup Python Environment

### 1.1 Install Dependencies
```bash
cd /Users/maheshnatarajan/workspace/temples
pip install -r python/requirements.txt
```

### 1.2 Set OpenAI API Key
**Option A: Environment Variable (Temporary)**
```bash
export OPENAI_API_KEY="sk-..."
```

**Option B: .env File (Persistent)**
Create `.env` in the project root:
```
OPENAI_API_KEY=sk-...
```

**Option C: .bashrc/.zshrc (Persistent)**
Add to your shell profile:
```bash
export OPENAI_API_KEY="sk-..."
```

Verify it's set:
```bash
echo $OPENAI_API_KEY
```

## Step 2: Run Pilot (Recommended First)

The pilot fetches temple data for the **first city of 5 states** (5 API calls, ~$0.20).

### 2.1 Run Pilot
```bash
cd /Users/maheshnatarajan/workspace/temples
python python/getTemples.py --pilot
```

### 2.2 Monitor Progress
```bash
# In another terminal, watch the logs in real-time
tail -f temples_fetch.log
```

### 2.3 What Happens
- Fetches temples for:
  - Andhra Pradesh (Visakhapatnam)
  - Arunachal Pradesh (Naharlagun)
  - Assam (Guwahati)
  - Bihar (Gaya)
  - Chhattisgarh (Bilaspur)
- Stores data in `data/temples/`
- Logs to `temples_fetch.log`

### 2.4 Expected Output
```
Temples data for Visakhapatnam:
- Kali Temple
- Sri Veerayya Temple
- ...

Saved: data/temples/Andhra_Pradesh.json
```

**Estimated Time:** 2-5 minutes  
**Estimated Cost:** $0.15-0.25

## Step 3: Verify Pilot Results

### 3.1 Check Generated Files
```bash
ls -lh data/temples/
```

Should show:
```
Andhra_Pradesh.json
Arunachal_Pradesh.json
Assam.json
Bihar.json
Chhattisgarh.json
```

### 3.2 Inspect Data
```bash
cat data/temples/Andhra_Pradesh.json | jq '.cities | keys'
```

Should show cities with temple data.

### 3.3 Check a Temple
```bash
cat data/temples/Andhra_Pradesh.json | jq '.cities.Visakhapatnam[0]'
```

Should show:
```json
{
  "name": "Temple Name",
  "main_deity": "Deity",
  "image_url": "https://...",
  "website": "https://...",
  "year_constructed": 1234,
  "festivals_and_events": [...]
}
```

## Step 4: Sync Data to React App

After verifying pilot results, sync the data to the React app:

```bash
python python/syncTemples.py
```

This creates:
- `public/data/temples/` directory with all state JSON files
- `public/data/temples/index.json` with summary

## Step 5: Update React App to Display Temples

### 5.1 Create a Hook for Temple Data

Create `src/data/useTemples.js`:

```javascript
import { useState, useEffect } from 'react'

export function useTemples(state, city) {
  const [temples, setTemples] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadTemples() {
      try {
        const statePath = state.replace(/ /g, '_')
        const response = await fetch(`/data/temples/${statePath}.json`)
        
        if (!response.ok) throw new Error('Failed to load temples')
        
        const data = await response.json()
        const cityTemples = data.cities[city] || []
        
        if (isMounted) {
          setTemples(cityTemples)
          setStatus('ready')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setStatus('error')
        }
      }
    }

    loadTemples()
    return () => { isMounted = false }
  }, [state, city])

  return { temples, status, error }
}
```

### 5.2 Update StateCityDetailPage to Show Temples

Update `src/pages/StateCityDetailPage.jsx`:

```javascript
import { useTemples } from '../data/useTemples'

// Inside the component:
const { temples, status, error } = useTemples(displayStateName, displayCityName)

// In JSX, replace the placeholder section with:
{status === 'loading' && <p>Loading temples...</p>}
{status === 'error' && <p>Could not load temples: {error}</p>}
{status === 'ready' && temples && temples.length > 0 && (
  <section className="detail-section">
    <h2>Temples and Sacred Sites</h2>
    <div className="temples-grid">
      {temples.map((temple, idx) => (
        <div key={idx} className="temple-card">
          <h3>{temple.name}</h3>
          {temple.image_url && (
            <img src={temple.image_url} alt={temple.name} />
          )}
          <p><strong>Main Deity:</strong> {temple.main_deity}</p>
          {temple.year_constructed && (
            <p><strong>Year Constructed:</strong> {temple.year_constructed}</p>
          )}
          {temple.website && (
            <p><a href={temple.website} target="_blank" rel="noopener noreferrer">
              Visit Website →
            </a></p>
          )}
          {temple.festivals_and_events && temple.festivals_and_events.length > 0 && (
            <div>
              <strong>Festivals & Events:</strong>
              <ul>
                {temple.festivals_and_events.map((festival, i) => (
                  <li key={i}>{festival}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  </section>
)}
```

### 5.3 Add CSS for Temple Cards

Add to `src/App.css`:

```css
.temples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.temple-card {
  padding: 1.5rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.temple-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.temple-card h3 {
  margin-top: 0;
  color: #333;
}

.temple-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin: 1rem 0;
}

.temple-card p {
  margin: 0.5rem 0;
  color: #666;
}

.temple-card ul {
  margin: 0.5rem 0 0 1.5rem;
  color: #666;
}

.temple-card a {
  display: inline-block;
  margin-top: 0.5rem;
  font-weight: 500;
}
```

## Step 6: Full Fetch (When Ready)

Once pilot looks good, fetch all cities:

```bash
# Fetch data for all cities in all states
python python/getTemples.py

# This will take 30-60 minutes depending on state count
# Monitor with: tail -f temples_fetch.log

# Sync when done
python python/syncTemples.py
```

**Estimated Time:** 30-60 minutes  
**Estimated Cost:** $2-4  
**Total Temples:** ~500 (5 temples × 100 cities)

## Step 7: Test in React App

1. Make sure React dev server is running:
   ```bash
   npm run dev
   ```

2. Visit a city page:
   ```
   http://localhost:5173/state/andhra-pradesh/city/visakhapatnam
   ```

3. Scroll down to "Temples and Sacred Sites" section

4. Verify temples are displaying with:
   - Names
   - Images (if URLs work)
   - Deities
   - Websites
   - Festivals

## Troubleshooting

### Python Script Errors

**Error: "OPENAI_API_KEY not set"**
```bash
export OPENAI_API_KEY="sk-..."
# Try again
```

**Error: "Failed to parse JSON response"**
- OpenAI sometimes returns malformed JSON
- The script retries automatically (up to 2 times)
- Check `temples_fetch.log` for the full response
- Try running again (it will skip successfully fetched states)

**Error: "Rate limit exceeded"**
- OpenAI has rate limits based on your plan
- The script includes delays between requests
- Wait a few minutes and run again

### React App Issues

**Temples not showing**
1. Check browser console for errors (F12)
2. Verify files exist: `ls public/data/temples/`
3. Check file permissions: `ls -l public/data/temples/`
4. Try different city: http://localhost:5173/state/maharashtra/city/pune

**Images not loading**
- Image URLs may be broken or behind authentication
- Check if image URLs are valid (open in new tab)
- This is normal - not all temples have public image URLs available

**Data is outdated**
- Temples data changes over time
- Rerun the fetch scripts to update: `python python/getTemples.py --force`

## Next Steps

- Customize temple card styling in App.css
- Add filtering by deity or festival
- Create a temples search feature
- Add ratings or reviews
- Generate static HTML pages for SEO

## Support Files

- `python/README.md` - Detailed script documentation
- `temples_fetch.log` - Full API fetch logs
- `temples_sync.log` - Data sync logs
- `data/temples/` - Generated temple data
- `public/data/temples/` - Synced React-accessible data
