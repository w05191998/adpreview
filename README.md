# Meta Ad Preview Builder

This project is a lightweight website where a client can:

- enter Meta ad copy (primary text, headline, description, CTA, URL)
- upload creatives (single image, single video, or carousel images)
- preview how the ad can look in feed and story placements

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown in terminal (usually `http://localhost:5173`).

## Scripts

- `npm run dev` - start local development server
- `npm run lint` - run ESLint
- `npm run build` - create production build

## Current scope

This MVP is client-side only:

- media is previewed in browser (not uploaded to a backend storage yet)
- previews are visual approximations for review workflow

## Suggested next improvements

- add authentication so each client sees only their projects
- save ad drafts to a database
- upload assets to cloud storage (S3, Cloudinary, etc.)
- generate shareable preview links
- add more Meta placements and safe-area guides
