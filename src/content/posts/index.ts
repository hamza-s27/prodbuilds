import type { PostMeta } from "../types";

// Newest first; this order drives the blog index, home cards and feed.
export const posts: readonly PostMeta[] = [
  {
    slug: "spring-boot-scheduled-jobs-multiple-instances",
    title: "Why your Spring Boot @Scheduled job runs twice (and what actually stops it)",
    seoTitle: "Spring Boot @Scheduled Running Twice on Multiple Instances? What Stops It",
    description:
      "Add a second instance and every Spring Boot @Scheduled job runs twice. We tested ShedLock six ways: what stops duplicates, and the two settings that decide it.",
    lead: "We ran two copies of one app through six setups and counted every duplicate. The fix is one library, plus two settings that are easy to get wrong.",
    teaser:
      "Add a second instance and every @Scheduled job runs twice. We counted the duplicates across six setups: ShedLock fixes it, but only with two settings that are easy to get wrong.",
    topic: "Spring Boot",
    datePublished: "2026-09-26",
    dateModified: "2026-09-26",
    readMinutes: 6,
    keywords: [
      "Spring Boot",
      "@Scheduled",
      "ShedLock",
      "distributed scheduling",
      "horizontal scaling",
      "cron jobs",
    ],
    wordCount: 1393,
    breadcrumbName: "@Scheduled jobs running twice",
  },
  {
    slug: "jobrunr-skipping-recurring-jobs",
    title: "The case of the vanishing JobRunr runs",
    seoTitle: "JobRunr Skipping Recurring Jobs? The Case of the Vanishing Runs",
    description:
      "Before 5.2.0, JobRunr could silently skip a recurring run after hours of uptime. The clue in the log, the gap behind it, and the lesson for any scheduler that polls.",
    lead: "Three schedulers counted the same every-minute job. Somewhere past 1,000 minutes, JobRunr fell one run behind, and nothing logged an error. The clue, the culprit and the fix.",
    teaser:
      "Spring, Quartz and JobRunr ran the same job every minute, and JobRunr quietly lost a run. The log line that gave it away, the gap behind it and the 5.2.0 fix.",
    topic: "JobRunr",
    datePublished: "2026-09-26",
    dateModified: "2026-09-26",
    readMinutes: 4,
    keywords: ["JobRunr", "recurring jobs", "skipped jobs", "time drift", "job scheduler", "Java"],
    wordCount: 1010,
    breadcrumbName: "Vanishing JobRunr runs",
  },
  {
    slug: "firebase-auction-close-on-time",
    title: "Going, going, gone: closing Firebase auctions on time",
    seoTitle: "Closing Firebase Auctions On Time with Cloud Tasks and Firestore",
    description:
      "Scheduled functions run at most once a minute. How to close Firebase auctions on time: the deadline in the bid transaction, one Cloud Task per auction, an idempotent close.",
    lead: "Bids pile up in the final seconds, and a once-a-minute cron job can’t keep up. The pattern we recommend: the deadline in the bid transaction, one Cloud Task per auction and a safety net.",
    teaser:
      "Bids pile up in the last seconds, and a once-a-minute sweep closes auctions late. The pattern we recommend: the deadline in the bid transaction, one Cloud Task per auction and an idempotent close.",
    topic: "Firebase",
    datePublished: "2026-09-26",
    dateModified: "2026-09-26",
    readMinutes: 7,
    keywords: [
      "Firebase",
      "Cloud Functions",
      "Cloud Tasks",
      "Firestore transactions",
      "auction",
      "task queue functions",
    ],
    wordCount: 1540,
    breadcrumbName: "Closing Firebase auctions on time",
  },
];

export function getPost(slug: string): PostMeta | undefined {
  return posts.find((post) => post.slug === slug);
}
