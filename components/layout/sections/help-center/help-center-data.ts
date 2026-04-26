// Types
export interface HCCategory {
  id: number;
  name: string;
  html_url: string;
}

export interface HCSection {
  id: number;
  category_id: number;
  name: string;
  html_url: string;
  article_count: number;
  view_all_articles?: string;
}

export interface HCArticle {
  id: number;
  section_id: number;
  title: string;
  html_url: string;
  created_at: string;
  edited_at: string;
  vote_count: number;
  promoted?: boolean;
  author: { name: string; avatar_url: string; agent: boolean };
}

// Categories
export const categories: HCCategory[] = [
  { id: 12777342059164, name: "Getting Started with Saily", html_url: "/hc/en-us/categories/12777342059164-Getting-Started-with-Saily" },
  { id: 12777403128348, name: "Plans and Payments", html_url: "/hc/en-us/categories/12777403128348-Plans-and-Payments" },
  { id: 12777374878876, name: "Troubleshooting", html_url: "/hc/en-us/categories/12777374878876-Troubleshooting" },
  { id: 12777421951388, name: "FAQ", html_url: "/hc/en-us/categories/12777421951388-FAQ" },
];

// Sections
export const sections: HCSection[] = [
  { id: 12777423695260, category_id: 12777342059164, name: "Setting up", html_url: "/hc/en-us/sections/12777423695260-Setting-up", article_count: 10, view_all_articles: "See all 10 articles" },
  { id: 12777425221788, category_id: 12777342059164, name: "Using Saily eSIM", html_url: "/hc/en-us/sections/12777425221788-Using-Saily-eSIM", article_count: 12, view_all_articles: "See all 12 articles" },
  { id: 12777432669084, category_id: 12777342059164, name: "Device compatibility", html_url: "/hc/en-us/sections/12777432669084-Device-compatibility", article_count: 2 },
  { id: 12777438435100, category_id: 12777403128348, name: "Payments", html_url: "/hc/en-us/sections/12777438435100-Payments", article_count: 5 },
  { id: 12777437256092, category_id: 12777403128348, name: "Plans", html_url: "/hc/en-us/sections/12777437256092-Plans", article_count: 8, view_all_articles: "See all 8 articles" },
  { id: 12838756374812, category_id: 12777374878876, name: "Find an answer", html_url: "/hc/en-us/sections/12838756374812-Find-an-answer", article_count: 18, view_all_articles: "See all 18 articles" },
  { id: 12777472075420, category_id: 12777421951388, name: "Saily eSIM functions", html_url: "/hc/en-us/sections/12777472075420-Saily-eSIM-functions", article_count: 2 },
  { id: 12777481377564, category_id: 12777421951388, name: "eSIM basics", html_url: "/hc/en-us/sections/12777481377564-eSIM-basics", article_count: 10, view_all_articles: "See all 10 articles" },
  { id: 12777480667804, category_id: 12777421951388, name: "About Saily", html_url: "/hc/en-us/sections/12777480667804-About-Saily", article_count: 6 },
];

// Articles - Getting Started > Setting up
export const articles: HCArticle[] = [
  { id: 23595125732508, section_id: 12777423695260, title: "What is Apple's \"Hide My Email\" and where to find your Saily account email?", html_url: "/hc/en-us/articles/23595125732508", created_at: "2025-11-14T09:21:17Z", edited_at: "2025-11-17T14:19:22Z", vote_count: 66, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 16927103076892, section_id: 12777423695260, title: "How do I install the Saily App on my device?", html_url: "/hc/en-us/articles/16927103076892", created_at: "2024-11-15T11:22:56Z", edited_at: "2026-02-06T08:47:21Z", vote_count: 3039, author: { name: "System", avatar_url: "", agent: true } },
  { id: 16924522721180, section_id: 12777423695260, title: "How to log in to a Saily account", html_url: "/hc/en-us/articles/16924522721180", created_at: "2024-11-15T09:36:01Z", edited_at: "2024-11-27T10:26:37Z", vote_count: 1675, author: { name: "System", avatar_url: "", agent: true } },
  { id: 15698622789148, section_id: 12777423695260, title: "How to create a Saily account", html_url: "/hc/en-us/articles/15698622789148", created_at: "2024-09-02T13:39:51Z", edited_at: "2024-11-27T11:25:52Z", vote_count: 1434, author: { name: "System", avatar_url: "", agent: true } },
  { id: 15697852689052, section_id: 12777423695260, title: "How to use a Saily coupon/voucher code", html_url: "/hc/en-us/articles/15697852689052", created_at: "2024-09-02T13:07:47Z", edited_at: "2025-09-23T13:01:19Z", vote_count: 502, author: { name: "System", avatar_url: "", agent: true } },
  { id: 13798863550492, section_id: 12777423695260, title: "Does Saily provide bundle/regional plans?", html_url: "/hc/en-us/articles/13798863550492", created_at: "2024-05-02T01:00:47Z", edited_at: "2024-11-21T12:53:56Z", vote_count: 628, author: { name: "Eddie Cade", avatar_url: "", agent: true } },
  // Getting Started > Using Saily eSIM
  { id: 21484709818524, section_id: 12777425221788, title: "Saily usage and commonly asked questions", html_url: "/hc/en-us/articles/21484709818524", created_at: "2025-08-01T11:19:41Z", edited_at: "2025-08-01T11:24:16Z", vote_count: 1536, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 21480877804572, section_id: 12777425221788, title: "Saily basics and functionality", html_url: "/hc/en-us/articles/21480877804572", created_at: "2025-08-01T08:34:27Z", edited_at: "2025-08-12T07:37:17Z", vote_count: 624, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 20269649356828, section_id: 12777425221788, title: "How do I get an additional Saily eSIM?", html_url: "/hc/en-us/articles/20269649356828", created_at: "2025-05-26T12:49:18Z", edited_at: "2025-12-19T13:52:57Z", vote_count: 275, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 20105542335132, section_id: 12777425221788, title: "What is Saily Auto Top-Up?", html_url: "/hc/en-us/articles/20105542335132", created_at: "2025-05-16T11:14:29Z", edited_at: "2025-05-16T13:12:47Z", vote_count: 121, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 17464798496796, section_id: 12777425221788, title: "What is Saily Ad Blocker?", html_url: "/hc/en-us/articles/17464798496796", created_at: "2024-12-16T14:59:23Z", edited_at: "2026-04-16T09:24:11Z", vote_count: 284, author: { name: "System", avatar_url: "", agent: true } },
  { id: 17464251910428, section_id: 12777425221788, title: "What are Saily virtual locations?", html_url: "/hc/en-us/articles/17464251910428", created_at: "2024-12-16T14:36:40Z", edited_at: "2025-04-09T07:24:17Z", vote_count: 902, author: { name: "System", avatar_url: "", agent: true } },
  // Getting Started > Device compatibility
  { id: 13318373425180, section_id: 12777432669084, title: "How to check if my device is eSIM compatible?", html_url: "/hc/en-us/articles/13318373425180", created_at: "2024-03-31T00:35:21Z", edited_at: "2025-11-04T09:13:37Z", vote_count: 937, author: { name: "Eddie Cade", avatar_url: "", agent: true } },
  { id: 12822397552028, section_id: 12777432669084, title: "Can I use Saily if my device doesn't support eSIM?", html_url: "/hc/en-us/articles/12822397552028", created_at: "2024-02-27T08:39:25Z", edited_at: "2025-02-21T14:07:21Z", vote_count: 874, author: { name: "Hugh Bell", avatar_url: "", agent: true } },
  // Plans and Payments > Payments
  { id: 16420576170652, section_id: 12777438435100, title: "What is Saily's refund policy?", html_url: "/hc/en-us/articles/16420576170652", created_at: "2024-10-16T10:45:28Z", edited_at: "2025-08-06T10:09:01Z", vote_count: 1551, author: { name: "System", avatar_url: "", agent: true } },
  { id: 17026627259164, section_id: 12777438435100, title: "How to change your fiscal region when purchasing a plan", html_url: "/hc/en-us/articles/17026627259164", created_at: "2024-11-21T12:55:40Z", edited_at: "2025-02-03T09:28:45Z", vote_count: 479, author: { name: "System", avatar_url: "", agent: true } },
  { id: 16516513668636, section_id: 12777438435100, title: "How to get an invoice?", html_url: "/hc/en-us/articles/16516513668636", created_at: "2024-10-22T11:42:32Z", edited_at: "2025-06-27T11:16:59Z", vote_count: 630, author: { name: "System", avatar_url: "", agent: true } },
  { id: 12823175142684, section_id: 12777438435100, title: "How much does an eSIM cost?", html_url: "/hc/en-us/articles/12823175142684", created_at: "2024-02-27T09:16:51Z", edited_at: "2025-04-17T06:54:41Z", vote_count: 846, author: { name: "Hugh Bell", avatar_url: "", agent: true } },
  { id: 12823216658204, section_id: 12777438435100, title: "Can I top up an eSIM?", html_url: "/hc/en-us/articles/12823216658204", created_at: "2024-02-27T09:18:02Z", edited_at: "2026-01-05T05:36:04Z", vote_count: 1100, author: { name: "Hugh Bell", avatar_url: "", agent: true } },
  // Plans and Payments > Plans
  { id: 25455420492572, section_id: 12777437256092, title: "What is Saily Ultra?", html_url: "/hc/en-us/articles/25455420492572", created_at: "2026-02-11T15:22:52Z", edited_at: "2026-02-23T09:51:34Z", vote_count: 16, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 21484628749084, section_id: 12777437256092, title: "Saily data plan management", html_url: "/hc/en-us/articles/21484628749084", created_at: "2025-08-01T11:14:40Z", edited_at: "2025-08-01T11:14:56Z", vote_count: 495, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 16518272109212, section_id: 12777437256092, title: "Can I check my Saily eSIM balance?", html_url: "/hc/en-us/articles/16518272109212", created_at: "2024-10-22T13:01:52Z", edited_at: "2024-11-19T14:48:41Z", vote_count: 618, author: { name: "System", avatar_url: "", agent: true } },
  { id: 12823160758044, section_id: 12777437256092, title: "Does an eSIM require a data plan?", html_url: "/hc/en-us/articles/12823160758044", created_at: "2024-02-27T09:16:20Z", edited_at: "2025-10-22T07:45:59Z", vote_count: 778, author: { name: "Hugh Bell", avatar_url: "", agent: true } },
  { id: 12823108536476, section_id: 12777437256092, title: "How to check if my Saily eSIM is activated?", html_url: "/hc/en-us/articles/12823108536476", created_at: "2024-02-27T09:14:01Z", edited_at: "2025-09-24T11:16:07Z", vote_count: 1325, author: { name: "Hugh Bell", avatar_url: "", agent: true } },
  { id: 12823154589724, section_id: 12777437256092, title: "How can I check my current Saily data usage?", html_url: "/hc/en-us/articles/12823154589724", created_at: "2024-02-27T09:14:24Z", edited_at: "2025-04-16T09:06:26Z", vote_count: 470, author: { name: "Hugh Bell", avatar_url: "", agent: true } },
  // Troubleshooting > Find an answer
  { id: 15511041342748, section_id: 12838756374812, title: "How to transfer Saily eSIM from iOS to another device", html_url: "/hc/en-us/articles/15511041342748", created_at: "2024-08-21T11:43:28Z", edited_at: "2025-12-19T10:38:42Z", promoted: true, vote_count: 542, author: { name: "System", avatar_url: "", agent: true } },
  { id: 25332679316252, section_id: 12838756374812, title: "How to disable background services", html_url: "/hc/en-us/articles/25332679316252", created_at: "2026-02-06T06:58:21Z", edited_at: "2026-02-06T09:29:33Z", vote_count: 17, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 25026748831644, section_id: 12838756374812, title: "How to check the latest Saily app version and keep it up-to-date?", html_url: "/hc/en-us/articles/25026748831644", created_at: "2026-01-23T12:10:54Z", edited_at: "2026-01-26T08:04:59Z", vote_count: 1, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 20793044376092, section_id: 12838756374812, title: "How to avoid roaming charges while using Saily?", html_url: "/hc/en-us/articles/20793044376092", created_at: "2025-06-25T12:33:37Z", edited_at: "2025-06-26T14:02:43Z", vote_count: 466, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 17770364559516, section_id: 12838756374812, title: "How to reach Saily customer support", html_url: "/hc/en-us/articles/17770364559516", created_at: "2025-01-06T11:59:42Z", edited_at: "2025-11-11T09:32:16Z", vote_count: 537, author: { name: "System", avatar_url: "", agent: true } },
  { id: 16931801671068, section_id: 12838756374812, title: "How do I reinstall the Saily App on my device?", html_url: "/hc/en-us/articles/16931801671068", created_at: "2024-11-15T14:50:00Z", edited_at: "2025-04-09T07:27:03Z", vote_count: 351, author: { name: "System", avatar_url: "", agent: true } },
  // FAQ > Saily eSIM functions
  { id: 25700495342492, section_id: 12777472075420, title: "What is Saily fast-track service?", html_url: "/hc/en-us/articles/25700495342492", created_at: "2026-02-23T14:15:35Z", edited_at: "2026-03-12T10:49:20Z", vote_count: 15, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 13718527919900, section_id: 12777472075420, title: "Will iMessage/WhatsApp work with an eSIM?", html_url: "/hc/en-us/articles/13718527919900", created_at: "2024-04-26T01:42:42Z", edited_at: "2025-06-27T11:18:10Z", vote_count: 1283, author: { name: "Eddie Cade", avatar_url: "", agent: true } },
  // FAQ > eSIM basics
  { id: 24617942070556, section_id: 12777481377564, title: "What us ICCID number and why is it important?", html_url: "/hc/en-us/articles/24617942070556", created_at: "2026-01-05T06:47:48Z", edited_at: "2026-01-09T12:01:39Z", vote_count: 41, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 24002974854684, section_id: 12777481377564, title: "How do I install the Saily eSIM on iOS?", html_url: "/hc/en-us/articles/24002974854684", created_at: "2025-12-03T11:33:10Z", edited_at: "2025-12-03T12:00:05Z", vote_count: 77, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 23999871567516, section_id: 12777481377564, title: "How do I install the Saily eSIM on an Android?", html_url: "/hc/en-us/articles/23999871567516", created_at: "2025-12-03T09:46:44Z", edited_at: "2025-12-03T11:20:22Z", vote_count: 57, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 16927592788636, section_id: 12777481377564, title: "Which devices support eSIMs?", html_url: "/hc/en-us/articles/16927592788636", created_at: "2024-11-15T11:44:35Z", edited_at: "2025-10-29T12:53:27Z", vote_count: 401, author: { name: "System", avatar_url: "", agent: true } },
  { id: 16747226859164, section_id: 12777481377564, title: "Can I receive phone calls on my primary number while using Saily eSIM?", html_url: "/hc/en-us/articles/16747226859164", created_at: "2024-11-05T11:08:26Z", edited_at: "2024-11-13T14:10:28Z", vote_count: 1065, author: { name: "System", avatar_url: "", agent: true } },
  { id: 15751572038300, section_id: 12777481377564, title: "How to activate my Saily eSIM?", html_url: "/hc/en-us/articles/15751572038300", created_at: "2024-09-05T09:10:28Z", edited_at: "2026-02-06T09:06:54Z", vote_count: 4291, author: { name: "System", avatar_url: "", agent: true } },
  // FAQ > About Saily
  { id: 22255302743964, section_id: 12777480667804, title: "Supported fast-track destinations", html_url: "/hc/en-us/articles/22255302743964", created_at: "2025-09-10T12:28:58Z", edited_at: "2026-04-09T07:37:42Z", vote_count: 46, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 21926290717980, section_id: 12777480667804, title: "Supported lounge destinations", html_url: "/hc/en-us/articles/21926290717980", created_at: "2025-08-25T07:12:18Z", edited_at: "2026-01-09T10:00:18Z", vote_count: 41, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 19043096130332, section_id: 12777480667804, title: "Does Saily have an affiliate program?", html_url: "/hc/en-us/articles/19043096130332", created_at: "2025-03-17T11:12:06Z", edited_at: "2025-03-17T11:38:12Z", vote_count: 39, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 18420316369692, section_id: 12777480667804, title: "How does Saily eSIMs for business work?", html_url: "/hc/en-us/articles/18420316369692", created_at: "2025-02-10T12:48:49Z", edited_at: "2025-02-12T08:03:15Z", vote_count: 69, author: { name: "Help Center", avatar_url: "", agent: true } },
  { id: 16929378623004, section_id: 12777480667804, title: "Which languages does Saily support?", html_url: "/hc/en-us/articles/16929378623004", created_at: "2024-11-15T13:04:36Z", edited_at: "2025-01-08T16:22:11Z", vote_count: 7, author: { name: "System", avatar_url: "", agent: true } },
  { id: 14262137198236, section_id: 12777480667804, title: "Does Saily have a referral program?", html_url: "/hc/en-us/articles/14262137198236", created_at: "2024-06-01T19:44:57Z", edited_at: "2026-01-19T09:00:06Z", vote_count: 72, author: { name: "Eddie Cade", avatar_url: "", agent: true } },
];

// Helper: get recent articles sorted by created_at desc
export function getRecentArticles(count = 5): (HCArticle & { sectionName: string })[] {
  return [...articles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, count)
    .map((article) => {
      const section = sections.find((s) => s.id === article.section_id);
      return { ...article, sectionName: section?.name ?? "" };
    });
}

// Helper: get sections for a category
export function getSectionsForCategory(categoryId: number): HCSection[] {
  return sections.filter((s) => s.category_id === categoryId);
}

// Helper: get articles for a section
export function getArticlesForSection(sectionId: number): HCArticle[] {
  return articles.filter((a) => a.section_id === sectionId);
}
