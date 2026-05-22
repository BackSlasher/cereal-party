# Fancy Cereal Party

A simple voting app for planning a breakfast cereal party. Guests pick dates, cereals, and drinks — results shown as a live heatmap.

## Features

- **Date voting** with priority levels (Yes! / If needed / No)
- **Cereal gallery** with zoomable images (pick up to 2)
- **Milk & juice** preferences
- **Live results** heatmap after voting
- **Returning users** see their previous choices and can edit
- **No login required** — just enter your name

## Setup

### 1. Google Sheet Backend

1. Create a new [Google Sheet](https://sheets.google.com)
2. Go to **Extensions → Apps Script**
3. Delete any existing code and paste contents of `apps-script.js`
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL

### 2. Configure the App

Edit `app.js`:

```js
const CONFIG = {
  SCRIPT_URL: 'YOUR_DEPLOYMENT_URL_HERE',
  
  DATES: [
    '2026-06-04',
    '2026-06-05',
    // ... add your date options
  ],
  
  MAX_CEREALS: 2,
};
```

### 3. Add Cereal Images

Place images in `images/` folder. Supported cereals (edit `CEREALS` array in `app.js` to customize):

- lucky-charms.jpg
- capn-crunch.jpg
- capn-crunch-berries.jpg
- capn-crunch-pb.jpg
- reeses-puffs.png
- french-toast-crunch.jpg
- fruity-pebbles.jpg
- cocoa-pebbles.png
- froot-loops.png
- count-chocula.png
- cinnamon-toast.jpg
- apple-jacks.jpg
- honey-smacks.jpg
- cookie-crisp.jpg
- golden-grahams.jpg

### 4. Deploy

Host on GitHub Pages, Netlify, or any static hosting:

```bash
# GitHub Pages
git add .
git commit -m "Initial commit"
git push origin main
# Enable Pages in repo settings
```

## Usage

- **New user**: Visit the page → enter name → fill form → see results
- **Returning user**: Visit with `?name=YourName` → see results → optionally edit

## Sheet Structure

| Timestamp | Name | Dates (Yes!) | Dates (If needed) | Cereals | Milk | Juice |
|-----------|------|--------------|-------------------|---------|------|-------|
| ... | Nitz | 2026-06-05, 2026-06-06 | 2026-06-12 | lucky-charms, capn-crunch | lactose-free | orange |

## Updating the Apps Script

After editing `apps-script.js`:

1. Paste new code in Apps Script editor
2. Save
3. **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**

Same URL will work with the new code.

## License

MIT
