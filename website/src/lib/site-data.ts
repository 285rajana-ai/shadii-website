import {
    AcademicCapIcon,
    AdjustmentsHorizontalIcon,
    ChatBubbleLeftRightIcon,
    CheckBadgeIcon,
    CreditCardIcon,
    EnvelopeIcon,
    FlagIcon,
    HeartIcon,
    LifebuoyIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    PhotoIcon,
    QuestionMarkCircleIcon,
    RocketLaunchIcon,
    ShieldCheckIcon,
    SparklesIcon,
    UserGroupIcon,
    UserPlusIcon,
} from "@heroicons/react/24/outline";

export const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Stories" },
    { href: "#faq", label: "FAQ" },
];

export const heroMatches = [
    { name: "Mahnoor A.", age: 24, city: "Lahore", match: "95%", verified: true },
    { name: "Fatima K.", age: 26, city: "Karachi", match: "91%", verified: true },
    { name: "Sana R.", age: 23, city: "Islamabad", match: "88%", verified: true },
];

export const stats = [
    { value: 50000, suffix: "+", label: "Registered Members" },
    { value: 8000, suffix: "+", label: "Successful Matches" },
    { value: 99, suffix: "%", label: "Verified Profiles" },
    { value: 4.8, suffix: "★", label: "App Store Rating", decimals: 1 },
];

export const trustBadges = [
    {
        icon: ShieldCheckIcon,
        title: "CNIC Verified",
        desc: "Every member verifies with real government ID.",
    },
    {
        icon: LockClosedIcon,
        title: "256-bit Encrypted",
        desc: "End-to-end encryption on personal data.",
    },
    {
        icon: UserGroupIcon,
        title: "24/7 Moderation",
        desc: "Human + AI review of every report.",
    },
    {
        icon: CheckBadgeIcon,
        title: "Family Approved",
        desc: "Built with Pakistani family values in mind.",
    },
];

export const features = [
    {
        icon: ShieldCheckIcon,
        title: "Verified Blue Tick Profiles",
        desc: "Upload CNIC and live selfie for identity verification. Verified members earn a blue badge and far more trust from families.",
        badge: "Safety First",
    },
    {
        icon: SparklesIcon,
        title: "AI-Powered Daily Matches",
        desc: "Receive 3 to 5 quality suggestions every morning based on age, city, education, caste, and shared intent.",
        badge: "Smart Matching",
    },
    {
        icon: LockClosedIcon,
        title: "Privacy by Design",
        desc: "Verified female photos stay blurred by default. Serious members can unlock visibility through subscription only.",
        badge: "Privacy",
    },
    {
        icon: ChatBubbleLeftRightIcon,
        title: "Safe Messaging",
        desc: "First message is free. Contact details and social handles are automatically detected and blocked in chat.",
        badge: "Safety",
    },
    {
        icon: AdjustmentsHorizontalIcon,
        title: "Advanced Search Filters",
        desc: "Filter by gender, age, city, education, caste, religion, online status, and premium visibility.",
        badge: "Discover",
    },
    {
        icon: RocketLaunchIcon,
        title: "Profile Boost",
        desc: "Boost your profile for PKR 500 for 3 days and rise to the top of search results for higher response rates.",
        badge: "Visibility",
    },
    {
        icon: FlagIcon,
        title: "Report & Block",
        desc: "Report fake profiles or harassment instantly. Every complaint is reviewed within 24 hours by the moderation team.",
        badge: "Moderation",
    },
    {
        icon: CreditCardIcon,
        title: "Easy Pakistani Payments",
        desc: "Pay with EasyPaisa, JazzCash, debit card, credit card, or bank transfer without awkward setup.",
        badge: "Payments",
    },
];

export const steps = [
    {
        num: "01",
        title: "Create Your Profile",
        desc: "Sign up, add your details, upload photos, and set the kind of partner your family is looking for.",
        icon: UserPlusIcon,
    },
    {
        num: "02",
        title: "Get Verified",
        desc: "Submit CNIC and live selfie verification so families know they are speaking with a real person.",
        icon: CheckBadgeIcon,
    },
    {
        num: "03",
        title: "Browse & Filter",
        desc: "Use city, age, education, caste, and subscription filters to narrow down serious profiles quickly.",
        icon: MagnifyingGlassIcon,
    },
    {
        num: "04",
        title: "Daily AI Matches",
        desc: "Wake up to curated suggestions based on compatibility, seriousness, and your saved preferences.",
        icon: SparklesIcon,
    },
    {
        num: "05",
        title: "Connect Privately",
        desc: "Start with a free first message, then continue safely with unlimited chat through a plan.",
        icon: EnvelopeIcon,
    },
    {
        num: "06",
        title: "Move Toward Marriage",
        desc: "When both sides are comfortable, involve families and move from conversation to a serious proposal.",
        icon: HeartIcon,
    },
];

export const plans = [
    {
        name: "Basic",
        price: "1,000",
        duration: "1 Month",
        popular: false,
        tagline: "Perfect to start your journey.",
        features: [
            "Unlimited messaging",
            "View full profile details",
            "Daily 3 to 5 smart matches",
            "Advanced search filters",
            "Persistent chat history",
        ],
    },
    {
        name: "Standard",
        price: "2,500",
        duration: "3 Months",
        popular: true,
        tagline: "Our most popular plan for serious search.",
        features: [
            "Everything in Basic",
            "Blurred photos revealed",
            "See who viewed your profile",
            "Priority in search results",
            "One free profile boost",
            "Read receipts in chat",
        ],
    },
    {
        name: "Premium",
        price: "5,000",
        duration: "6 Months",
        popular: false,
        tagline: "Maximum visibility, priority support.",
        features: [
            "Everything in Standard",
            "Top placement in search",
            "Premium gold badge",
            "Unlimited boosts",
            "Compatibility report",
            "Priority support response",
        ],
    },
];

export const testimonials = [
    {
        name: "Mahnoor & Ahmed",
        city: "Lahore",
        initials: "MA",
        text: "We connected through Shadii.pk and got married a few months later. The verified profiles gave our families confidence from the start.",
    },
    {
        name: "Amna & Bilal",
        city: "Karachi",
        initials: "AB",
        text: "The daily suggestions were actually relevant. It felt like the app understood what mattered to both families.",
    },
    {
        name: "Zara & Usman",
        city: "Islamabad",
        initials: "ZU",
        text: "The privacy controls were the reason I felt comfortable joining. The process stayed respectful the whole way through.",
    },
    {
        name: "Sana & Kamran",
        city: "Lahore",
        initials: "SK",
        text: "CNIC verification made a real difference. We could tell we were talking to serious people with genuine intent.",
    },
];

export const faqs = [
    {
        q: "Is Shadii.pk free to use?",
        a: "Yes. Registration and your first message in a conversation are free. A subscription is needed for unlimited messaging and premium visibility features.",
    },
    {
        q: "How does profile verification work?",
        a: "Users upload CNIC and complete a live selfie check inside the app. Verified profiles receive a blue tick after review.",
    },
    {
        q: "Can I see who viewed my profile?",
        a: "Yes. Standard and Premium members can see recent profile visitors in real time.",
    },
    {
        q: "What payment methods are accepted?",
        a: "EasyPaisa, JazzCash, debit cards, credit cards, and bank transfer are all supported.",
    },
    {
        q: "How does the matching algorithm work?",
        a: "Every day the system ranks potential matches using your preferences, profile completeness, verification status, and activity quality.",
    },
    {
        q: "Why are some female photos blurred?",
        a: "It protects privacy and reduces casual browsing. Photos are revealed only to serious subscribed users.",
    },
    {
        q: "What happens if I share my phone number in chat?",
        a: "The platform warns or restricts accounts that share contact details too early, helping keep early conversations safe and within the app.",
    },
    {
        q: "Is my personal information safe?",
        a: "Yes. Verification data is encrypted, access is restricted, and profile privacy controls are built into the app from day one.",
    },
];

export const guides = [
    {
        icon: PhotoIcon,
        title: "Profile Tips",
        desc: "Write a sharper bio and choose photos that help families trust you quickly.",
    },
    {
        icon: MagnifyingGlassIcon,
        title: "Search Guide",
        desc: "Use advanced filters to find serious, compatible matches instead of endless browsing.",
    },
    {
        icon: ChatBubbleLeftRightIcon,
        title: "Safe Messaging",
        desc: "Learn how to start respectful, clear first conversations without oversharing.",
    },
    {
        icon: LifebuoyIcon,
        title: "Safety Center",
        desc: "Understand blocking, reporting, and the moderation process before you need it.",
    },
    {
        icon: AcademicCapIcon,
        title: "Verification Guide",
        desc: "See exactly how CNIC and live selfie verification works from start to finish.",
    },
    {
        icon: QuestionMarkCircleIcon,
        title: "Payment Help",
        desc: "Get help with EasyPaisa, JazzCash, cards, and bank transfer plan payments.",
    },
];

export const footerColumns = [
    {
        title: "Product",
        links: [
            { href: "#features", label: "Features" },
            { href: "#how-it-works", label: "How It Works" },
            { href: "#pricing", label: "Pricing" },
            { href: "#download", label: "Download App" },
            { href: "#faq", label: "Verification" },
        ],
    },
    {
        title: "Support",
        links: [
            { href: "#faq", label: "Help Center" },
            { href: "#help-guide", label: "Safety Tips" },
            { href: "mailto:help@shadii.pk", label: "Contact Us" },
            { href: "mailto:abuse@shadii.pk", label: "Report Abuse" },
            { href: "mailto:support@shadii.pk", label: "Community Guidelines" },
        ],
    },
    {
        title: "Company",
        links: [
            { href: "#download", label: "About Us" },
            { href: "#features", label: "Blog" },
            { href: "#pricing", label: "Careers" },
            { href: "#download", label: "Press" },
            { href: "#download", label: "Partner With Us" },
        ],
    },
];

export const pressMentions = [
    "Dawn",
    "Geo News",
    "The News",
    "Express Tribune",
    "ARY News",
    "Samaa",
    "ProPakistani",
    "TechJuice",
];

export const comparison = [
    {
        feature: "Verified identity (CNIC + live selfie)",
        shadii: true,
        traditional: false,
    },
    { feature: "AI-powered compatibility matching", shadii: true, traditional: false },
    { feature: "Photo privacy & blur protection", shadii: true, traditional: false },
    { feature: "Automatic chat safety filters", shadii: true, traditional: false },
    { feature: "Pakistani payment methods (EasyPaisa, JazzCash)", shadii: true, traditional: false },
    { feature: "24/7 moderation & reporting", shadii: true, traditional: false },
    { feature: "Transparent, honest pricing", shadii: true, traditional: false },
    { feature: "Respects family values", shadii: true, traditional: true },
];
