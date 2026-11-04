# Platinum Marketing Agency: "The Platinum Thread"

The website for Platinum Marketing Agency, built for the Kenyan market. Each section is a shot in one continuous 3D scene, with a fast fallback for slow phones.

Built with Next.js, React Three Fiber, GSAP, Lenis and Tailwind CSS.

## Run it

You need Node.js 22 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

Add `?quality=lite`, `?quality=medium` or `?quality=high` to any address to pin a quality level for testing.

| Command | What it does |
|---|---|
| `npm run build` then `npm start` | Runs the production version |
| `npm run typecheck` | Checks the types |
| `npm run lint` | Checks code quality |
| `npm test` | Runs the unit tests |
| `npm run budget` | After a build, fails if a page's initial JavaScript is over 200KB gzipped |

## Deploy on Vercel

Pushing to `main` deploys to production automatically, with Vercel detecting Next.js and no extra build settings needed.

Set these in **Vercel > Project > Settings > Environment Variables**, then redeploy. `.env.example` lists them all.

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical links, share images, sitemap. Set it to the live address. |
| `SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET` | **Receiving leads.** Until these are set, the contact form tells visitors it could not send and offers WhatsApp. |
| `NEXT_PUBLIC_CALENDLY_URL` | The booking calendar. Without it, the page offers booking on WhatsApp. |
| `NEXT_PUBLIC_ANALYTICS` with `NEXT_PUBLIC_GA_ID` or `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Analytics. Off when empty. |
| `LEAD_DESTINATION=resend`, `RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM` | Optional: sending leads by email instead of to a Sheet. |

`NEXT_PUBLIC_` values are built into the site, so changing one needs a redeploy. Never put a key or secret in a file that gets committed, because this repository is public.

### Connect the lead form

1. Create a Google Sheet, open **Extensions > Apps Script**, and paste in `docs/sheets-webhook.gs`.
2. Change `SECRET` in the script to a long random value.
3. Choose **Deploy > New deployment > Web app**, with **Execute as: Me** and **Who has access: Anyone**.
4. Set `SHEETS_WEBHOOK_URL` to the web app address and `SHEETS_WEBHOOK_SECRET` to the same secret.
5. Send a test enquiry and check that a row appears.

## Edit copy and prices

Everything editable lives in `content/`.

| File | Holds |
|---|---|
| `content/site.ts` | Contact details, WhatsApp number, nav and footer links |
| `content/copy.ts` | Home page copy, service cards, industries, and the A/B hero tagline (`taglineVariant`) |
| `content/services.ts` | Automation stations and demo chats, AI Visibility steps, and demo dropdowns |
| `content/pricing.ts` | **Every price on the site.** The pages and the search data both read from here. |
| `content/faqs.ts` | FAQs. The search data updates with them. |
| `content/team.ts` | Team, story and values |
| `content/stats.ts` | Results numbers. `null` shows "X"; a number counts up. |
| `content/testimonials.ts` | Client testimonials |

Page descriptions and share text are in `lib/metadata.ts`. Section headlines are in `timeline/chapters.ts`, beside the shot they belong to.

## Tune the chapters

`timeline/chapters.ts` is the single source of truth. The scene and the page both read the same scroll value and sample these settings, so they stay in step. Each chapter sets:

| Setting | Controls |
|---|---|
| `span` | How long the shot lasts, in screen heights |
| `camera` | Position, target and field of view |
| `ride` | Extra camera points on the way to the next chapter |
| `lit` | How many of the 12 stones glow |
| `spread` | 0 pulls the stones into one boulder, 1 opens the full ring |
| `damage` | 1 scatters the stones, with flickering red cracks |
| `grade` | Background, fog and accent colour, and glow strength |
| `thread` | Which beams show, from `THREAD_WEIGHTS` in `scene/thread/threadPath.ts` |
| `core` | The stones' size and place on inner pages |

**After changing the scene or a shot, re-render the Lite stills** by following the steps at the top of `scripts/capture-posters.mjs`. Otherwise, Lite visitors see the old picture.

## How the quality levels work

| Level | Who gets it | What they see |
|---|---|---|
| High | Capable desktops | 12 stones and full effects |
| Medium | Good phones and unknown GPUs | 8 stones, lighter effects, resolution capped at 1.5x |
| Lite | Slow phones, Save-Data, reduced motion, no WebGL, a crashed scene or a low frame rate | Pre-rendered stills with the same content. No Three.js or GSAP is downloaded. |

The rules are in `lib/quality.ts`, with tests alongside. On any device, `document.documentElement.dataset.qualityReason` shows why a level was chosen.

## Swap in Blender models

The stones and worlds are currently generated in code, which keeps downloads small. To use your own models:

1. Export `.glb` files from Blender with Draco or Meshopt compression and KTX2 textures. Aim for under 300KB per model.
2. Put them in `public/models/`.
3. Load them with `useGLTF` from `@react-three/drei`, with the Draco and KTX2 decoders configured.
4. For the stones, replace `createRockGeometry` in `scene/core/rockGeometry.ts` with the model's geometry. `Core.tsx` keeps handling the movement and glow. Keep the geometry's vertex count low, and test `?quality=medium` on a real phone.
5. Inner-page worlds are in `scene/worlds/`. Each is one component that can be replaced.

This route has not been tested yet, because no models exist.

## Placeholders to replace before launch

Search the code for `PLACEHOLDER`.

**Must be replaced before real customers see the site:**

- [ ] Testimonials (`content/testimonials.ts`). Publishing invented reviews would mislead customers.
- [ ] Results numbers (`content/stats.ts`)
- [ ] WhatsApp number, phone and email (`content/site.ts`)
- [ ] Google Sheet connection, or leads cannot be received

**Also to supply:**

- [ ] Final domain (`.co.ke` or `.com`): `NEXT_PUBLIC_SITE_URL`
- [ ] Logo (`public/logo.svg` and `app/icon.svg`), and brand colour confirmation (`app/globals.css`)
- [ ] Calendly link
- [ ] Team photos and one-line bios (`content/team.ts`)
- [ ] Social profile links (`sameAs` in `content/site.ts`)
- [ ] Google Analytics ID or Plausible domain

**Known gaps:**

- The sound toggle saves a choice but plays nothing, because no audio file exists yet.
- The site has not been tested on a real Android phone.
- The chats on the 3D phone, some section headings, and the wording on the AI demo button are drafts to review.
