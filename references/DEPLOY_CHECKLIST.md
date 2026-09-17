# GitHub Pages Deployment Checklist ✅

## What Was Just Done

### ✅ Configuration Fixed
- Updated `vite.config.js` - Changed base path to `/temples/`
- Created `.github/workflows/deploy.yml` - GitHub Actions workflow
- Committed and pushed to GitHub

### ✅ Build Verified
- Local build test: ✅ Success (264 KB JS, 3.8 KB CSS)
- Output: `dist/` folder ready for deployment

### ✅ Git Repository
- Connected to: `umamags/temples`
- Branch: `master`
- Latest commit: Deployment workflow added

---

## Your Action Items (5 Steps)

### Step 1: Enable GitHub Pages 🔧
**Go to:** https://github.com/umamags/temples/settings/pages

1. Scroll to "Build and deployment"
2. Find "Source" dropdown
3. Select: **"GitHub Actions"**
4. Save

**What to expect:** You'll see a message like:
```
Your site is published at https://umamags.github.io/temples/
```

### Step 2: Trigger First Deployment 🚀
**Go to:** https://github.com/umamags/temples/actions

1. You should see a workflow run in progress
2. Wait for green checkmark (1-2 minutes)
3. Check for errors if red X

### Step 3: Verify Deployment ✅
**After workflow completes:**

1. Visit: https://umamags.github.io/temples/
2. Should see the map with "Explore Temples Across India"
3. Click on a city to verify routing works

### Step 4: Test Temple Data 🏛️
**Try these URLs to verify temples load:**

1. https://umamags.github.io/temples/state/andhra-pradesh/city/amaravati
2. https://umamags.github.io/temples/state/assam/city/guwahati

**Scroll down** to see "Temples and Sacred Sites" section.

### Step 5: Hard Refresh Browser 🔄
If you see old content:
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`
- This clears browser cache

---

## What Happens Now

### Automatic Deployment
Every time you:
```bash
git push origin master
```

The workflow automatically:
1. ✅ Installs dependencies
2. ✅ Builds the app
3. ✅ Deploys to GitHub Pages

### Deployment Time
- Build: ~30 seconds
- Deploy: ~30 seconds
- Total: ~1-2 minutes

### Rollback (If Needed)
If something breaks:
```bash
git revert HEAD  # Reverts last commit
git push origin master  # Triggers re-deployment
```

---

## Workflow Details

### What Gets Deployed
```
dist/
├── index.html           ← App entry point
├── assets/
│   ├── *.js            ← React + code
│   └── *.css           ← Styles
└── data/               ← Temple data files
    └── temples/
        ├── Andhra Pradesh.json
        ├── Arunachal Pradesh.json
        └── ...
```

### Base Path Handling
- Local: `http://localhost:5173/`
- GitHub Pages: `https://umamags.github.io/temples/`
- Vite auto-routes with `/temples/` prefix

### Data Files Access
- React fetches: `/data/temples/Andhra Pradesh.json`
- Deployed as: `https://umamags.github.io/temples/data/temples/Andhra Pradesh.json`
- ✅ Correctly handled by base path setting

---

## Troubleshooting Guide

### Problem: Workflow Runs But Doesn't Deploy

**Check:**
1. Go to Actions → Latest run
2. Look for error messages
3. Common issue: "Base path" - FIXED ✅

**Solution:** Already fixed in this setup

### Problem: Site Shows 404

**Check:**
1. Is "GitHub Actions" selected in Pages settings?
2. Did workflow finish with ✅?
3. Is URL correct: `https://umamags.github.io/temples/`

**Fix:**
```bash
# Hard refresh browser
# Windows: Ctrl+Shift+R
# Mac: Cmd+Shift+R
```

### Problem: Assets Don't Load (Blank Page)

**Check:**
1. Browser console (F12) - Are there 404 errors?
2. Common issue: Base path wrong

**Solution:** Already fixed ✅ (vite.config.js base: '/temples/')

### Problem: Temple Data Missing

**Check:**
1. Are data files committed? `git status`
2. Are they in public/data/temples/?
3. Did build include them? `ls dist/data/`

**Fix:**
```bash
git add public/data/temples/
git commit -m "Add temple data"
git push origin master
```

### Problem: Still Not Working?

**Debug steps:**
1. Check latest workflow run on Actions tab
2. Look for error messages in build output
3. Verify file exists: `ls -la public/data/temples/`
4. Clear browser cache (hard refresh)
5. Check browser console for 404s

---

## Testing Locally Before Pushing

Always test before pushing to production:

```bash
# Build for production
npm run build

# Preview locally (simulates GitHub Pages)
npm run preview

# Visit http://localhost:4173/temples/
```

---

## Site URLs

### Local Development
```
http://localhost:5173/
```

### GitHub Pages (After Setup)
```
https://umamags.github.io/temples/
```

### Specific Pages
```
https://umamags.github.io/temples/state/andhra-pradesh/city/amaravati
https://umamags.github.io/temples/state/assam/city/guwahati
```

---

## Performance Check

Build output:
- **index.html:** 0.47 KB (gzipped: 0.30 KB)
- **JavaScript:** 264 KB (gzipped: 86.51 KB)
- **CSS:** 3.82 KB (gzipped: 1.28 KB)
- **Total:** ~95 KB gzipped

✅ Excellent performance!

---

## Next Steps After Deployment

### Add More Cities
```bash
python python/getTemples.py
python python/syncTemples.py
git add public/data/temples/
git commit -m "Add temples for all cities"
git push origin master
```

### Customize Domain (Optional)
To use custom domain like `temples.yourdomain.com`:
1. Add CNAME file in public/
2. Configure DNS
3. Enable in Pages settings

### Monitor Deployments
- GitHub Actions: github.com/umamags/temples/actions
- Deployment history: Settings → Environments → github-pages

---

## Quick Reference

| Action | Command |
|--------|---------|
| Push changes | `git push origin master` |
| View workflows | https://github.com/umamags/temples/actions |
| View Pages settings | https://github.com/umamags/temples/settings/pages |
| Visit deployed site | https://umamags.github.io/temples/ |
| Build locally | `npm run build` |
| Preview build | `npm run preview` |

---

## Status

✅ **GitHub Actions:** Set up and ready  
✅ **Vite Config:** Correct base path configured  
✅ **Build:** Tested and working  
✅ **Ready to:** Enable Pages and deploy

**Next action:** Go to Step 1 above! 🚀
