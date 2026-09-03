/**
 * Role & Requirements Reference Data — Server-only
 *
 * Deterministic career target roles and skill requirement definitions.
 * Maps skill requirements to existing Subject slugs (dsa, dbms, os, cn, oop, sql)
 * wherever applicable.
 */

import { db } from '@/lib/db'

export interface RoleDefinition {
  slug: string
  name: string
  category: string
  description: string
  requirements: Array<{
    skillName: string
    category: 'Programming' | 'CS Fundamentals' | 'Tools & Frameworks' | 'Interview Preparation'
    importance: 'REQUIRED' | 'RECOMMENDED'
    subjectSlug?: string
  }>
}

export const TARGET_ROLES: RoleDefinition[] = [
  {
    slug: 'software-engineer',
    name: 'Software Engineer',
    category: 'Software Engineering',
    description: 'Core engineering role focused on algorithmic problem solving, software architecture, data structures, and computer science fundamentals.',
    requirements: [
      { skillName: 'Data Structures & Algorithms', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dsa' },
      { skillName: 'Object-Oriented Programming', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'oop' },
      { skillName: 'Database Management Systems', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dbms' },
      { skillName: 'Operating Systems', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'os' },
      { skillName: 'Computer Networks', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'cn' },
      { skillName: 'SQL & Data Querying', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'sql' },
      { skillName: 'Git & Version Control', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'RESTful Web APIs', category: 'Tools & Frameworks', importance: 'RECOMMENDED' },
      { skillName: 'Technical Interview Practice', category: 'Interview Preparation', importance: 'REQUIRED' },
      { skillName: 'Behavioral Communication', category: 'Interview Preparation', importance: 'RECOMMENDED' },
    ],
  },
  {
    slug: 'frontend-developer',
    name: 'Frontend Developer',
    category: 'Software Engineering',
    description: 'Specialized role building responsive, interactive user interfaces with modern JavaScript/TypeScript, React, CSS architectures, and web performance.',
    requirements: [
      { skillName: 'JavaScript & TypeScript', category: 'Programming', importance: 'REQUIRED' },
      { skillName: 'React & Next.js Frameworks', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'HTML5, CSS3 & Responsive UI', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'Data Structures & Algorithms', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dsa' },
      { skillName: 'REST APIs & Async State', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'Object-Oriented & Functional JS', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'oop' },
      { skillName: 'Browser Performance & DOM', category: 'Tools & Frameworks', importance: 'RECOMMENDED' },
      { skillName: 'Frontend Testing & Debugging', category: 'Tools & Frameworks', importance: 'RECOMMENDED' },
      { skillName: 'Technical & System Design Interview', category: 'Interview Preparation', importance: 'REQUIRED' },
    ],
  },
  {
    slug: 'backend-developer',
    name: 'Backend Developer',
    category: 'Software Engineering',
    description: 'Server-side engineering role designing robust REST/GraphQL APIs, relational database schemas, microservices, authentication, and backend infrastructure.',
    requirements: [
      { skillName: 'Database Management Systems', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dbms' },
      { skillName: 'SQL & Database Indexing', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'sql' },
      { skillName: 'Data Structures & Algorithms', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dsa' },
      { skillName: 'Operating Systems & Concurrency', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'os' },
      { skillName: 'Computer Networks & HTTP/TCP', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'cn' },
      { skillName: 'Node.js / Python / Java', category: 'Programming', importance: 'REQUIRED' },
      { skillName: 'RESTful API Architecture', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'Object-Oriented Programming', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'oop' },
      { skillName: 'System Design Fundamentals', category: 'Tools & Frameworks', importance: 'RECOMMENDED' },
    ],
  },
  {
    slug: 'full-stack-developer',
    name: 'Full Stack Developer',
    category: 'Software Engineering',
    description: 'End-to-end web developer proficient across client-side UI, backend web servers, API security, relational databases, and application deployment.',
    requirements: [
      { skillName: 'JavaScript & TypeScript', category: 'Programming', importance: 'REQUIRED' },
      { skillName: 'React & Frontend Frameworks', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'Database Management Systems', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dbms' },
      { skillName: 'SQL Practice & Query Optimization', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'sql' },
      { skillName: 'Data Structures & Algorithms', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dsa' },
      { skillName: 'Object-Oriented Programming', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'oop' },
      { skillName: 'RESTful APIs & Backend Services', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'Computer Networks & Web Protocols', category: 'CS Fundamentals', importance: 'RECOMMENDED', subjectSlug: 'cn' },
      { skillName: 'Full Stack Deployment & Git', category: 'Tools & Frameworks', importance: 'REQUIRED' },
    ],
  },
  {
    slug: 'data-analyst',
    name: 'Data Analyst',
    category: 'Data & Analytics',
    description: 'Data professional extracting actionable insights using SQL queries, statistical quantitative analysis, Python/R, data visualization, and reporting.',
    requirements: [
      { skillName: 'SQL Practice & Complex Queries', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'sql' },
      { skillName: 'Quantitative Aptitude & Stats', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'aptitude' },
      { skillName: 'Database Management Systems', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dbms' },
      { skillName: 'Python for Data Analysis', category: 'Programming', importance: 'REQUIRED' },
      { skillName: 'Excel & Data Visualization', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'A/B Testing & Problem Solving', category: 'CS Fundamentals', importance: 'RECOMMENDED' },
    ],
  },
  {
    slug: 'data-scientist',
    name: 'Data Scientist',
    category: 'Data & Analytics',
    description: 'Advanced analytics role leveraging machine learning algorithms, statistical modeling, Python data stacks (NumPy/Pandas/Scikit), and big data processing.',
    requirements: [
      { skillName: 'Python Programming', category: 'Programming', importance: 'REQUIRED' },
      { skillName: 'AI & ML Fundamentals', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'ai-ml' },
      { skillName: 'Quantitative Aptitude & Linear Algebra', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'aptitude' },
      { skillName: 'SQL & Database Systems', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'sql' },
      { skillName: 'Data Structures & Algorithms', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dsa' },
      { skillName: 'Database Management Systems', category: 'CS Fundamentals', importance: 'RECOMMENDED', subjectSlug: 'dbms' },
    ],
  },
  {
    slug: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    category: 'Data & Analytics',
    description: 'Engineering specialist designing, training, evaluating, and deploying artificial intelligence models, neural networks, and scalable ML pipelines.',
    requirements: [
      { skillName: 'AI & ML Fundamentals', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'ai-ml' },
      { skillName: 'Python & ML Frameworks (PyTorch/TensorFlow)', category: 'Programming', importance: 'REQUIRED' },
      { skillName: 'Data Structures & Algorithms', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dsa' },
      { skillName: 'Quantitative Aptitude & Math', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'aptitude' },
      { skillName: 'Object-Oriented Programming', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'oop' },
      { skillName: 'SQL & Feature Engineering', category: 'Programming', importance: 'RECOMMENDED', subjectSlug: 'sql' },
    ],
  },
  {
    slug: 'devops-engineer',
    name: 'DevOps Engineer',
    category: 'Infrastructure & Cloud',
    description: 'Infrastructure automation role managing CI/CD pipelines, containerization (Docker/K8s), Linux systems, cloud services, and monitoring.',
    requirements: [
      { skillName: 'Operating Systems & Linux Shell', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'os' },
      { skillName: 'Computer Networks & Security', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'cn' },
      { skillName: 'Docker & Containerization', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'CI/CD Pipelines & Automation', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'Git & Version Control', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'Database Management Systems', category: 'CS Fundamentals', importance: 'RECOMMENDED', subjectSlug: 'dbms' },
    ],
  },
  {
    slug: 'mobile-developer',
    name: 'Mobile Developer',
    category: 'Software Engineering',
    description: 'Mobile application developer building native or cross-platform iOS and Android apps using React Native, Flutter, Kotlin, or Swift.',
    requirements: [
      { skillName: 'Mobile UI & App Architecture', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'JavaScript/TypeScript or Kotlin/Swift', category: 'Programming', importance: 'REQUIRED' },
      { skillName: 'Object-Oriented Programming', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'oop' },
      { skillName: 'Data Structures & Algorithms', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'dsa' },
      { skillName: 'REST APIs & Offline Storage', category: 'Tools & Frameworks', importance: 'REQUIRED' },
    ],
  },
  {
    slug: 'qa-engineer',
    name: 'QA Engineer',
    category: 'Quality & Testing',
    description: 'Software quality assurance engineer designing automated test suites, integration tests, bug tracking workflows, and API quality validation.',
    requirements: [
      { skillName: 'Test Automation & Testing Frameworks', category: 'Tools & Frameworks', importance: 'REQUIRED' },
      { skillName: 'JavaScript or Python Scripting', category: 'Programming', importance: 'REQUIRED' },
      { skillName: 'SQL & Database Verification', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'sql' },
      { skillName: 'Computer Networks & Web APIs', category: 'CS Fundamentals', importance: 'RECOMMENDED', subjectSlug: 'cn' },
      { skillName: 'Bug Tracking & QA Methodologies', category: 'Tools & Frameworks', importance: 'REQUIRED' },
    ],
  },
  {
    slug: 'cybersecurity-analyst',
    name: 'Cybersecurity Analyst',
    category: 'Infrastructure & Cloud',
    description: 'Information security practitioner analyzing system vulnerabilities, network traffic, encryption protocols, and incident response.',
    requirements: [
      { skillName: 'Computer Networks & Protocols', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'cn' },
      { skillName: 'Operating Systems & Security Hardening', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'os' },
      { skillName: 'Cryptography & Web Security', category: 'CS Fundamentals', importance: 'REQUIRED' },
      { skillName: 'SQL Injection & DB Protection', category: 'Programming', importance: 'RECOMMENDED', subjectSlug: 'sql' },
      { skillName: 'Python/Bash Security Scripting', category: 'Programming', importance: 'REQUIRED' },
    ],
  },
  {
    slug: 'product-analyst',
    name: 'Product Analyst',
    category: 'Data & Analytics',
    description: 'Product-focused analyst bridging user behavior metrics, SQL analytics, product growth metrics, and technical requirements.',
    requirements: [
      { skillName: 'SQL Querying & Product Analytics', category: 'Programming', importance: 'REQUIRED', subjectSlug: 'sql' },
      { skillName: 'Quantitative Aptitude & Metrics', category: 'CS Fundamentals', importance: 'REQUIRED', subjectSlug: 'aptitude' },
      { skillName: 'Database Management Systems', category: 'CS Fundamentals', importance: 'RECOMMENDED', subjectSlug: 'dbms' },
      { skillName: 'Product Strategy & Problem Solving', category: 'Interview Preparation', importance: 'REQUIRED' },
    ],
  },
]

/**
 * Seed or update deterministic TargetRole & RoleRequirement records in database.
 * Idempotent — safe to run multiple times without duplicating data.
 */
export async function seedRolesData() {
  try {
    for (const roleDef of TARGET_ROLES) {
      const role = await db.targetRole.upsert({
        where: { slug: roleDef.slug },
        update: {
          name: roleDef.name,
          category: roleDef.category,
          description: roleDef.description,
          active: true,
        },
        create: {
          slug: roleDef.slug,
          name: roleDef.name,
          category: roleDef.category,
          description: roleDef.description,
          active: true,
        },
      })

      // Delete existing requirements for this role to re-seed cleanly
      await db.roleRequirement.deleteMany({ where: { roleId: role.id } })

      // Create updated requirements
      for (let i = 0; i < roleDef.requirements.length; i++) {
        const req = roleDef.requirements[i]
        await db.roleRequirement.create({
          data: {
            roleId: role.id,
            skillName: req.skillName,
            category: req.category,
            importance: req.importance,
            subjectSlug: req.subjectSlug || null,
            displayOrder: i + 1,
          },
        })
      }
    }
  } catch (err) {
    console.error('[seedRolesData] Error seeding target roles:', err)
  }
}
