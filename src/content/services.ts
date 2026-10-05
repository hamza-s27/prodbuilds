import type { Service } from "./types";

// Legacy order (matches the old site and its structured data). Display order
// follows `layer.depth`; see orderedByDepth().
export const services: readonly Service[] = [
  {
    id: "backend",
    tag: "Backend",
    title: "APIs & backend systems",
    schemaName: "APIs and backend systems",
    summary:
      "Services, APIs and data models in Java, Spring Boot and Node.js, designed to grow without a rewrite.",
    intro:
      "The part of your product users never see and always feel. We design services, APIs and data models that stay simple as features pile up, so the next change doesn’t mean a rewrite.",
    included: [
      "API design and implementation, with clear contracts and versioning",
      "Data models on PostgreSQL, MySQL or Firestore",
      "Background and scheduled jobs that run once, on time",
      "Integrations with payment, messaging and partner APIs",
      "Automated tests at every level: unit, integration and end-to-end",
    ],
    stack: [
      "Java",
      "Spring Boot",
      "JPA",
      "Node.js",
      "NestJS",
      "PostgreSQL",
      "MySQL",
      "Firestore",
      "Elasticsearch",
    ],
    relatedPostSlugs: ["spring-boot-scheduled-jobs-multiple-instances"],
    layer: { depth: 1, hud: "L1 · Interface · API" },
  },
  {
    id: "scaling",
    tag: "Scale",
    title: "Scaling & modernisation",
    schemaName: "Scaling and modernisation",
    summary:
      "Caching, queues and stateless services that steady a struggling system, and a way out of the monolith that isn’t a rewrite.",
    intro:
      "When a system slows down at peak times, or every release feels risky, the answer is rarely a rewrite. We find the bottlenecks and fix them in place, one measurable step at a time.",
    included: [
      "Performance audits of queries, data access and hot paths",
      "Caching with Redis, and at the edge with Cloudflare",
      "Moving in-memory caches and queues to Redis, RabbitMQ or Kafka, so services can scale out",
      "Stateless, containerised services that run safely on many instances",
      "Breaking up a monolith gradually, behind a gateway",
      "Stabilising a system you’ve inherited",
    ],
    stack: ["Redis", "RabbitMQ", "Kafka", "Docker", "Kubernetes", "Cloudflare"],
    relatedPostSlugs: ["spring-boot-scheduled-jobs-multiple-instances", "jobrunr-skipping-recurring-jobs"],
    layer: { depth: 2, hud: "L2 · Throughput · Cache + queue" },
  },
  {
    id: "cloud",
    tag: "Cloud",
    title: "Cloud infrastructure",
    schemaName: "Cloud infrastructure",
    summary:
      "AWS, Docker and Kubernetes set up properly: deployments, CDN, domains and the operational basics.",
    intro:
      "Infrastructure that’s boring in the best way: reproducible, observable and sized for where you are now, not where you might be in five years.",
    included: [
      "AWS setup: EC2, Lambda, databases and storage",
      "Docker images and Kubernetes deployments",
      "CDN, DNS and domains, including Cloudflare",
      "A release process you can repeat, and production support",
      "Monitoring and health checks that tell you before your users do",
    ],
    stack: ["AWS EC2", "AWS Lambda", "Docker", "Kubernetes", "Cloudflare", "Firebase"],
    relatedPostSlugs: [],
    layer: { depth: 4, hud: "L4 · Bedrock · Infra" },
  },
  {
    id: "product",
    tag: "Product",
    title: "MVPs & web apps",
    schemaName: "MVPs and web apps",
    summary:
      "React and Node.js products, and real-time features on Firebase, from first release to production.",
    intro:
      "A first version that’s quick to ship and built so it doesn’t have to be thrown away, with features that feel instant.",
    included: [
      "MVPs and web apps with React and Node.js",
      "Real-time features on Firebase: live updates, bidding and notifications",
      "Backends and APIs for mobile apps",
      "Sign-in, roles and admin tools",
    ],
    stack: ["React", "Node.js", "NestJS", "MongoDB", "Firebase", "Firestore"],
    relatedPostSlugs: ["firebase-auction-close-on-time"],
    layer: { depth: 0, hud: "L0 · Surface · Product" },
  },
  {
    id: "automation",
    tag: "Automation",
    title: "Automation & integrations",
    schemaName: "Automation and integrations",
    summary:
      "Web automation, background jobs and third-party integrations that run reliably and on schedule.",
    intro:
      "Work that should happen without anyone clicking a button: browser automation, scheduled processing, and systems that talk to each other reliably.",
    included: [
      "Web and browser automation (RPA) with Selenium",
      "Scheduled and background jobs with retries and alerts",
      "Event-driven workflows on queues",
      "Integrations between your systems and third-party APIs",
    ],
    stack: ["Selenium", "Spring Boot", "Quartz", "JobRunr", "RabbitMQ", "Kafka"],
    relatedPostSlugs: ["jobrunr-skipping-recurring-jobs"],
    layer: { depth: 3, hud: "L3 · Workers · Jobs + integrations" },
  },
  {
    id: "ai",
    tag: "AI",
    title: "AI integrations",
    schemaName: "AI integrations",
    summary:
      "LLM features and MCP servers that connect AI assistants to your data and tools, with limits you control.",
    intro:
      "AI features that are useful and safe to run: connected to your real data and systems, with clear limits on what they can see and do.",
    included: [
      "LLM features inside your product: search, summaries, drafting and extraction",
      "MCP servers that give AI assistants controlled access to your tools and data",
      "Guardrails: permissions, logging and cost limits",
    ],
    stack: ["MCP", "LLM APIs", "Java", "Node.js"],
    relatedPostSlugs: [],
    layer: { depth: null, hud: "XL · AI · Cross-cutting" },
  },
];
