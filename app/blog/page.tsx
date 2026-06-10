import connectMongo from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Link from "next/link";
import NewsletterSection from "@/app/components/NewsletterSection";

interface IBlog {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

const TOPIC_IMAGES: Record<string, string[]> = {
  resume: [
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=75",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=75",
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=75",
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&q=75",
    "https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=800&q=75",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=75",
    "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800&q=75",
    "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=75",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=75",
    "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800&q=75",
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=75",
    "https://images.unsplash.com/photo-1542903660-eedba2cda584?w=800&q=75",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=75",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=75",
    "https://images.unsplash.com/photo-1471560090527-d1af5e4e6eb6?w=800&q=75",
  ],
  interview: [
    "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=75",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=75",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=75",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=75",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=75",
    "https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?w=800&q=75",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=75",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=75",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=75",
    "https://images.unsplash.com/photo-1529539795054-3c162aab037a?w=800&q=75",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=75",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=75",
    "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=75",
    "https://images.unsplash.com/photo-1584697964190-7383ba3a3e8a?w=800&q=75",
    "https://images.unsplash.com/photo-1576267423048-15c0040fec78?w=800&q=75",
  ],
  salary: [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=75",
    "https://images.unsplash.com/photo-1579389083078-4e7018379f7e?w=800&q=75",
    "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=75",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=75",
    "https://images.unsplash.com/photo-1550305080-4e029753abcf?w=800&q=75",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=75",
    "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=75",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=75",
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=75",
    "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=75",
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=75",
    "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=75",
  ],
  remote: [
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=75",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=75",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=75",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=75",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=75",
    "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&q=75",
    "https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=800&q=75",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=75",
    "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=800&q=75",
    "https://images.unsplash.com/photo-1596496181871-9681eacf9764?w=800&q=75",
    "https://images.unsplash.com/photo-1547032175-7fc8c7bd15b3?w=800&q=75",
    "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?w=800&q=75",
  ],
  general: [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=75",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=75",
    "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&q=75",
    "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=800&q=75",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=75",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=75",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=75",
    "https://images.unsplash.com/photo-1530099486328-e021101a494a?w=800&q=75",
    "https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=800&q=75",
    "https://images.unsplash.com/photo-1516321165247-4aa89a48be55?w=800&q=75",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=75",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=75",
    "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=75",
    "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&q=75",
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=75",
    "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800&q=75",
    "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=75",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=75",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=75",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=75",
    "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=75",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=75",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=75",
    "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=75",
    "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800&q=75",
    "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800&q=75",
    "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=75",
    "https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?w=800&q=75",
    "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=800&q=75",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=75",
  ],
};

const OVERFLOW_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=75",
  "https://images.unsplash.com/photo-1499244571948-7ccddb3583f1?w=800&q=75",
  "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=800&q=75",
  "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&q=75",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=75",
  "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=800&q=75",
  "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=75",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=75",
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=75",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=75",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=75",
  "https://images.unsplash.com/photo-1525130413817-d45c1d127c42?w=800&q=75",
  "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&q=75",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=75",
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=75",
  "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=75",
  "https://images.unsplash.com/photo-1536104968055-4d61aa56f46a?w=800&q=75",
  "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=800&q=75",
  "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=75",
  "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800&q=75",
  "https://images.unsplash.com/photo-1545987796-200677ee1011?w=800&q=75",
  "https://images.unsplash.com/photo-1546074177-ffdda98d214f?w=800&q=75",
  "https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=800&q=75",
  "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800&q=75",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=75",
  "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&q=75",
  "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&q=75",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=75",
  "https://images.unsplash.com/photo-1561489413-985b06da5bee?w=800&q=75",
  "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&q=75",
  "https://images.unsplash.com/photo-1563461660947-507ef49e9c47?w=800&q=75",
  "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=800&q=75",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&q=75",
  "https://images.unsplash.com/photo-1567333971983-7e0869a82fb9?w=800&q=75",
  "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&q=75",
  "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=800&q=75",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=75",
  "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=800&q=75",
  "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&q=75",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=75",
  "https://images.unsplash.com/photo-1579226905180-636b76d96082?w=800&q=75",
  "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&q=75",
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=75",
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=75",
  "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?w=800&q=75",
  "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=75",
  "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800&q=75",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=75",
  "https://images.unsplash.com/photo-1471440671318-55bdbb772f93?w=800&q=75",
  "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=75",
  "https://images.unsplash.com/photo-1444961512736-d70698082503?w=800&q=75",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=75",
  "https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=800&q=75",
  "https://images.unsplash.com/photo-1423784346385-c1d4dac9893a?w=800&q=75",
  "https://images.unsplash.com/photo-1471086569966-db3eebc25a59?w=800&q=75",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=75",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=75",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=75",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=75",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=75",
  "https://images.unsplash.com/photo-1439853949212-36589f9f7458?w=800&q=75",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=75",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=75",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=75",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=75",
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=75",
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=75",
  "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&q=75",
  "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=75",
];

function detectBucket(post: IBlog): string {
  const hay = `${post.title} ${post.description ?? ""}`.toLowerCase();
  if (["resume", "cv", "cover letter"].some((k) => hay.includes(k))) return "resume";
  if (["interview", "hiring", "job offer"].some((k) => hay.includes(k))) return "interview";
  if (["salary", "negotiat", "pay", "compensation", "raise"].some((k) => hay.includes(k))) return "salary";
  if (["remote", "work from home", "wfh", "home office"].some((k) => hay.includes(k))) return "remote";
  return "general";
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL IMAGE OVERRIDES
// To change the image for any article:
//   1. Copy the slug from its URL  →  /blog/my-article-slug  →  "my-article-slug"
//   2. Go to unsplash.com, find a photo, right-click the image → Copy image address
//   3. Add one line below:  "my-article-slug": "https://images.unsplash.com/photo-XXXXX?w=800&q=75",
// That article will always show that image. Nothing else is affected.
// ─────────────────────────────────────────────────────────────────────────────
const MANUAL_OVERRIDES: Record<string, string> = {
  "how-to-write-a-resume-that-gets-interviews": "https://images.unsplash.com/photo-1522152302542-71a8e5172aa1?w=800&q=75",
  "software-engineering-career-roadmap-for-beginners": "https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=800&q=75",
  "freelancing-vs-full-time-employment": "https://images.unsplash.com/photo-1762330472769-cb8e6c8324d0?w=800&q=75",
  "how-to-start-a-career-in-digital-marketing": "https://images.unsplash.com/photo-1542903660-eedba2cda473?w=800&q=75",
  "cybersecurity-career-guide-for-beginners": "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=800&q=75",
  "how-to-become-a-data-analyst-in-2026":    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=75",
  "linkedin-profile-tips-that-get-recruiter-attention":    "https://images.unsplash.com/photo-1716638013730-11d8f264bfa3?w=800&q=75",
  "how-to-find-legitimate-work-from-home-jobs":    "https://images.unsplash.com/photo-1773332585687-85beb4da71ab?w=800&q=75",
  "future-proof-skills-in-demand-2030":    "https://images.unsplash.com/photo-1689172577757-88b88a9cf18a?w=800&q=75",
  "career-planning-guide-for-students":    "https://images.unsplash.com/photo-1428591850870-56971c19c3d9?w=800&q=75",
  "project-management-career-guide":    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=75",
  "cloud-computing-careers-explained":    "https://images.unsplash.com/photo-1667984390553-7f439e6ae401?w=800&q=75",
  "how-to-switch-careers-successfully":    "https://images.unsplash.com/photo-1659356874404-934e567df530?w=800&q=75",
  "how-to-get-a-remote-job-with-no-experience":    "https://images.unsplash.com/photo-1698891668251-fd6974673f82?w=800&q=75",
  "best-countries-for-remote-workers":    "https://images.unsplash.com/photo-1596457596405-2c3ea4502d67?w=800&q=75",
  "remote-work-vs-office-work-which-is-better":    "https://images.unsplash.com/photo-1503945438517-f65904a52ce6?w=800&q=75",
  "best-ai-tools-for-job-seekers":    "https://images.unsplash.com/photo-1762330467572-5199bc772a20?w=800&q=75",
  "resume-mistakes-that-instantly-reject-candidates":    "https://images.unsplash.com/photo-1698047681432-006d2449c631?w=800&q=75",
  "how-to-get-your-first-programming-job":    "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=75",
  // "project-management-career-guide":    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=75",
  // "project-management-career-guide":    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=75",
};

// Returns a Map<postId, imageUrl> — every post gets a globally unique URL.
// Manual overrides are applied first and their URLs are pre-marked as used
// so the auto-assignment pool never picks the same URL for another article.
function buildImageMap(blogs: IBlog[]): Map<string, string> {
  // Flat pool: all topic images + overflow, in a stable order
  const pool: string[] = [
    ...TOPIC_IMAGES.resume,
    ...TOPIC_IMAGES.interview,
    ...TOPIC_IMAGES.salary,
    ...TOPIC_IMAGES.remote,
    ...TOPIC_IMAGES.general,
    ...OVERFLOW_IMAGES,
  ];

  // Simple hash: sum of char codes in the _id string, mod pool length
  function hashId(id: string): number {
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return sum % pool.length;
  }

  const usedIndices = new Set<number>();

  const map = new Map<string, string>();

  for (const post of blogs) {
    // Manual override wins — slug-based, unaffected by pool logic
    if (MANUAL_OVERRIDES[post.slug]) {
      map.set(post._id, MANUAL_OVERRIDES[post.slug]);
      continue;
    }

    // Start at the deterministic hash index, walk forward on collision
    let idx = hashId(post._id);
    let attempts = 0;
    while (usedIndices.has(idx) && attempts < pool.length) {
      idx = (idx + 1) % pool.length;
      attempts++;
    }

    // Absolute fallback if pool is somehow exhausted (shouldn't happen)
    const url = attempts < pool.length ? pool[idx] : pool[hashId(post._id)];
    usedIndices.add(idx);
    map.set(post._id, url);
  }

  return map;
}

// 4 categories — filter by keyword match against title + description
const CATEGORIES = [
  { label: "All",        href: "/blog",                  keywords: [] },
  { label: "Resume",     href: "/blog?topic=resume",     keywords: ["resume", "cv", "cover letter"] },
  { label: "Interview",  href: "/blog?topic=interview",  keywords: ["interview", "hiring", "job offer"] },
  { label: "Career",     href: "/blog?topic=career",     keywords: ["career", "salary", "negotiat", "promotion", "remote", "work from home", "job search", "linkedin"] },
] as const;

export const metadata = {
  title: "Career Blog | Jobs Home Online",
  description: "Career advice, resume tips, interview preparation, and hiring insights for working professionals.",
};

interface PageProps {
  searchParams?: Promise<{ topic?: string }>;
}

function matchesTopic(post: IBlog, topic: string): boolean {
  const cat = CATEGORIES.find((c) => c.href.includes(`topic=${topic}`));
  if (!cat || cat.keywords.length === 0) return true;
  const haystack = `${post.title} ${post.description ?? ""}`.toLowerCase();
  return cat.keywords.some((kw) => haystack.includes(kw));
}

export default async function BlogPage({ searchParams }: PageProps) {
  let blogs: IBlog[] = [];

  try {
    await connectMongo();
    const raw = await Blog.find({}).sort({ createdAt: -1 }).lean();
    blogs = raw.map((b: any) => ({ ...b, _id: b._id.toString() }));
  } catch (err) {
    console.error("BlogPage DB error:", err);
  }

  const { topic: activeTopic = "" } = (await searchParams) ?? {};

  const filtered = activeTopic
    ? blogs.filter((p) => matchesTopic(p, activeTopic))
    : blogs;

  const imageMap = buildImageMap(blogs);

  const featured  = filtered[0] ?? null;
  const secondary = filtered.slice(1, 3);
  const rest      = filtered.slice(3);

  const activeLabel = CATEGORIES.find((c) =>
    activeTopic ? c.href.includes(`topic=${activeTopic}`) : c.label === "All"
  )?.label ?? "All";

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">
                Career Blog
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Insights to move your career forward.
              </h1>
              <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">
                Expert guides on resumes, interviews, salaries, and more — updated regularly.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <span className="text-2xl font-black text-blue-700 tabular-nums">{blogs.length}</span>
              <span className="text-xs font-semibold text-blue-500 leading-tight">Articles<br />Published</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-7 flex-wrap">
            {CATEGORIES.map((cat) => {
              const isActive = cat.label === activeLabel;
              return (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
            {activeTopic && (
              <Link
                href="/blog"
                className="ml-auto text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear filter ×
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-gray-500">No articles found for this topic. Try another category.</p>
            <Link href="/blog" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
              View all articles →
            </Link>
          </div>
        ) : (
          <div className="py-10 space-y-12">

            {featured && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Editor's Pick</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <Link
                  href={`/blog/${featured.slug ?? "#"}`}
                  className="group block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="relative h-56 sm:h-72 overflow-hidden bg-slate-200">
                    <img
                      src={imageMap.get(featured._id)}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/15 to-transparent" />
                    <span className="absolute top-5 left-6 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                      Editor's Pick
                    </span>
                  </div>
                  <div className="p-7 md:p-9">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug max-w-3xl">
                      {featured.title}
                    </h2>
                    {featured.description && (
                      <p className="mt-3 text-gray-500 text-sm leading-relaxed max-w-2xl line-clamp-3">
                        {featured.description}
                      </p>
                    )}
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700 group-hover:gap-3 transition-all">
                      Read Article
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </section>
            )}

            {secondary.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Top Reads</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  {secondary.map((post) => (
                    <Link
                      key={post._id}
                      href={`/blog/${post.slug ?? "#"}`}
                      className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="relative h-44 overflow-hidden bg-gray-100">
                        <img
                          src={imageMap.get(post._id)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-3">
                          Career Guide
                        </span>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug text-base flex-1 line-clamp-2">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="mt-2.5 text-sm text-gray-500 leading-relaxed line-clamp-2">
                            {post.description}
                          </p>
                        )}
                        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 group-hover:gap-2.5 transition-all">
                          Read Article
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">More Articles</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((post) => (
                    <Link
                      key={post._id}
                      href={`/blog/${post.slug ?? "#"}`}
                      className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="relative h-36 overflow-hidden bg-gray-100">
                        <img
                          src={imageMap.get(post._id)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 block">
                          Career Guide
                        </span>
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors flex-1">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {post.description}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:gap-2 transition-all">
                          Read Article
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>

      <NewsletterSection />
    </div>
  );
}