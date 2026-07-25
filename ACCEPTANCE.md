# Acceptance criteria & tests

Checklist for verifying Balance Nutrition Track after build/deploy.

## Acceptance criteria

### Auth

- [ ] New user can sign up with email + password and land on Home
- [ ] Existing user can sign in and see only their own data
- [ ] Signed-out visitor cannot open Home / log meals (redirected to auth)
- [ ] Sign out returns user to auth and clears the session

### Meal logging

- [ ] User can submit loose text (e.g. `croissant`, `rice and chicken`) from a mobile-width viewport
- [ ] Empty / whitespace-only submit is rejected with a clear message (no API call)
- [ ] Successful log shows the meal in "This week" with original text (or short AI summary) and a per-meal health score
- [ ] After logging, Today / Weekly / Overall scores refresh without a full page reload failure
- [ ] Gemini API key is never exposed to the browser (Network tab: no `GEMINI_API_KEY`)

### Scores (80/20)

- [ ] **Today** = average of today's meal scores; shows **—** when no meals today
- [ ] **Weekly** = average of meals in the last 7 rolling days; **—** if none
- [ ] **Overall** = average of meals since last overall reset; **—** if none in that window
- [ ] Logging a clearly healthier meal (e.g. `grilled chicken salad`) tends to score higher than a sugary/processed one (e.g. `croissant` / `candy bar`)
- [ ] Today score uses color cue: green ≥ 80, amber 60–79, muted red < 60
- [ ] UI frames the goal as aiming for **80%+** balance (not calorie counting)

### Categories and tips

- [ ] Home shows relative estimates for carbs, protein, fats, fiber, sugar, vitamins (not grams / not calories)
- [ ] When weekly averages suggest a gap, tips are soft "Add more …" lines only (no recipe lists)
- [ ] Tips appear only when there is enough signal (e.g. after some meals); empty/new account does not spam tips

### Week log

- [ ] Log lists meals from the last 7 days, newest first
- [ ] Each row shows enough to recognize the meal (text/summary) and its health score
- [ ] Meals older than 7 days do not appear in the week log (may still affect Overall if after reset)

### Overall reset

- [ ] Settings (or equivalent) offers **Reset overall score** with a confirm step
- [ ] Confirming reset updates Overall to **—** (or only new meals) without deleting meal history from the week log
- [ ] New meals after reset correctly rebuild Overall from the new window only

### Multi-user isolation

- [ ] User A's meals never appear for User B
- [ ] User B's scores are independent of User A

### Deploy / ops

- [ ] App loads on the Vercel production URL on phone and desktop browser
- [ ] Auth redirects work with the production URL allow-listed in Supabase
- [ ] Missing/invalid Gemini key fails gracefully with a user-visible error (meal not silently "saved" with fake scores)

### Explicitly not required for v1

- Exact calorie counting, barcodes, recipes, weight tracking, native app store builds

## Manual test script

Run against local or Vercel. Prefer phone or DevTools mobile width.

### T1 — Auth happy path

1. Sign up as `test-a@example.com` (or your email).
2. Confirm you reach Home with Today/Weekly/Overall all **—** (or empty state).
3. Sign out → sign in again → still empty, no errors.

### T2 — Log unhealthy vs healthy

1. Log `croissant`. Note meal score (expect roughly mid/low).
2. Log `grilled chicken with rice and vegetables`. Note higher score than croissant.
3. Confirm both appear in This week; Today equals the average of the two meal scores (within rounding).

### T3 — Score windows

1. Note Today, Weekly, Overall after 2+ meals — all should match the same average if all meals are today and after any reset.
2. (Optional) In Supabase, temporarily set an older meal's `logged_at` to 8 days ago: it must leave the week log and Weekly average, but stay in Overall if after `overall_reset_at`.

### T4 — Tips

1. Log several low-protein / high-sugar style meals (e.g. `soda and candy`, `pastry`).
2. Confirm soft tips such as "Add more protein" / related gaps appear (wording may vary).
3. Do not expect calorie numbers or recipe suggestions.

### T5 — Overall reset

1. With meals present and Overall > —, open reset, cancel once (nothing changes).
2. Confirm reset: Overall becomes **—** or only reflects post-reset meals; week log still shows recent meals.
3. Log one new meal: Overall equals that meal's score.

### T6 — Second user

1. Sign up / sign in as User B.
2. Home has no User A meals; logging for B does not change A's data when you switch back.

### T7 — Failure cases

1. Submit empty meal → validation error, no new log row.
2. (Optional) Break `GEMINI_API_KEY` in env → log attempt shows error; no bogus scored meal.

### T8 — Production smoke

1. Open Vercel URL on a phone.
2. Sign in, log one meal, confirm scores + log update.
3. Hard-refresh; data persists (Supabase).

## Automated tests

Run with:

```bash
npm test
```

Covered in unit tests:

- Average helpers for Today / Weekly / Overall given sample meals + `overall_reset_at`
- Tip rules given category averages (e.g. low fiber → "Add more fiber")
- Reject empty meal input

AI/Gemini calls are **not** asserted in CI (flaky / key-dependent); covered by manual T2–T4 / T7.
