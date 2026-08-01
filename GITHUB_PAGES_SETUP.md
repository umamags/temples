# GitHub Pages Deployment Setup

## Overview

The Temples of India app is configured for automatic deployment to GitHub Pages using GitHub Actions.

## Current Configuration

- **Repository:** `umamags/temples`
- **Build tool:** Vite
- **Base path:** `/temples/` (for project pages)
- **Deployment:** GitHub Pages
- **CI/CD:** GitHub Actions

## What's Been Set Up

### 1. ✅ Vite Configuration
- Updated `vite.config.js` with correct base path: `/temples/`
- This ensures all assets load correctly on GitHub Pages

### 2. ✅ GitHub Actions Workflow
- Created `.github/workflows/deploy.yml`
- Automatically builds and deploys on push to `main` or `master`
- Builds on: Ubuntu latest
- Node version: 18
- npm cache enabled for faster builds

## GitHub Pages Configuration (What You Need to Do)

### Step 1: Enable GitHub Pages

1. Go to **GitHub** → Your repository (`umamags/temples`)
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source:** Select "GitHub Actions"
   - This tells GitHub to deploy from the Actions workflow

### Step 2: Configure Branch Protection (Optional but Recommended)

1. Go to **Settings** → **Branches**
2. Add rule for `main` or `master`
3. Require status checks to pass

### Step 3: Verify Settings

After enabling, you should see:
```
Your site is published at https://umamags.github.io/temples/
```

## How Deployment Works

### Automatic Deployment Workflow

```
You push code to main/master
    ↓
GitHub Actions triggers
    ↓
1. Install dependencies (npm install)
    ↓
2. Build app (npm run build)
    ↓
3. Upload dist/ folder
    ↓
4. Deploy to GitHub Pages
    ↓
Site available at: https://umamags.github.io/temples/
```

**Time:** ~1-2 minutes per deployment

### Manual Deployment (If Needed)

1. Build locally:
```bash
npm run build
```

2. Check output:
```bash
ls -la dist/
```

3. Push to GitHub:
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## Troubleshooting

### Site Not Appearing After Push

1. **Check Actions tab** → Click latest run
2. **Verify build succeeded** → Green checkmark
3. **Check Pages settings** → Source should be "GitHub Actions"
4. **Wait 5 minutes** → GitHub Pages needs time to deploy
5. **Hard refresh** → Browser cache (`Ctrl+Shift+R` or `Cmd+Shift+R`)

### Build Failing

1. **Check workflow log:**
   - Go to GitHub Actions tab
   - Click the failed workflow
   - Look for error in build step

2. **Common issues:**
   - `npm install` failed → Check internet connection
   - `npm run build` failed → Check console errors locally
   - Missing files → Commit all changes

### Site Loads But Assets Missing

1. **Verify base path** → Check `vite.config.js` has `base: '/temples/'`
2. **Check browser console** → Look for 404 errors
3. **Common paths:**
   - JavaScript: `https://umamags.github.io/temples/assets/...`
   - CSS: `https://umamags.github.io/temples/assets/...`
   - Data: `https://umamags.github.io/temples/data/temples/...`

### Temple Data Not Loading

1. **Check public/data/temples/** → Files should exist locally
2. **Verify they're committed** → `git status`
3. **Check file paths** → Should use `/temples/` prefix
4. **Look in browser console** → Any 404 errors for data files

## File Structure in Deployment

```
dist/                          ← Build output (deployed)
├── index.html                 ← Entry point
├── assets/
│   ├── index-*.js            ← React app
│   └── index-*.css           ← Styles
└── data/                      ← Synced temple data
    └── temples/
        ├── Andhra Pradesh.json
        └── ...

deployed to: https://umamags.github.io/temples/
```

## Environment Variables (If Needed)

If you need environment variables in production:

1. Add to `.github/workflows/deploy.yml`:
```yaml
env:
  VITE_API_URL: https://api.example.com
```

2. Or use GitHub Secrets:
   - Settings → Secrets and variables → Actions
   - Add secret: `MY_SECRET`
   - Use in workflow: `${{ secrets.MY_SECRET }}`

## CI/CD Best Practices

### Branch Strategy
- Push to `main` or `master` = automatic deployment
- Pull requests = builds but doesn't deploy
- Tag releases for version tracking

### Before Pushing

Always test locally first:
```bash
npm run build
npm run preview  # Preview build locally
```

### Commit Messages

Good commit messages help track changes:
```bash
git commit -m "Add Amaravati temples data"
git commit -m "Fix map styling"
git commit -m "Update temple cards"
```

## Rollback (If Needed)

If a deployment breaks the site:

1. Revert to previous commit:
```bash
git revert HEAD
git push origin main
```

2. Or force push to safe commit:
```bash
git reset --hard <commit-hash>
git push --force origin main
```

## Deployment History

Check all deployments:
1. Go to GitHub → Settings → Environments
2. Select "github-pages"
3. View deployment history
4. Click deployment to see logs

## Custom Domain (Advanced)

To use a custom domain:

1. Add `CNAME` file in `public/`:
```
example.com
```

2. Configure DNS to point to GitHub Pages
3. Enable in Settings → Pages → Custom domain

## Performance Tips

### Build Optimization
- Vite already optimizes production builds
- Gzip compression is handled by GitHub Pages

### Caching
- GitHub Actions uses npm cache (faster rebuilds)
- Browser caching handled by GitHub Pages

### Build Size
Current build: ~85 KB gzipped
- React: ~42 KB
- App code: ~35 KB
- CSS: ~8 KB

## Deployment Status

To check deployment status in real-time:

1. **GitHub Actions:** umamags/temples/actions
2. **GitHub Environments:** Settings → Environments → github-pages
3. **GitHub Pages:** Settings → Pages

## Next Steps

1. ✅ Configure GitHub Pages settings (enable Actions)
2. ✅ Push changes to GitHub:
```bash
git add .github/
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```
3. ✅ Check Actions tab → Wait for deployment
4. ✅ Visit https://umamags.github.io/temples/
5. ✅ Verify site loads correctly

## Support

If deployment fails:
- Check GitHub Actions logs
- Verify `vite.config.js` has correct base path
- Ensure all files are committed
- Check browser console for errors

For more info: https://docs.github.com/en/pages/quickstart
