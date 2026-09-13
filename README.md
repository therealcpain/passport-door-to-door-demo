# Passport Door-to-Door Reality

**Paste (1) application submit/mail date, (2) service: routine / expedited, (3) optional trip date, (4) view date → one shareable card:**  
giant **earliest → latest door-to-door mailbox arrival window** (processing + up to **2 weeks inbound mail** + up to **2 weeks return mail**) · **published processing times do not include mailing** chip · **urgent travel** (≥ international travel within **14 calendar days** → agency appointment) strip · optional trip-date conflict chip (**Likely / Tight / Unlikely** — literacy only) · calm **travel.state.gov** processing-times + **passportstatus.state.gov** pointer.

Brand on the surface: **Passport Door-to-Door Reality** only.

**Ranges only — not a delivery guarantee.** User-pasted dates only — never ask for a passport number; zero passportstatus scrape. Never invent personal status or guarantee a date. **Hard-avoid** paid expediter affiliates — travel.state.gov + passportstatus.state.gov only. **No Gumroad.**

## Hypothesis

Travelers book flights against the **published** 4–6 week (or 2–3 week) number and then discover mailing legs. Flip that fog into a **door-to-door-honest share card** — without scraping status or selling a $300 expediter. Success = “paste your mail date — will it arrive before Dec 20?” family-chat shares ahead of holiday peaks.

## How to test (local)

```bash
cd kb/mde/passport-door-to-door
npm run build          # copies assets → dist/
npm run verify         # window math + trip chips + brand-clean
# either open the file:
open index.html        # or dist/index.html
# or serve:
npm start              # http://localhost:4249
```

Manual checklist:

1. Open the page → click **Aug 20 routine · Dec trip** → giant **Sep 17, 2026 → Oct 29, 2026** · Trip **Likely**.
2. Click **Aug 20 expedited** → **Sep 3 → Oct 8** window.
3. Click **Tight trip · Oct 15** → Trip **Tight**.
4. Click **Empty / missing dates** → honest miss.
5. Click **View mid-process · Sep 13** → window + view marker on timeline.
6. Paste your own dates → **Show door-to-door window**.
7. **Copy summary** → clipboard has window + mail chip + cites + disclaimer.
8. **Share link** → `#p=` restores the card.
9. **Export PNG** → dark card with giant earliest→latest + disclaimer on the face (not color-only).
10. Surface brand is **Passport Door-to-Door Reality** only (no Conglomerate / personal names).

### GitHub Pages

This folder is static-ready. Point Pages at `/` of a dedicated repo (or `/docs` after copying `dist/`), with `index.html` at the site root. Relative paths (`styles.css`, `app.js`) work on project pages.

```bash
npm run build   # optional artifact in dist/
```

Do **not** create the public repo or post from this build step — Steward handles Pages + distro. Distro stays product-linked only (e.g. r/Passports, r/travel ahead of holiday peaks). **No sock accounts.** No “State Dept is broken” farms. No paid-expediter affiliate hard-sell on share PNG.

## Seed cohort (MVP)

Labeled teaching dates — not live status scrapes. Never invent personal passport status.

| Chip | Inputs | Teaching point |
|------|--------|----------------|
| Aug 20 routine · Dec trip | submit 2026-08-20 · routine · trip 2026-12-20 · view 2026-09-13 | Sep 17 → Oct 29 · Likely vs Dec |
| Aug 20 expedited | submit 2026-08-20 · expedited · view 2026-09-13 | Sep 3 → Oct 8 door-to-door |
| Tight trip · Oct 15 | Aug 20 routine · trip 2026-10-15 | Trip inside window → Tight |
| Empty / missing dates | blank submit | Honest miss |
| View mid-process · Sep 13 | Aug 20 routine · view 2026-09-13 | Timeline marker mid-window path |

## Door-to-door math (assumptions)

| Rule | Framing |
|------|---------|
| Routine processing | **4–6 weeks** (travel.state.gov) |
| Expedited processing | **2–3 weeks** (travel.state.gov) |
| Week → days | **7 calendar days** per week |
| Earliest | `submitDate + minProcessingWeeks × 7` (optimistic processing min; mail may overlap) |
| Latest | `submitDate + maxProcessingWeeks × 7 + 14 + 14` (max processing + up to 2w inbound + up to 2w return) |
| Processing-only (shown) | `submit + minProc` → `submit + maxProc` |
| Door-to-door (shown) | earliest → latest including up to 2+2 weeks mail |
| Mail chip | Published processing times do **not** include mailing |
| Trip Likely | trip on/after latest |
| Trip Tight | trip between earliest and latest |
| Trip Unlikely | trip before earliest |
| Urgent | international travel within **14 calendar days** of view → agency appointment strip |
| Empty submit/view | honest miss — no invented window |
| Pointers | travel.state.gov processing-time · get-fast (**May 12 2026**) · passportstatus.state.gov |
| Press (literacy) | TheTravel door-to-door explainers — not invented backlog claims |

## Ads pathway (ad-only free utility — do not spend yet)

| Path | Notes |
|------|--------|
| **Revenue (primary)** | **AdSense / display under the card + “why passport ‘processing time’ is not door-to-door time” explainer** (not inside the PNG). Inventory spikes before Thanksgiving / winter-break booking weeks. Justified when sessions cover hosting. Free card forever — **no paywall**, no Gumroad. |
| **Brand-safe** | Informational timing literacy from public travel.state.gov cites. **Ranges only — not a delivery guarantee.** Ads **not** inside PNG. **Hard-avoid** third-party expediter affiliates. travel.state.gov + passportstatus.state.gov only. |
| **Acquisition (gated)** | Google “passport processing time vs mailing 2026” / “how long passport door to door” + Reddit Passports promo. Creative = “Paste your apply date — earliest/latest mailbox window?”. Max CPA abort ~$0.30–0.50 without a completed share. Debit/cash only. **Spend only after one organic Passports-thread test.** |
| **UTM** | Example: `?utm_source=reddit&utm_medium=organic&utm_campaign=passport_door_to_door_mvp` |
| **Tracking** | Card gens + share clicks (GoatCounter path when Pages is live). |
| **Abort sketch** | Pause paid if CPA exceeds band without share / “mailbox window” replies. |

**No spend from this ready_for_pages step.** Ads are the monetization path (**ad-only OK**).

## Product constraints

- Single static site (no backend).
- **Dates only from user paste** (or labeled seeds). Never invent personal status, guarantee a date, or scrape passportstatus.
- Brand: **Passport Door-to-Door Reality** only on surface.
- Status text-labeled (not color-only). Disclaimer always visible on page + share PNG.
- Share = URL hash + PNG + copy summary.
- No passport number field. No paid expediter affiliates. No Gumroad. No sock farms.
- Distinct JTBD from Gate Rights / Bag Delay / 511(b) amenity / Travel Tip Fee.

## Files

| Path | Role |
|------|------|
| `index.html` | App shell (GitHub Pages entry) |
| `app.js` | Window math, trip chips, urgent strip, seeds, card, share hash, PNG |
| `styles.css` | Passport Door-to-Door Reality UI |
| `scripts/build.js` | `npm run build` → `dist/` |
| `scripts/verify.js` | `npm run verify` — math + outs |
| `package.json` | build / start / preview / verify scripts |

## Opportunity

Internal card: `opp_travel_passport_door_to_door` (travel / civic documents).  
Experiment stub: `institutions/mde/experiments/exp_passport_door_to_door.md`.
