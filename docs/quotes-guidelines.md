
Before building, read:
- docs/design-system.md
- docs/visual-references.md
- docs/page-guidelines.md
- docs/session-handoff.md
- docs/project-architecture.md
- docs/quotes-guides.md

Rules:
1. Do not redesign unrelated pages.
2. Follow the Tesla-inspired layout system already established in the project.
3. Use Okelcor brand styling, especially Okelcor orange for primary CTA states.
4. Keep the page premium, minimal, spacious, and corporate.
5. Build this as a real page, not a mailto link and not an email-app redirect.
6. Make the implementation production-ready in structure, even if backend submission is mocked for now.

Task:
Create a dedicated Quote page and all required components.

Create:
- app/quote/page.tsx
- components/quote/quote-hero.tsx
- components/quote/quote-form.tsx
- components/quote/quote-summary.tsx
- components/quote/quote-success.tsx

Main Goal:
Users should be able to request a quotation directly on the site by filling a form.
The form should feel trustworthy and business-oriented.

Page Structure:
1. Navbar
2. Quote Hero
3. Main two-column quote section
   - Left: Quote form
   - Right: Quote information / summary / reassurance panel
4. FAQ or trust strip
5. Footer

Design Direction:
- White / soft grey background
- Black / charcoal text
- Okelcor orange for primary buttons and accents
- Rounded panels around 22px
- Strong spacing
- Tesla-like clean composition
- Subtle Framer Motion reveal animations only where appropriate

Quote Hero Content:
Eyebrow: Quote Request
Title: Request a Tyre Supply Quote
Subtitle: Tell us what you need and our team will prepare a tailored quotation for your business.

Form Requirements:
Build a proper form with these fields:

Business / Customer Information
- Full Name *
- Company Name
- Email Address *
- Phone Number
- Country / Region *
- Business Type
  Options:
  - Wholesaler
  - Distributor
  - Retailer
  - Fleet Operator
  - Individual Buyer
  - Other

Product Request Information
- Tyre Category *
  Options:
  - PCR Tyres
  - TBR Tyres
  - Used Tyres
  - Mixed Request
- Brand Preference
- Tyre Size / Specification
- Quantity Needed *
- Budget Range
- Preferred Delivery Location *
- Required Delivery Timeline
- Additional Notes / Inquiry *

Optional upload-ready section:
- Add a disabled or placeholder file-upload UI for "Upload product list / specification sheet"
Do not implement backend upload unless needed, but design the component so it can be connected later.

Behavior Requirements:
1. Validate required fields.
2. Show inline validation messages.
3. Do not use alert() for errors.
4. On submit, simulate a successful submission with a loading state and success state.
5. After successful submission, show an in-page success panel instead of redirecting away.
6. The success state should say something like:
   "Your quote request has been received. Our team will review your request and contact you shortly."
7. Include a button to submit another request.

Right Column / Quote Summary Panel:
Create a premium informational panel on the right side that explains:
- What happens after submission
- Fast response time
- Tailored pricing
- Global logistics support
- Trusted sourcing
- Optional contact fallback

Suggested blocks:
- What happens next
- Why request a quote from Okelcor
- Contact Information

Include business contact details in this panel:
- Email: info@okelcor.de
- Phone: +49 (0) 89 / 545 583 60
- Location: Munich, Germany

Trust / FAQ Strip:
Below the form section, add 3 short trust blocks such as:
- Tailored Wholesale Pricing
- Global Delivery Support
- Dedicated Sales Assistance

Optional FAQ section with 3–4 simple questions:
- How long does it take to receive a quote?
- Can I request multiple tyre types?
- Do you support international delivery?
- Can I request used and new tyres together?

Technical Requirements:
- Use TypeScript
- Use functional React components
- Use Tailwind CSS
- Use Framer Motion subtly
- Keep components modular
- Preserve current architecture
- Keep the page responsive from mobile to desktop
- Use controlled form state
- Organize form config cleanly if needed

Routing / Integration:
- Add the Quote page in a way that can later be linked from:
  - homepage CTA buttons
  - product pages
  - floating utility bar
- For now, do not change unrelated routes unless necessary.
- If needed, add a Quote link in the navbar only if it fits the current nav structure cleanly; otherwise leave navigation unchanged and just build the page.

Submission Logic:
For now, implement frontend-only submission using local component state.
Do NOT use mailto.
Do NOT open external email apps.
Do NOT fake submission with plain static text only.
The page must behave like a real quote-request workflow.

Output format:
1. Brief implementation plan
2. List of files to create/update
3. Then build the page components
4. Keep code clean and production-oriented