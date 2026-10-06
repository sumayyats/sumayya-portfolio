import type { CaseStudy, ExternalBook } from "./types";

/**
 * All copy in the `summary`, `sections[].body`, `role`, `team`, `scope`, `alt`
 * and `caption` fields is taken verbatim (or assembled only from the author's
 * own phrases) from portfolio-case-studies.md. Do not rephrase or invent copy.
 *
 * Image `src` paths point at /public/images/<slug>/. A figure with no `width`
 * or `frames` has no export yet and renders as a marked placeholder.
 */

export const caseStudies: CaseStudy[] = [
  // ─────────────────────────────────────────────────────────────── ASTA ──
  {
    slug: "asta",
    logo: "/images/asta/logo.png",
    mark: "/images/asta/mark.png",
    title: "ASTA",
    subtitle: "Redesigning a school's online registration",
    year: "2023",
    role: "UX and UI designer",
    roleDetail: [
      "Information architecture",
      "Sketches",
      "Design system",
      "High-fidelity designs for the public site and the parent dashboard",
    ],
    team: "Delivered through new line.lab, my design studio. Maurits Hudaibi (developer).",
    scope: "Website, registration flows and dashboard",
    scopeDetail: [
      "The whole website",
      "The registration flows (regular, internal and transfer students)",
      "A new logged-in dashboard for parents",
    ],
    meta: "Client project via new line.lab · 2023 · Website (desktop and mobile)",
    summary:
      "The online admissions website (PPDB) for Asy-Syukriyyah Islamic School in Tangerang, Indonesia. Parents use it to choose one of the school's eight units, from kindergarten to senior high, and to register their child.",
    teaser: "Before and after, with measured impact.",
    featured: true,
    link: { label: "See the live site", href: "https://ppdb.asy-syukriyyah.sch.id/" },
    palette: {
      spine: "#1E4A37",
      paper: "#F4F1E8",
      ink: "#20261D",
      accent: "#6FA46B",
      darkPaper: "#10150F",
      darkInk: "#ECE8DD",
      darkAccent: "#8FC08A",
    },
    cover: {
      image: "/images/asta/cover.png",
      mockup: "/images/asta/cover-mockup.png",
      kicker: "before // after",
    },
    sections: [
      {
        id: "overview",
        title: "Overview",
        media: "motion",
        motionStageId: "asta-overview",
        body: `**What it is:** The online admissions website (PPDB) for Asy-Syukriyyah Islamic School in Tangerang, Indonesia. Parents use it to choose one of the school's eight units, from kindergarten to senior high, and to register their child.
`,
      },
      {
        id: "impact",
        title: "Impact",
        media: "motion",
        motionStageId: "asta-impact",
        body: `> **~700 families** registered through the new site in the last intake.
> **~97%** of them completed registration **without help** from school staff.
>
> *Figures reported by the school's IT team.*`,
      },
      {
        id: "challenge",
        title: "The challenge",
        media: "none",
        body: `The old site worked, but it made parents do the work. The school's own feedback was clear: **it looked old, and requirements were hard to find because the pages were text-heavy with no icons.**

- **Text-heavy:** the homepage explained the whole process in dense paragraphs. Parents had to read all of it to find which of three registration types applied to them.
- **Process hidden in an image:** the 8-step registration journey was a small infographic that parents had to click to zoom.
- **Dated look:** it looked like a generic template, not the face of a school that parents were about to trust with their child.
- **No sense of progress:** after submitting the form, parents had no clear view of what was done and what came next (documents, payment, entrance test, results).

For many families, this site is their first real contact with the school. Every parent who gets stuck turns into a phone call or WhatsApp message to admissions staff.

**Goals agreed with the client:**

1. Make admissions information easy to find
2. Make the application process smoother
3. Let parents track where they are in the process
4. Help parents find the right programme quickly`,
      },
      {
        id: "process",
        title: "Process",
        media: "motion",
        motionStageId: "asta-process",
        body: `**1. Understanding the landscape.** I compared six Indonesian school admissions sites (including Sekolah Kak Seto, SIT Nurul Fikri and Jakarta Intercultural School). I noted what felt familiar to parents and what created friction.

**2. Restructuring the information.** I split the product into two parts with separate information architectures:

- **Public site:** Home → Our programmes → Registration flow → About → Contact → Login
- **Parent dashboard:** Overview → Profile → Payment information → Document downloads

**3. Sketching.** Low-fidelity sketches of the homepage sections and the dashboard layout, to settle structure before any visual design.

**4. Design system.** I built a small system so the developer could implement the pages consistently: a green colour scale taken from the school's identity, TT Commons for type, and form fields, buttons, cards, navigation and sidebar components with all their states.

**5. High-fidelity design and handover.** I designed the full set of pages and states (form errors, login errors, uploads, success screens) and handed them to the developer in Figma.`,
      },
      {
        id: "decisions",
        title: "Key design decisions",
        media: "motion",
        motionStageId: "asta-decisions",
        body: `| Problem | Decision |
|---|---|
| Paragraphs of instructions | Replaced them with **programme cards** (one per school unit) and **numbered step graphics** for the regular (8 steps) and internal (6 steps) routes |
| Requirements buried in text, with no icons to guide the eye | A **programme detail page** that groups requirements into scannable cards, each with its own icon (general, documents, entrance test), with registration options, WhatsApp contact and the brochure in a side panel |
| Parents unsure what to do after submitting | A **success page** that lists the payment steps and unit codes straight away |
| No visibility of progress | A **dashboard overview** with an 8-step progress checklist and a single "complete your personal data now" call to action |
| Long forms that are tiring to complete | **Accordion sections** in the profile (personal data, periodic data, family card, parent data), so parents fill one part at a time |
| Admissions staff answering the same questions | Payment guides and downloadable documents (form, candidate card, MoU) available from the dashboard |`,
      },
      {
        id: "constraints",
        title: "Constraints and trade-offs",
        media: "none",
        body: `- **No user testing.** This was a freelance project with a design-only brief, so I didn't test with parents. I relied on the comparative review, the client's requirements, and established patterns parents would recognise from other school sites.
- **Design handover, not build.** Implementation sat with the developer. My deliverable was a complete set of screens and components that left as little as possible to interpretation.
- **No "before" numbers.** The school didn't track registrations or support requests before launch. The "before" side of this story is their qualitative feedback (dated, confusing, text-heavy), and the impact figures show how the new site performs now.`,
      },
      {
        id: "learned",
        title: "What I learned",
        media: "none",
        body: `- **Structure beats styling.** The biggest improvement came from reorganising information (cards, steps, a progress checklist), not from the new visual style.
- **Plan measurement before launch.** Now I'd agree baseline metrics with the client before launch (registrations, support calls, completion without help) so the change can be measured, not only the outcome.
- **Test even when the brief doesn't ask for it.** Next time I'd push for a few quick sessions with parents, even informal ones, before handover.`,
      },
    ],
    visuals: [
      {
        id: "asta-hero",
        title: "The new site",
        src: "/images/asta/cover-mockup.png",
        width: 2000,
        height: 1095,
        sectionId: "overview",
        alt: "The redesigned admissions homepage on a laptop and a phone.",
        caption: "The redesigned admissions site on desktop and mobile.",
        shape: "wide",
      },
      {
        id: "asta-old-new",
        title: "Old and new homepage",
        src: "/images/asta/before-homepage.png",
        sectionId: "overview",
        alt: "The old admissions homepage, dense with paragraphs, beside the full redesigned homepage with programme cards and numbered step graphics.",
        caption: "Before and after: the old homepage and the new one.",
        shape: "wide",
        frames: [
          { src: "/images/asta/before-homepage.png", width: 2000, height: 1244, label: "Before" },
          { src: "/images/asta/homepage.png", width: 512, height: 2000, label: "After" },
        ],
      },
      {
        id: "asta-before",
        title: "The old homepage",
        src: "/images/asta/before-homepage.png",
        width: 2000,
        height: 1244,
        sectionId: "challenge",
        alt: "The old Asy-Syukriyyah admissions homepage before the redesign.",
        caption: "Before: the old homepage explained the whole process in dense paragraphs.",
        shape: "wide",
      },
      {
        id: "asta-ia",
        title: "Information architecture",
        src: "/images/asta/information-architecture.png",
        width: 1920,
        height: 1890,
        sectionId: "process",
        alt: "Information architecture splitting the public site and the parent dashboard.",
        caption: "Information architecture for the public site and parent dashboard.",
        shape: "wide",
      },
      {
        id: "asta-sketches",
        title: "Sketches",
        src: "/images/asta/sketches.png",
        width: 1920,
        height: 998,
        sectionId: "process",
        alt: "Low-fidelity sketches of the homepage sections and dashboard layout.",
        caption: "Low-fidelity sketches settling structure before visual design.",
        shape: "wide",
      },
      {
        id: "asta-system",
        title: "Design system",
        src: "/images/asta/system/components.png",
        sectionId: "process",
        alt: "The ASTA design system: colour scale, type and components.",
        caption: "The design system handed to the developer.",
        shape: "wide",
        frames: [
          { src: "/images/asta/system/components.png", width: 1920, height: 998, label: "Components" },
          { src: "/images/asta/system/colours.png", width: 2080, height: 1383, label: "Colour scales" },
          { src: "/images/asta/system/typography.png", width: 799, height: 1942, label: "Typography" },
        ],
      },
      {
        id: "asta-homepage",
        title: "The new homepage",
        src: "/images/asta/homepage.png",
        width: 512,
        height: 2000,
        sectionId: "decisions",
        alt: "The full redesigned homepage.",
        caption: "The new homepage, with programme cards and numbered step graphics.",
        shape: "wide",
      },
      {
        id: "asta-homepage-video",
        title: "The homepage in use",
        src: "/images/asta/homepage-walkthrough-poster.png",
        sectionId: "decisions",
        alt: "Screen recording scrolling through the live homepage.",
        caption: "Screen recording of the live site.",
        shape: "wide",
        video: {
          src: "/images/asta/homepage-walkthrough.mp4",
          poster: "/images/asta/homepage-walkthrough-poster.png",
          width: 960,
          height: 560,
        },
      },
      {
        id: "asta-programme",
        title: "Programme detail page",
        src: "/images/asta/programme-detail.png",
        width: 1848,
        height: 1628,
        sectionId: "decisions",
        alt: "The programme detail page grouping requirements into scannable cards with icons.",
        caption: "Programme detail page: requirements grouped into scannable cards, each with its own icon.",
        shape: "wide",
      },
      {
        id: "asta-programme-video",
        title: "The programme page in use",
        src: "/images/asta/programme-walkthrough-poster.png",
        sectionId: "decisions",
        alt: "Screen recording scrolling through a live programme page.",
        caption: "Screen recording of the live site.",
        shape: "wide",
        video: {
          src: "/images/asta/programme-walkthrough.mp4",
          poster: "/images/asta/programme-walkthrough-poster.png",
          width: 960,
          height: 560,
        },
      },
      {
        id: "asta-form-success",
        title: "Registration and success",
        src: "/images/asta/form.png",
        sectionId: "decisions",
        alt: "The registration form and its success page.",
        caption: "Registration form and the success page listing payment steps and unit codes.",
        shape: "wide",
        frames: [
          { src: "/images/asta/form.png", width: 1474, height: 1053, label: "Registration form" },
          { src: "/images/asta/success.png", width: 1473, height: 1052, label: "Success page" },
        ],
      },
      {
        id: "asta-dashboard",
        title: "Login and dashboard",
        src: "/images/asta/dashboard.png",
        sectionId: "decisions",
        alt: "The login screen and parent dashboard overview.",
        caption: "Login and dashboard overview with an 8-step progress checklist.",
        shape: "wide",
        frames: [
          { src: "/images/asta/login.png", width: 1512, height: 1080, label: "Login" },
          { src: "/images/asta/dashboard.png", width: 1513, height: 1080, label: "Dashboard overview" },
        ],
      },
      {
        id: "asta-profile",
        title: "Profile, payment and downloads",
        src: "/images/asta/profile.png",
        sectionId: "decisions",
        alt: "Profile accordion sections, payment information and document downloads.",
        caption: "Profile, payment and downloads. Accordion sections split the long form.",
        shape: "wide",
        frames: [
          { src: "/images/asta/profile.png", width: 1220, height: 873, label: "Profile" },
          { src: "/images/asta/payment.png", width: 1220, height: 872, label: "Payment information" },
          { src: "/images/asta/downloads.png", width: 606, height: 434, label: "Document downloads" },
        ],
      },
    ],
    motionStages: [
      {
        id: "asta-overview",
        sectionId: "overview",
        title: "The new homepage",
        stillAlt: "The live admissions homepage on a laptop screen, showing the programme cards.",
        summary: "A screen recording scrolling through the live homepage.",
        durationMs: 10000,
      },
      {
        id: "asta-process",
        sectionId: "process",
        title: "From paragraphs to structure",
        stillAlt:
          "The old homepage: dense grey paragraphs and a small dashed image box reading \"8-step flow, click to zoom\".",
        summary:
          "The old homepage's paragraphs dissolve into labelled chips that arrange into the two information architectures, the public site and the parent dashboard, which then collapse into the design system: the green colour scale, TT Commons, and a button, field and card in their states.",
        durationMs: 10000,
      },
      {
        id: "asta-decisions",
        sectionId: "decisions",
        atTop: true,
        title: "Problem → decision",
        stillAlt: "A single panel labelled Problem: Paragraphs of instructions.",
        summary:
          "Each problem panel expands, fills with loading lines and resolves into its decision: programme cards with one being selected, the numbered step graphic, the programme detail page with icon-led requirement cards, and the profile accordion opening one section at a time.",
        durationMs: 10000,
      },
      {
        id: "asta-impact",
        sectionId: "impact",
        atTop: true,
        title: "~700 families · ~97% without help",
        stillAlt:
          "The admissions site's login screen in a browser window.",
        summary:
          "The parent's journey through the real dashboard screens (login, overview, profile, payment information, document downloads), with a closer look at the 8-step registration checklist; then the window steps back for the two figures: about 700 families registered in the last intake, and about 97% completed registration without help. Figures reported by the school's IT team.",
        durationMs: 8000,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────── BINAPANI ──
  {
    slug: "binapani",
    logo: "/images/binapani/logo.png",
    mark: "/images/binapani/mark.png",
    title: "Kyros by Binapani",
    subtitle: "A visual scheduling app for autistic children",
    year: "2025–26",
    role: "UI/UX designer",
    roleDetail: [
      "The onboarding and activities (categories) flows",
      "The design system and icon library",
      "Both the mobile and tablet versions",
    ],
    team: "Uduak Duru (UI/UX designer). Designs were handed to Binapani's developers.",
    scope: "Mobile and tablet app (MVP)",
    scopeDetail: [
      "The onboarding and activities flows",
      "The design system and icon library",
    ],
    meta: "Internship · Nov 2025 – Jan 2026 · Mobile and tablet app (MVP)",
    summary:
      "Kyros, Binapani's scheduling app. It helps autistic children follow a daily routine through visual, card-based activities. The app is now live on Google Play.",
    teaser: "Research insight turned into design decisions.",
    featured: true,
    link: {
      label: "Kyros on Google Play",
      href: "https://play.google.com/store/apps/details?id=com.binapani.kyros",
    },
    palette: {
      spine: "#1E2F5A",
      paper: "#EEF1F6",
      ink: "#1B2233",
      accent: "#6E93D6",
      darkPaper: "#0E1424",
      darkInk: "#E7ECF5",
      darkAccent: "#8FB0E6",
    },
    cover: {
      image: "/images/binapani/cover.png",
      kicker: "symbols over text",
      mockup: "/images/binapani/cover-mockup.png",
    },
    sections: [
      {
        id: "overview",
        title: "Overview",
        media: "motion",
        motionStageId: "kyros-overview",
        body: `**What it is:** Kyros, Binapani's scheduling app. It helps autistic children follow a daily routine through visual, card-based activities. The app is now live on Google Play.

**Timeline:** November 2025 to January 2026 (3 months), alongside my Master's studies.`,
      },
      {
        id: "challenge",
        title: "The challenge",
        media: "none",
        body: `For many autistic children, a predictable routine means less anxiety and more independence. Schools already know this: they use physical timeline boards, symbol cards and communication boards every day. But these tools are manual (printing and moving symbols around), they're hard to personalise, and there was no digital scheduling app that fit these children's needs.

The brief: a clean, calm scheduling app for mobile and tablet with visual task cards, timers, and tasks that can be edited, skipped or replaced.`,
      },
      {
        id: "research",
        title: "Research",
        media: "motion",
        motionStageId: "kyros-research",
        body: `**Literature review.** Uduak and I split the reading. The evidence pointed clearly towards **visual schedules**: they increase on-task behaviour and independence, and make transitions smoother because upcoming events are visible.

**Interview.** I interviewed a teaching assistant who supports autistic children at school. Key insights:

- **Every child is different.** Support follows each child's personal plan (Behaviour Intervention Plan / Personal Learning Plan), so a one-size-fits-all schedule won't work.
- **Symbols over text.** Many children communicate in one or two words or by pointing at a communication board.
- **Routine changes cause distress.** Teachers struggle when a plan falls through.
- **Choice matters.** Children are encouraged to choose their own optional activities.`,
      },
      {
        id: "insight-to-design",
        title: "From insight to design",
        media: "motion",
        motionStageId: "kyros-design",
        body: `| Insight | What I designed |
|---|---|
| Symbols over text | **Activity cards led by a large icon**, with a short label underneath |
| Each child needs a personal schedule | An **add-activity flow** where carers pick an icon or **upload their own image**, choose a card colour, and add a name and description |
| Colour-coded timeline boards are already familiar | **Colour-coded cards** with a soft pastel palette, plus a custom colour picker |
| Calm, low-sensory interface (from the brief) | A restrained blue brand palette, generous spacing and a simple grid |
| Routines change | An **edit mode** to remove or replace activities (with a confirmation step so nothing is deleted by accident), plus **suggested activities** for adding quickly |
| Children and carers share the device | **4-digit passcode login** and short, low-effort onboarding. Registration asks only for essentials; medical category and calendar import are optional |
| First-time users face an empty screen | A friendly **empty state** that invites carers to create their first activity, with a "do it later" option |

**Mobile and tablet.** I adapted both flows to iPad landscape, where the larger cards and 3-column grid suit shared use in a classroom.`,
      },
      {
        id: "constraints",
        title: "Constraints and trade-offs",
        media: "none",
        body: `- **Time.** Three months, part-time around my studies, so we prioritised the core flows over extra features.
- **Custom icons.** Binapani wanted every icon drawn in-house, which wasn't achievable for a full library in three months. Instead, I adapted icons from **Streamline** into one consistent style, which gave the team a complete, usable set within the timeline.
- **Handover.** The flows shipped as designed, but the build changed some visual details: the icons were swapped, and some buttons were restyled. For example, the **remove button became red**. Strong reds can read as alarming and be overstimulating for autistic children, which is why I had kept destructive actions calm and relied on a confirmation step instead. This case study shows my original designs and the reasoning behind them.`,
      },
      {
        id: "feedback",
        title: "Feedback and iteration",
        media: "none",
        body: `Feedback centred on the **card style**, which I refined. The flow structure itself held up without major changes.`,
      },
      {
        id: "learned",
        title: "What I learned",
        media: "none",
        body: `- **Designing for accessibility starts with restraint.** Fewer colours, fewer words and bigger targets did more than any added feature.
- **Research can be small and still useful.** One interview grounded in lived classroom experience changed how we thought about personalisation and choice.
- **Document the "why", not just the "what".** The red remove button taught me that a design system needs its accessibility reasoning written down. Otherwise, a well-meant change can undo a deliberate decision. Next time I'd add usage notes (e.g. "no high-alert colours for destructive actions") to key components.`,
      },
    ],
    visuals: [
      {
        id: "bina-hero",
        title: "Kyros on iPhone",
        src: "/images/binapani/cover-phones.webp",
        sectionId: "overview",
        alt: "Two iPhones: the Home screen, with what is on now and next, and the Your Activities grid of pastel activity cards.",
        caption: "Home and the activities library.",
        shape: "wide",
        video: {
          src: "/images/binapani/cover.mp4",
          poster: "/images/binapani/cover-phones.webp",
          width: 2902,
          height: 2176,
        },
      },
      // TODO(Sumayya): a Google Play listing screenshot for the overview. No
      // export yet; the listing is linked from the shelf card meanwhile.
      {
        id: "bina-mockup",
        title: "Kyros on iPhone",
        src: "/images/binapani/app-mockup.png",
        sectionId: "insight-to-design",
        alt: "The Home screen and the Your Activities screen on two iPhones.",
        caption: "Home, with what is on now and next, and the activities library.",
        shape: "wide",
        frames: [
          { src: "/images/binapani/app-mockup.png", width: 934, height: 1083 },
        ],
      },
      {
        id: "bina-onboarding",
        title: "Onboarding directions",
        src: "/images/binapani/screens/onboard-blue-1.png",
        sectionId: "overview",
        alt: "Three onboarding screens in a light direction and a blue one.",
        caption: "Onboarding, explored in blue and light directions.",
        frames: [
          { src: "/images/binapani/screens/onboard-blue-1.png", label: "Blue" },
          { src: "/images/binapani/screens/onboard-blue-2.png" },
          { src: "/images/binapani/screens/onboard-blue-3.png" },
          { src: "/images/binapani/screens/onboard-light-1.png", label: "Light" },
          { src: "/images/binapani/screens/onboard-light-2.png" },
          { src: "/images/binapani/screens/onboard-light-3.png" },
        ],
      },
      {
        id: "bina-registration",
        title: "Log in, register and first activity",
        src: "/images/binapani/screens/login.png",
        sectionId: "insight-to-design",
        alt: "The passcode log-in, the registration form, and the first-activity empty state.",
        caption: "Registration and the first-activity empty state.",
        frames: [
          { src: "/images/binapani/screens/login.png", label: "Log in" },
          { src: "/images/binapani/screens/register.png", label: "Register" },
          { src: "/images/binapani/screens/first-activity.png", label: "First activity" },
        ],
      },
      {
        id: "bina-onboarding-tablet",
        title: "Onboarding and sign-up, tablet",
        src: "/images/binapani/tablet/onboard-1.png",
        sectionId: "insight-to-design",
        alt: "The three onboarding screens, the passcode log-in and the registration form on tablet.",
        caption: "The same onboarding and sign-up on tablet.",
        shape: "tablet",
        frames: [
          { src: "/images/binapani/tablet/onboard-1.png", label: "Onboarding" },
          { src: "/images/binapani/tablet/onboard-2.png" },
          { src: "/images/binapani/tablet/onboard-3.png" },
          { src: "/images/binapani/tablet/login.png", label: "Log in" },
          { src: "/images/binapani/tablet/register.png", label: "Register" },
        ],
      },
      {
        id: "bina-activities-mobile",
        title: "Activities flow, mobile",
        src: "/images/binapani/screens/home.png",
        sectionId: "insight-to-design",
        alt: "The activities flow on mobile: home, the activities grid, an activity, edit mode, the form, and the icon and colour pickers.",
        caption: "Activities flow, mobile: cards led by a large icon.",
        frames: [
          { src: "/images/binapani/screens/home.png", label: "Home" },
          { src: "/images/binapani/screens/activities.png", label: "Activities" },
          { src: "/images/binapani/screens/activity-detail.png", label: "Activity" },
          { src: "/images/binapani/screens/activities-edit.png", label: "Edit" },
          { src: "/images/binapani/screens/activity-add.png", label: "Add" },
          { src: "/images/binapani/screens/icon-picker.png", label: "Icons" },
          { src: "/images/binapani/screens/colour-picker.png", label: "Colours" },
        ],
      },
      {
        id: "bina-activities-tablet",
        title: "Activities flow, tablet",
        src: "/images/binapani/tablet/home.png",
        sectionId: "insight-to-design",
        alt: "The same flow on tablet, with a three-column grid of activity cards.",
        caption: "Activities flow, tablet: larger cards and a 3-column grid for shared classroom use.",
        shape: "tablet",
        frames: [
          { src: "/images/binapani/tablet/home.png", label: "Home" },
          { src: "/images/binapani/tablet/activities.png", label: "Activities" },
          { src: "/images/binapani/tablet/activity-detail.png", label: "Activity" },
          { src: "/images/binapani/tablet/activities-edit.png", label: "Edit" },
          { src: "/images/binapani/tablet/activity-add.png", label: "Add" },
          { src: "/images/binapani/tablet/icon-picker.png", label: "Icons" },
          { src: "/images/binapani/tablet/colour-picker.png", label: "Colours" },
        ],
      },
      {
        id: "bina-system",
        title: "Design system",
        src: "/images/binapani/system/colours.png",
        sectionId: "insight-to-design",
        alt: "The design system: colour and shadow scales, typography, buttons, fields and icons.",
        caption: "The design system: colours, typography, buttons, fields and icons.",
        shape: "wide",
        frames: [
          { src: "/images/binapani/system/colours.png", width: 2132, height: 951, label: "Colours and shadows" },
          { src: "/images/binapani/system/typography-2.png", width: 823, height: 2000, label: "Typography" },
          { src: "/images/binapani/system/buttons-2.png", width: 2000, height: 1700, label: "Buttons" },
          { src: "/images/binapani/system/fields.png", width: 1422, height: 1522, label: "Fields" },
          { src: "/images/binapani/system/icons.png", width: 461, height: 1333, label: "Icons" },
        ],
      },
      {
        id: "bina-research",
        title: "Classroom research",
        src: "/images/binapani/communication-board.png",
        sectionId: "research",
        alt: "A communication board and a list of everyday ASD activities.",
        caption: "Research: a communication board, one of the physical tools schools use every day.",
        shape: "wide",
        frames: [
          { src: "/images/binapani/communication-board.png", width: 1800, height: 1349, label: "Communication board" },
          { src: "/images/binapani/activities-research.png", width: 1800, height: 1205, label: "Research on activities" },
        ],
      },
    ],
    motionStages: [
      {
        id: "kyros-overview",
        sectionId: "overview",
        title: "Kyros on iPhone",
        stillAlt: "Three Kyros screens on phones: Home, Your Activities and an activity.",
        summary: "The three screens float gently, side by side.",
        durationMs: 10000,
      },
      {
        id: "kyros-research",
        sectionId: "research",
        after: "**Interview.**",
        title: "Four insights, and what each became",
        stillAlt: "A soft, blurred classroom communication board made of simple symbol tiles.",
        summary:
          "Four insight cards from the interview float in over the board one at a time (every child is different, symbols over text, routine changes cause distress, choice matters), then each slowly becomes the design element it led to: the add-activity panel, an icon-led card, the edit-mode confirmation, and the suggested activities row.",
        durationMs: 10000,
      },
      {
        id: "kyros-design",
        sectionId: "insight-to-design",
        atTop: true,
        title: "From insight to design, screen by screen",
        stillAlt:
          "The first-activity empty state on a phone, beside the insight it answers.",
        summary:
          "Five screens from the activities flow (empty state, add activity, icon picker, colour picker, edit mode) appear one at a time, each paired with the insight it answers and what was designed.",
        durationMs: 11000,
      },
      {
        id: "kyros-devices",
        sectionId: "insight-to-design",
        after: "**Mobile and tablet.**",
        title: "From phone to iPad landscape",
        stillAlt: "The activities screen on a phone.",
        summary:
          "The phone becomes an iPad in landscape, the card grid reflows into three columns, and the 4-digit passcode fills one dot at a time.",
        durationMs: 8000,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────── GUT-SKIN ──
  {
    slug: "gut-skin",
    logo: "/images/gut-skin/logo.png",
    mark: "/images/gut-skin/mark.png",
    title: "Gut-Skin",
    subtitle: "A holistic companion for skin and gut health",
    year: "2026",
    role: "End-to-end designer",
    roleDetail: [
      "Research",
      "Synthesis",
      "Workshop facilitation",
      "Information architecture",
      "Prototyping",
      "Usability testing",
    ],
    team: "Solo. MSc UX Design final project, Kingston University.",
    scope: "iOS app concept",
    scopeDetail: [
      "Research",
      "Synthesis",
      "Prototyping",
      "Three rounds of usability testing",
    ],
    meta: "MSc UX Design final project, Kingston University · 2026 · iOS app concept",
    summary:
      "Gut-Skin is an AI-assisted app for women aged 22 to 30 with recurring skin concerns. It helps them understand how gut health, diet, sleep and stress affect their skin, through skin scanning, a daily log, an AI assistant and personalised recommendations.",
    teaser: "Three rounds of testing and what each one revealed.",
    featured: true,
    link: {
      label: "Open the prototype",
      href: "https://www.figma.com/proto/wptX60vQQEM6d5OnTL7LWe/Final-project---Gut-Skin?node-id=1118-20426&viewport=1403%2C630%2C0.08&t=9Ni4ytDPeBaVXpjF-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1118%3A20426&page-id=3%3A6",
    },
    prototype: {
      type: "figma",
      url: "https://www.figma.com/proto/wptX60vQQEM6d5OnTL7LWe/Final-project---Gut-Skin?node-id=1118-20426&viewport=1403%2C630%2C0.08&t=9Ni4ytDPeBaVXpjF-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1118%3A20426&page-id=3%3A6",
      poster: "/images/gut-skin/splash.png",
      background: "/images/gut-skin/prototype-bg-2.jpg",
    },
    palette: {
      spine: "#705A39",
      paper: "#F3EFE7",
      ink: "#2A2A22",
      accent: "#8A5A3C",
      // the accent is a brown on a brown spine: the tick vanished
      spineTick: "#A3BE8C",
      darkPaper: "#14130E",
      darkInk: "#ECE6DA",
      darkAccent: "#C08A63",
    },
    cover: {
      image: "/images/gut-skin/cover.png",
      kicker: "three rounds of testing",
      mockup: "/images/gut-skin/cover-mockup-2.png",
    },
    sections: [
      {
        id: "overview",
        title: "Overview",
        media: "motion",
        motionStageId: "gut-overview",
        body: `**What it is:** Gut-Skin is an AI-assisted app for women aged 22 to 30 with recurring skin concerns. It helps them understand how gut health, diet, sleep and stress affect their skin, through skin scanning, a daily log, an AI assistant and personalised recommendations.

**Methods:** Double Diamond, with Design Thinking techniques in the Discover and Define stages.`,
      },
      {
        id: "impact",
        title: "Impact",
        media: "motion",
        motionStageId: "gut-impact",
        body: `| | Round 1 · Low-fi | Round 2 · Mid-fi | Round 3 · Hi-fi |
|---|---|---|---|
| Task success | 69.0% | 68.6% | **100%** |
| Confusion moments | 46 | 42 | **26** |
| Participants | 5 | 6 | 5 |

Final round: **SUS 82.5** (grade A, above the 68 benchmark) and an average **+2.00 confidence gain**.`,
      },
      {
        id: "challenge",
        title: "The challenge",
        media: "none",
        body: `The problem isn't a lack of information. It's that the information is scattered.

- **38 survey responses:** 63% had managed their skin concern for **more than two years**.
- **71%** already believed gut and skin are connected, and **84%** would try lifestyle changes with personalised guidance.
- **53%** felt overwhelmed by skincare information often or almost always.
- **More users relied on Google (53%) and social media (39%) than on a clinician (21%)**, which left them acting as their own researchers.

Existing apps don't close the gap. I scored **17 apps** across five dimensions. Skin apps focus on products, gut apps ignore skin, and AI scanners give a one-off snapshot with no lifestyle context.

> *"I know sugar and stress do something to my skin. I just do not know what to actually do about it."*
> Aliya, the persona built from the research

**The real design problem:** lifestyle changes take weeks to show on the skin, but users want feedback every day. Without visible progress, people doubt and drop off.`,
      },
      {
        id: "process",
        title: "Process",
        media: "motion",
        motionStageId: "gut-define",
        body: `**Discover.** Survey, semi-structured interviews and a competitor review. Five interviewees asked, unprompted, for a skin scanner.

**Define.** A remote co-creation workshop with 3 participants (card sorting, dot voting, a prioritisation matrix and Crazy 8s). It changed two of my assumptions:

1. **"Evidence-based content" isn't a feature.** Participants expected it as a quality of the AI guidance.
2. **Online doctor access was dropped.** Participants rated it high effort, low impact, and some trusted their own long-term data more.

Card sorting also showed that **tracking is the foundation and guidance is its output**, so I designed the app as two layers rather than a set of equal features. A current-state journey map (Notice → Search → Buy → Try → Doubt → Drop) pinpointed the break point: **Doubt**, where there's no feedback loop.

**Develop: three rounds of testing.** Each round fixed one layer of problems and exposed the next.

| Round | What I changed | What testing revealed |
|---|---|---|
| **1 · Low-fi** | Six core flows in greyscale | Participants didn't understand how content was **grouped and labelled** |
| **2 · Mid-fi** | Split scan and log history into two separate places | **3 of 6** participants started a new scan when asked to find an old one, and **nobody** found scan history unaided. Controls also didn't look tappable. |
| **3 · Hi-fi** | Merged history into **one screen with filters**; renamed actions so "scan" no longer meant both the act and the record; added a history shortcut on the home page, clear card signifiers and an onboarding progress bar | **100% task success**, and no one confused the two histories. New issue: Insights screens were **too text-dense**. |

**Deliver: refinements after round 3.**

- **Previous scan vs today** comparison, plus a **weekly progress summary** (Day 1 vs Day 7). This answers the "Doubt" stage directly.
- **Story cards** that turn long Insights pages into one idea per slide, followed by short recommendation cards.
- **Product tiles relabelled by category** ("Food supplement") instead of brand name, so third-party products no longer looked like app features.
- A **time filter** on History (today, this week, this month, this year).`,
      },
      {
        id: "ai",
        title: "Designing AI responsibly",
        media: "none",
        body: `- **Patterns, not diagnoses.** Individual microbiome responses vary a lot, so the app helps users notice their own patterns instead of claiming to know the cause.
- **Sources.** The assistant cites its sources and makes clear it doesn't replace a GP or dermatologist.
- **Privacy at the point of use.** A first-time participant asked, *"When I am scanning my face, I want to know how that is being taken care of."* Face images count as special category data under UK GDPR, so the scan screen states how long images are kept.
- **Pseudonymous names** (e.g. "Sunshine") reduce the stigma risk tied to visible skin conditions.
- **Accessibility:** dark mode, adjustable font size and speech-to-text.`,
      },
      {
        id: "risks",
        title: "Risks and trade-offs",
        media: "none",
        body: `- **The 100% needs context.** Four of the five round-3 participants had seen an earlier version, and task titles named the destinations. The one true newcomer scored lowest (SUS 60). The design is well liked, but first-use learnability is only partly proven.
- **Scoped out on purpose:** visual grouping inside History and moving one progress control. I explored three options for grouping but didn't build them before the deadline.
- **Not yet tested:** whether users understand that scan results and the assistant's answers are AI-generated.`,
      },
      {
        id: "learned",
        title: "What I learned",
        media: "none",
        body: `- **Fixing one layer reveals the next.** A flat score between rounds 1 and 2 wasn't failure; the problems had moved from labels to structure.
- **A headline number needs its caveats alongside it**, not in a footnote.
- **Recruit fresh participants for the final round.** Next time I'd bring in at least two first-time users.`,
      },
    ],
    visuals: [
      {
        id: "gs-hero",
        title: "Gut-Skin on iPhone",
        src: "/images/gut-skin/cover-mockup-2.png",
        sectionId: "overview",
        alt: "Two iPhones showing the Gut-Skin home screen and the AI assistant, and the app icon on a home screen and in the dock.",
        caption: "The home screen, the AI assistant, and the app icon at home on a phone.",
        shape: "wide",
        frames: [
          { src: "/images/gut-skin/cover-mockup-2.png", width: 844, height: 1026, label: "Home and assistant" },
          { src: "/images/gut-skin/app-icon-home.webp", width: 2000, height: 2000, label: "Home screen" },
          { src: "/images/gut-skin/app-icon-dock.webp", width: 1896, height: 1506, label: "Dock" },
        ],
      },
      {
        id: "gs-splash",
        title: "Splash screen",
        src: "/images/gut-skin/splash.png",
        sectionId: "overview",
        alt: "The Gut-Skin splash screen.",
        caption: "Splash screen.",
        frames: [{ src: "/images/gut-skin/splash.png" }],
      },
      {
        id: "gs-axis",
        title: "The gut-skin axis",
        src: "/images/gut-skin/gut-skin-axis-2.png",
        sectionId: "challenge",
        alt: "A diagram of the gut-skin axis and how AI works in the app.",
        caption: "The gut-skin axis, and how the AI works.",
        shape: "wide",
        frames: [
          { src: "/images/gut-skin/gut-skin-axis-2.png", width: 1800, height: 740, label: "The gut-skin axis" },
          { src: "/images/gut-skin/how-ai-works.png", width: 1800, height: 646, label: "How the AI works" },
        ],
      },
      {
        id: "gs-competitors",
        title: "Competitor matrix",
        src: "/images/gut-skin/competitor-matrix.png",
        sectionId: "challenge",
        alt: "A competitor matrix scoring 17 apps across five dimensions.",
        caption: "Competitor matrix: 17 apps scored across five dimensions.",
        shape: "wide",
        frames: [
          { src: "/images/gut-skin/competitor-matrix.png", width: 1800, height: 1137 },
        ],
      },
      {
        id: "gs-workshop",
        title: "Co-creation workshop",
        src: "/images/gut-skin/workshop-miro.png",
        sectionId: "process",
        alt: "Workshop artefacts: card sort and prioritisation matrix.",
        caption: "Workshop: card sorting and a prioritisation matrix.",
        shape: "wide",
        frames: [
          { src: "/images/gut-skin/workshop-miro.png", width: 1800, height: 1307, label: "Dot voting in Miro" },
          { src: "/images/gut-skin/workshop-card-sort.png", width: 1800, height: 1258, label: "Card sort" },
          { src: "/images/gut-skin/workshop-prioritisation.png", width: 1800, height: 886, label: "Prioritisation" },
        ],
      },
      {
        id: "gs-persona",
        title: "Persona and journey map",
        src: "/images/gut-skin/persona.png",
        sectionId: "process",
        alt: "Persona and current-state journey map.",
        caption: "Persona and the journey map that pinpointed the Doubt stage.",
        shape: "wide",
        frames: [
          { src: "/images/gut-skin/persona.png", width: 1800, height: 1185, label: "Persona" },
          { src: "/images/gut-skin/journey-map.png", width: 1800, height: 787, label: "Journey map" },
        ],
      },
      {
        id: "gs-ia",
        title: "Information architecture",
        src: "/images/gut-skin/information-architecture.png",
        sectionId: "process",
        alt: "The app's information architecture.",
        caption: "Information architecture: tracking as the foundation, guidance as its output.",
        shape: "wide",
        frames: [
          { src: "/images/gut-skin/information-architecture.png", width: 1800, height: 999 },
        ],
      },
      {
        id: "gs-lofi-midfi",
        title: "Low-fi and mid-fi screens",
        src: "/images/gut-skin/lofi.png",
        sectionId: "process",
        alt: "Low-fidelity and mid-fidelity screens.",
        caption: "Low-fi and mid-fi screens across the testing rounds.",
        shape: "wide",
        frames: [
          { src: "/images/gut-skin/lofi.png", width: 1800, height: 872, label: "Low-fi" },
          { src: "/images/gut-skin/midfi.png", width: 1800, height: 1518, label: "Mid-fi" },
        ],
      },
      {
        id: "gs-hifi",
        title: "Hi-fi main features",
        src: "/images/gut-skin/screens/home.png",
        sectionId: "process",
        alt: "Hi-fidelity main feature screens: home, insights, scan, community and profile.",
        caption: "Hi-fi main features after round 3.",
        frames: [
          { src: "/images/gut-skin/screens/home.png", label: "Home" },
          { src: "/images/gut-skin/screens/insights.png", label: "Insights" },
          { src: "/images/gut-skin/screens/scan.png", label: "Scan" },
          { src: "/images/gut-skin/screens/community.png", label: "Community" },
          { src: "/images/gut-skin/screens/profile.png", label: "Profile" },
        ],
      },
      {
        id: "gs-design-system",
        title: "Design system",
        src: "/images/gut-skin/design-system.png",
        sectionId: "process",
        alt: "The design system: app icon, components, colour and shadow scales, and typography.",
        caption: "The design system behind the screens.",
        shape: "wide",
        frames: [
          { src: "/images/gut-skin/design-system.png", width: 1800, height: 873 },
        ],
      },
      {
        id: "gs-insights",
        title: "AI Insights story cards",
        src: "/images/gut-skin/screens/story-1.png",
        sectionId: "process",
        alt: "AI Insights as story cards, one idea per slide, followed by a recommendation page.",
        caption: "AI Insights turned into story cards, one idea per slide.",
        video: {
          src: "/images/gut-skin/story.mp4",
          poster: "/images/gut-skin/story-poster.png",
          width: 472,
          height: 960,
          // measured off a frame: brown backdrop shows as a 9px sliver down
          // the left and 5px along the foot; the phone is flush right
          crop: { top: 0.2, right: 0.2, bottom: 0.6, left: 2 },
        },
        frames: [
          { src: "/images/gut-skin/screens/story-1.png" },
          { src: "/images/gut-skin/screens/story-2.png" },
          { src: "/images/gut-skin/screens/story-3.png" },
          { src: "/images/gut-skin/screens/story-4.png" },
          { src: "/images/gut-skin/screens/recommendation.png", label: "Recommendations" },
        ],
      },
      {
        id: "gs-before-after",
        title: "Before and after",
        src: "/images/gut-skin/screens/insight-before.png",
        sectionId: "process",
        alt: "Before and after the round 3 refinements: the insight page, history, and the scan result.",
        caption: "Before and after the refinements.",
        shape: "pairs",
        frames: [
          { src: "/images/gut-skin/screens/insight-before.png", label: "Before" },
          { src: "/images/gut-skin/screens/insight-after.png", label: "After" },
          { src: "/images/gut-skin/screens/history-before.png", label: "Before" },
          { src: "/images/gut-skin/screens/history-after.png", label: "After" },
          { src: "/images/gut-skin/screens/scan-result-before.png", label: "Before" },
          { src: "/images/gut-skin/screens/scan-result-after.png", label: "After" },
        ],
      },
      {
        id: "gs-accessibility",
        title: "Accessibility and dark mode",
        src: "/images/gut-skin/screens/dark-home-3.png",
        sectionId: "ai",
        alt: "Dark mode: home, AI assistant, insights feed, scan, communities and profile.",
        caption: "Accessibility and dark mode.",
        frames: [
          { src: "/images/gut-skin/screens/dark-home-3.png", label: "Home" },
          { src: "/images/gut-skin/screens/dark-assistant-2.png", label: "Assistant" },
          { src: "/images/gut-skin/screens/dark-insights-3.png", label: "Insights" },
          { src: "/images/gut-skin/screens/dark-scan-3.png", label: "Scan" },
          { src: "/images/gut-skin/screens/dark-community-3.png", label: "Communities" },
          { src: "/images/gut-skin/screens/dark-profile-3.png", label: "Profile" },
        ],
      },
    ],
    motionStages: [
      {
        id: "gut-overview",
        sectionId: "overview",
        title: "Light and dark",
        stillAlt: "The Gut-Skin home screen on two phones, in light and dark mode.",
        summary: "The main features (home, insights, scan, community, profile) step through in light and dark mode side by side.",
        durationMs: 10000,
      },
      {
        id: "gut-define",
        sectionId: "process",
        after: "Card sorting also showed",
        title: "Scattered research, down to Doubt",
        stillAlt:
          "A dark tile filling the frame: \"The problem isn't a lack of information. It's that the information is scattered.\"",
        summary:
          "The view zooms out to a wall of research artefacts drifting in rows (survey figures, the 17-app competitor matrix, card-sort chips, dot votes and Crazy 8s), then the current-state journey draws across, Notice to Search, Buy, Try, Doubt and Drop, and pushes in on Doubt, where the line breaks.",
        durationMs: 12000,
      },
      {
        id: "gut-testing",
        sectionId: "process",
        after: "**Develop: three rounds of testing.**",
        title: "Three rounds, and what each revealed",
        stillAlt:
          "Three dimmed columns, Round 1 · Low-fi, Round 2 · Mid-fi and Round 3 · Hi-fi, each with its screens.",
        summary:
          "Each round arrives with its screens, its task success and confusion moments (69.0% and 46, 68.6% and 42, 100% and 26) and what testing revealed; then a wipe across the History screen shows it before and after the refinements.",
        durationMs: 12000,
      },
      {
        id: "gut-impact",
        sectionId: "impact",
        after: "Final round:",
        title: "Day 1 vs Day 7, and the final round",
        stillAlt: "A phone on the face-scan screen, a scan line at the top of a dashed oval.",
        summary:
          "The scan line sweeps the face twice, a Day 1 vs Day 7 weekly summary resolves and story cards slide past; the view pulls back to rows of findings and quotes: SUS 82.5 (grade A, above the 68 benchmark), a +2.00 average confidence gain, the persona quote and a round-3 participant on face scanning, with the caveat that four of the five round-3 participants had seen an earlier version.",
        durationMs: 10000,
      },
    ],
  },
];

/**
 * Quieter spine-only books that sit after the featured three and open a
 * Behance case study in a new tab. No case study page on this site.
 */
export const externalBooks: ExternalBook[] = [
  {
    slug: "halodoc",
    title: "Halodoc: Health Tech App",
    year: "2021",
    externalUrl:
      "https://medium.com/design-bootcamp/redesign-halodocs-booking-appointment-flow-eaa0c3b425e2?sharedUserId=sumayyatsabitah",
    note: "Publication on Bootcamp Medium",
    preview: "/images/external/halodoc.png",
  },
  { slug: "garmin-heuristic", title: "Heuristic Evaluation: Garmin Connect", year: "2025", externalUrl: "https://www.behance.net/gallery/245237533/Heuristic-Evaluation-Garmin-Connect", preview: "/images/external/garmin-heuristic.png" },
  { slug: "tiket-forum", title: "Tiket.com Travel App: Forum Feature", year: "2023", externalUrl: "https://www.behance.net/gallery/236923431/Tiketcom-Travel-App-Forum-Feature", preview: "/images/external/tiket-forum.png" },
  { slug: "cctv-dashboard", title: "AI Face Recognition CCTV Dashboard", year: "2022", externalUrl: "https://www.behance.net/gallery/236918417/AI-Face-Recognition-CCTV-Dashboard", preview: "/images/external/cctv-dashboard.png" },
  {
    slug: "grab-concept",
    title: "Grab Improvement Concept",
    year: "2022",
    externalUrl:
      "https://medium.com/design-bootcamp/case-study-improvement-on-grab-booking-experience-1be8310c4c20?sharedUserId=sumayyatsabitah",
    note: "Publication on Bootcamp Medium",
    preview: "/images/external/grab-concept.png",
  },
  { slug: "lion-air", title: "Lion Air: Flight Booking", year: "2021", externalUrl: "https://www.behance.net/gallery/131938349/Lion-Air-Flight-Booking-Ticket-Mobile-App", preview: "/images/external/lion-air.png" },
  { slug: "e-township", title: "E-Township S Residence", year: "2022", externalUrl: "https://www.behance.net/gallery/151959117/E-Township-S-Residence-Design-Concept", preview: "/images/external/e-township.png" },
  { slug: "death-of-democracy", title: "Death of Democracy Poster", year: "2025", externalUrl: "https://www.behance.net/gallery/236076629/Death-of-Democracy-Poster", preview: "/images/external/death-of-democracy.png" },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
