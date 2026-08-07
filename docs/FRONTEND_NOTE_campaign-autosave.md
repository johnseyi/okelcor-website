# Backend — Campaign autosave (and the real fix for the reported problem)

**From:** Backend · **To:** Frontend
**Date:** 2026-08-07
**Trigger:** Marketer report — leaving the Mail Campaign tab for the Media Library and
coming back loses everything composed.
**Status:** Backend built and tested. **Not yet deployed** — migration #29 pending.

---

## 1. What was actually wrong

Not a UI state bug. **There was no save.**

`POST /api/v1/admin/bulk-emails` creates the campaign *and immediately dispatches it* —
it is the send button. There was no update endpoint and no draft state anywhere, so
until a campaign was sent it existed only in browser memory. No amount of frontend
state handling was going to survive a navigation, because there was nowhere to put it.

That gap is now closed.

---

## 2. New endpoints

All under the existing `marketing.manage` permission — no new roles.

```
GET    /api/v1/admin/campaign-drafts          my drafts, light (no blocks payload)
GET    /api/v1/admin/campaign-drafts/latest   most recent — for "restore your work"
GET    /api/v1/admin/campaign-drafts/{id}
POST   /api/v1/admin/campaign-drafts          create once when the editor opens
PUT    /api/v1/admin/campaign-drafts/{id}     ← the autosave call
DELETE /api/v1/admin/campaign-drafts/{id}
```

Payload — every field optional:

```jsonc
{
  "name":      "Croatia launch",        // optional label for the restore list
  "subject":   "Summer tyre offer",
  "blocks":    [ /* editor blocks, max 200 */ ],
  "theme":     { "preset": "okelcor_dark" },
  "body_html": "…",                     // pasted-HTML authoring path
  "filters":   { "markets": ["germany"] }
}
```

Response `data` carries all of the above plus `id`, `label`, `block_count`, `is_empty`,
`updated_at`.

---

## 3. Four behaviours to build against

**Autosave accepts incomplete and invalid work.** Blocks are deliberately *not* run
through the block validator here. A half-built Button with no URL, no subject, no
filters — all save fine. Block rules still apply at `preview` and at send, where the
marketer can act on the error. **Do not pre-validate before autosaving**; that would
reintroduce exactly the problem, refusing to save at the moment it matters most.

**`PUT` is a full replace, not a merge.** An absent key means empty. Send the whole
editor document every time. (Under merge semantics, deleting the last block would be
impossible to express and the blocks would reappear on restore.)

**`/latest` returns `data: null` when there's nothing to restore** — 200, not 404. Also
returns `null` for a draft that is *entirely* empty, so opening the editor and
autosaving a blank canvas does not produce a "restore your work?" prompt that restores
nothing. That prompt has to mean something every time it appears, or she learns to
dismiss it.

**Send retires the draft.** `POST /admin/bulk-emails` now accepts an optional
`draft_id`. Pass the draft you composed from and it is deleted — but only *after* the
campaign is safely queued, so a failed send never destroys her only copy. An unknown id
is silently ignored rather than failing the request: the campaign did send, and a 422
about draft bookkeeping would tell her otherwise.

---

## 4. Suggested client wiring

1. Editor opens → `GET /campaign-drafts/latest`. If `data` is non-null, offer
   "Restore your unsaved campaign?" with the label and `updated_at`.
2. On first edit → `POST /campaign-drafts`, keep the returned `id` for the session.
3. **Debounce autosave to roughly 3–5 seconds of idle, plus on blur, plus on
   `visibilitychange`.** That last one is the one that fixes her actual complaint —
   it fires when the tab is hidden, i.e. exactly when she navigates away. Please do
   not autosave per keystroke; there is a 512KB body cap but no reason to approach it.
4. On successful send → include `draft_id` in the `POST /admin/bulk-emails` body.
5. "Start fresh" → `DELETE /campaign-drafts/{id}`. Deleting an already-gone draft
   returns 200, so a retry after a dropped connection is safe.

Drafts are **private to their author** and capped at 20 each, oldest pruned. Another
admin's draft id returns 404 (not 403 — a 403 would confirm it exists).

---

## 5. The higher-value half of this, which is yours

**Autosave is the safety net. The real fix is not making her leave the page.**

She went to the Media Library to get an image for the campaign. `GET /admin/media` and
`POST /admin/media` have existed since Session 51 — so an **in-place image picker
modal** (browse existing media, upload a new file, insert, never navigate) needs *zero*
backend work and removes the trigger entirely rather than recovering from it.

If you build only one of the two, build the picker. Autosave protects her from the
browser crashing, an accidental back button, and the session expiring; the picker means
the most common case never puts her at risk in the first place.

Worth checking while you're in there: does anything else in the campaign editor require
leaving the tab? Same fix applies.

---

## 6. Deploy

Migration **#29** creates one new table and touches nothing existing. The six draft
endpoints 500 until it runs; **the campaign editor and sending are unaffected**, since
neither has ever depended on drafts. So you can ship the client whenever — the autosave
calls will simply fail until the migration lands, and should be treated as
non-blocking (a failed autosave must never block typing or sending).

Please make autosave failures silent-but-visible: a small "not saved" indicator rather
than a modal or a blocked editor.

---

## 7. Frontend response (2026-08-07)

**The picker already existed** — `components/admin/media-picker-modal.tsx`, shipped
2026-07-30 with the block-based campaign builder, wired to every `image_url` block
field and to the HTML-mode TipTap image dialog. The residual trigger was narrower: it
could only **browse**. If the image wasn't already in the library she still had to
leave for `/admin/media` to upload it. Upload (button, drag-and-drop, empty-state
prompt) now lives in the modal, against the existing `POST /admin/media` — no backend
work, and it covers both authoring paths because both share the one modal.

Autosave is built to §3 and §4. Two deviations worth knowing about:

- **`POST` happens on first edit, not on open** (§4 step 2 rather than the §2 endpoint
  comment). Creating on open would manufacture empty drafts against the 20-per-author
  cap and push out real ones.
- **`theme` is written in the documented `{ preset }` form but read tolerantly** as
  either that or a bare string. The composer, the design schema and the send endpoint
  all use a bare preset key, so the two shapes coexist; a theme silently dropped on
  restore wouldn't surface until the send.

**Proxies map 404/405/500 alike to a 501 `draft_storage_unavailable`** so the composer
can go quiet before migration #29 instead of showing an error on a timer that she can't
act on. This over-reads a genuine 500 as "not deployed" — deliberate and time-boxed.
**Once #29 is applied, drop 500 from `isDraftStorageUnavailable()`**
(`lib/campaign-draft-proxy.ts`).

**Answering §5's last question — one thing still requires leaving the tab, and it needs
you.** The composer shows a recipient *count* but never *who*: to check the audience she
goes to `/admin/marketing-contacts` and re-applies the filters by hand. Deliberately not
built against the existing contacts list endpoint — that one takes a single `market`,
not `markets[]`, and the campaign recipient query matches *any* market, so a preview
built on it could confidently show a list that isn't who gets emailed. Wanted: a
`recipient-preview` returning a sample from the **same** query the send uses.
Everything else is in place (test send, starters and saved designs, merge tags, theme,
live preview, reopen/duplicate).
