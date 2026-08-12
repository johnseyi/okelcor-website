# Backend note — the imported design can't match its source, and it's a block-vocabulary gap

**Frontend → backend. Session 78. No frontend change can address this one.**

Reference: `email marketing image template.jpg` — the Fuel Eco Tech deck as the marketers
intend it to look. **Sent to the backend team directly rather than committed here**, so it is
not in this repo; ask for it if this note reaches you without it.

The import currently produces the right **content** in the right **order** and the wrong
**layout**.

---

## The specific complaint

> "The images are not in the layout they are supposed to be."

Correct. In the source, three industry photographs (agriculture/construction, cars, marine)
sit **side by side in one row**. After import they are stacked vertically, one per screen.

That is not an importer bug. `CampaignBlockRenderer::BLOCKS` is:

```
heading · text · image · button · list · divider · spacer · footer
```

Every one is a single, full-width, vertically-stacked element. **There is no block that can
put two things beside each other.** Three photos in a row is not expressible, so the
importer emitting three `image` blocks is the only correct thing it could have done.

The same gap explains the rest of the mismatch, so here is the whole design mapped against
what exists:

| In the source design | Renderer block today | Verdict |
|---|---|---|
| Dark hero band: smoky photo, product bottle, OKELCOR wordmark, gold headline, subtitle | `image` + `heading` + `text`, stacked | **Not possible** — no text-over-image, and no way to compose the band |
| Green pill header, inset: "INTRODUCING FUEL ECO TECH (FET)" | `heading` (align/level only) | **Not possible** — `heading` has no background colour |
| Full-bleed green bars: "BENEFITS OF…", "…DESIGNED FOR" | `heading` | **Not possible** — same reason |
| Body paragraphs with **bold** inline runs | `text` | ✅ Works today |
| 12 benefit cards, 3 across: grey panel, green check circle, bold title, small caption | — | **Not possible** — no card block, no columns |
| Three photographs in one row | 3 × `image` | **Not possible** — stacks (this is the report) |
| Bulleted list with bold lead-ins ("**Marine** – Boats, ships…") | `list` | ⚠️ Works if inline markdown is applied to list items — please confirm |
| FET green palette | `okelcor_dark` / `light` (both teal + gold) | **No green preset exists** |

---

## What we're asking for

Four blocks. Listed in the order that buys the most fidelity per unit of work — **(1) alone
fixes the reported complaint.**

### 1. `image_row` — the actual fix for this report

Two or three images side by side, stacking on mobile.

**Recommended field shape, because it needs nothing new from us:**

```php
'image_row' => ['fields' => [
    'image_1' => ['type' => 'image_url', 'required' => true],
    'image_2' => ['type' => 'image_url', 'required' => true],
    'image_3' => ['type' => 'image_url'],          // optional → 2-up or 3-up
    'alt_1' / 'alt_2' / 'alt_3' => ['type' => 'text'],
]],
```

Fixed slots rather than a list, deliberately: `image_url` is a field type our editor already
renders **with the Media Library picker attached**, so this block appears in the composer
the moment you deploy it, with **zero frontend work and no frontend deploy**. See "How
our editor picks these up" below.

### 2. `section_header` — the green bands

Text on a coloured band. Three appear in this one deck.

```php
'section_header' => ['fields' => [
    'text'  => ['type' => 'text', 'required' => true, 'max' => 200],
    'style' => ['type' => 'select', 'options' => ['full_bleed', 'inset_pill'], 'default' => 'full_bleed'],
    'tone'  => ['type' => 'select', 'options' => ['accent', 'dark', 'muted'], 'default' => 'accent'],
]],
```

**Named tones, not a colour picker.** It keeps the colour decision in the theme where it
belongs — the same reasoning that kept per-colour overrides out of the composer UI — and it
avoids a `color` field type we'd have to build. The importer can infer `tone: accent` from
the band colour it recovers.

### 3. `cards` — the 12 benefit tiles

This is the expensive one and the only one with a frontend cost. Two ways:

**(a) Fixed slots — no frontend work, ships immediately.** A `card_row` of three:

```php
'card_row' => ['fields' => [
    'title_1' => text, 'body_1' => text, 'title_2' => text, 'body_2' => text,
    'title_3' => text, 'body_3' => text,
    'icon'    => ['type' => 'select', 'options' => ['check', 'none'], 'default' => 'check'],
]],
```

The deck becomes four `card_row` blocks. Editing is clunky (18 inputs across four blocks)
but it renders correctly today and needs nothing from us.

**(b) A repeating group — the right primitive, needs one frontend field renderer.** A
`group_list` field type: a list whose items are objects with declared sub-fields.

```php
'cards' => ['fields' => [
    'columns' => ['type' => 'select', 'options' => ['2', '3'], 'default' => '3'],
    'items'   => ['type' => 'group_list', 'max_items' => 24, 'item_fields' => [
        'title' => ['type' => 'text', 'required' => true, 'max' => 120],
        'body'  => ['type' => 'text', 'max' => 240],
    ]],
]],
```

**We would build the `group_list` renderer** — `block-field.tsx` currently handles eight
field types and this would be the ninth. Tell us the exact JSON shape of `item_fields` and
of a stored item and we'll do it. It's also reusable well beyond this deck.

**Our recommendation: (b).** (a) is a workaround that a marketer will find unpleasant every
time; the deck has twelve tiles and future decks will have more.

### 4. `fet_green` theme preset

Both existing presets are teal + gold. This deck is a green product line, and FET has been a
separate design system since it shipped — `CLAUDE.md` documents its palette as accent
`#22c55e`, dark `#0d2b1a`, and specifically forbids Okelcor orange in FET UI. The deck's
green reads closer to `#2E8B57`; your call which is canonical, but it should be a **named
preset**, not per-campaign overrides, so the next FET campaign starts correct.

---

## Requirements that apply to any multi-column block

- **Tables, not flex/grid.** Outlook uses Word's engine; `display:flex` and CSS grid do not
  apply. Nested `<table role="presentation">` with fixed `width=` attributes.
- **Must stack on mobile.** At `card_width: 620`, three columns is ~190px each — usable on
  desktop, unreadable on a phone. Hybrid/fluid columns, or a media query with an
  Outlook-safe fallback.
- **`card_width` may need to go beyond 620.** `resolveTheme()` already allows up to 800; the
  source deck is 1093px wide. 620 is defensible for email, but three-column rows will feel
  cramped — worth a look once `image_row` exists.

---

## How our editor picks these up (and when it doesn't)

The composer is **generated** from `GET /admin/campaign-design`, so **a new block type
appears in the editor by itself, with no frontend deploy** — provided its fields use field
types we already render:

```
text · textarea · select · number · url · image_url · text_list · link_list
```

That is why blocks 1, 2 and 3(a) cost us nothing, and 3(b) costs one field renderer.

A block type we don't recognise is **not** silently mangled — it renders a "can't edit this
here, it will still send" notice, so nothing is destroyed if you ship ahead of us.

---

## What still won't match, whatever we build

Worth stating so nobody chases it:

- **The hero band.** Text over a full-bleed photograph has no email equivalent. If you want
  it pixel-accurate, the honest route is for the importer to flatten that region into **one
  image** and emit a single `image` block with strong `alt` text. That reproduces it exactly
  and costs the usual price: nothing for recipients who block images, and no selectable
  text. Our recommendation is to do that **for the hero band only**, never for body copy.
- **The typeface.** The deck is set in a geometric sans; email falls back to Arial.
  Unfixable without webfont support Outlook doesn't have.
- **Exact leading, letter-spacing, and the vertical rule beside the headline.**

Which is the same point your own note makes, and the reason our import screen says "Design
imported — review it before sending" rather than claiming a conversion. The four blocks
above move it from *recognisably the same content* to *recognisably the same design*, which
is the achievable target.

---

## Priority, if you only take one

**`image_row`.** It is the reported complaint, it is the smallest of the four, and it needs
nothing from us. `section_header` is a close second — three of them appear in this single
deck, and green bands are most of what makes the design read as designed.
