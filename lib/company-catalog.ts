/**
 * Company Catalog & Requirements Overlay Reference Data — Server-only
 *
 * Provides deterministic, cautious starter data for supported companies.
 * Every company item is labeled with data confidence (COMMONLY_REPORTED, GENERAL_GUIDANCE, VERIFIED).
 * Includes seeder logic for PostgreSQL persistence.
 */

import { db } from '@/lib/db'

export interface CompanyRequirementDefinition {
  skillName: string
  category: 'APTITUDE' | 'CODING' | 'CORE_CS' | 'INTERVIEW' | 'BEHAVIORAL'
  importance: number // 1.0 = standard, 1.5 = high priority
  confidence: 'VERIFIED' | 'COMMONLY_REPORTED' | 'GENERAL_GUIDANCE' | 'USER_PROVIDED'
  displayOrder: number
}

export interface CompanyDefinition {
  slug: string
  name: string
  shortName?: string
  industry: string
  description: string
  dataSourceType: 'VERIFIED' | 'COMMONLY_REPORTED' | 'GENERAL_GUIDANCE' | 'USER_PROVIDED'
  requirements: CompanyRequirementDefinition[]
}

export const STARTER_COMPANIES: CompanyDefinition[] = [
  {
    slug: 'tcs',
    name: 'Tata Consultancy Services',
    shortName: 'TCS',
    industry: 'IT Services & Consulting',
    description: 'Global IT services, consulting, and business solutions leader known for National Qualifier Test (NQT) and role-based hiring.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Quantitative & Verbal Aptitude', category: 'APTITUDE', importance: 1.5, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Logical Reasoning & Puzzles', category: 'APTITUDE', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Fundamental Coding (C/C++/Java/Python)', category: 'CODING', importance: 1.5, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
      { skillName: 'SQL & Database Querying', category: 'CORE_CS', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 4 },
      { skillName: 'Object-Oriented Programming (OOP)', category: 'CORE_CS', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 5 },
      { skillName: 'Core CS (OS & Computer Networks)', category: 'CORE_CS', importance: 1.0, confidence: 'COMMONLY_REPORTED', displayOrder: 6 },
      { skillName: 'Technical & Resume Discussion', category: 'INTERVIEW', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 7 },
      { skillName: 'HR & Communication Skills', category: 'BEHAVIORAL', importance: 1.1, confidence: 'COMMONLY_REPORTED', displayOrder: 8 },
    ],
  },
  {
    slug: 'infosys',
    name: 'Infosys Limited',
    shortName: 'Infosys',
    industry: 'IT Services & Consulting',
    description: 'Leading digital services and consulting multinational offering positions across System Engineer, Specialist Programmer, and Power Programmer roles.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Mathematical & Logical Reasoning', category: 'APTITUDE', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Pseudo-code Analysis & Debugging', category: 'CODING', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Hands-on Coding & DSA', category: 'CODING', importance: 1.5, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
      { skillName: 'DBMS & Relational Databases', category: 'CORE_CS', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 4 },
      { skillName: 'Technical Concept Explanation', category: 'INTERVIEW', importance: 1.1, confidence: 'COMMONLY_REPORTED', displayOrder: 5 },
    ],
  },
  {
    slug: 'wipro',
    name: 'Wipro Limited',
    shortName: 'Wipro',
    industry: 'IT Services & Consulting',
    description: 'Global technology services and consulting provider offering Elite and Turbo engineering roles.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Quantitative Aptitude & Logical Ability', category: 'APTITUDE', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Written Communication & Verbal English', category: 'BEHAVIORAL', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Basic Algorithmic Coding', category: 'CODING', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
      { skillName: 'CS Fundamentals (DBMS, OS, CN)', category: 'CORE_CS', importance: 1.1, confidence: 'COMMONLY_REPORTED', displayOrder: 4 },
    ],
  },
  {
    slug: 'accenture',
    name: 'Accenture',
    shortName: 'Accenture',
    industry: 'IT Services & Management Consulting',
    description: 'Global professional services firm hiring for Associate Software Engineer and Advanced Application Engineering roles.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Cognitive & Critical Reasoning', category: 'APTITUDE', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Technical & Pseudo-code Assessment', category: 'CODING', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Coding & Algorithmic Problem Solving', category: 'CODING', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
      { skillName: 'Communication & Verbal Assessment', category: 'BEHAVIORAL', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 4 },
    ],
  },
  {
    slug: 'cognizant',
    name: 'Cognizant Technology Solutions',
    shortName: 'Cognizant',
    industry: 'IT Services',
    description: 'Multinational IT service provider recruiting for GenC, GenC Elevate, and GenC Pro engineering roles.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Quantitative & Analytical Reasoning', category: 'APTITUDE', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Programming & Data Structures', category: 'CODING', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Database Management & SQL', category: 'CORE_CS', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
      { skillName: 'Technical Interview Defense', category: 'INTERVIEW', importance: 1.1, confidence: 'COMMONLY_REPORTED', displayOrder: 4 },
    ],
  },
  {
    slug: 'capgemini',
    name: 'Capgemini',
    shortName: 'Capgemini',
    industry: 'IT Services & Consulting',
    description: 'Global leader in partnering with companies to transform and manage business through technology.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Game-Based & Cognitive Aptitude', category: 'APTITUDE', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Technical Quiz & Coding', category: 'CODING', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'English Communication & Writing', category: 'BEHAVIORAL', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
  {
    slug: 'hcltech',
    name: 'HCLTech',
    shortName: 'HCL',
    industry: 'IT Services & Product Engineering',
    description: 'Global technology company offering software engineering and digital transformation positions.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'General Aptitude & Logical Reasoning', category: 'APTITUDE', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Programming Fundamentals (C/Java/Python)', category: 'CODING', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Operating Systems & Networking', category: 'CORE_CS', importance: 1.1, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
  {
    slug: 'tech-mahindra',
    name: 'Tech Mahindra',
    shortName: 'TechM',
    industry: 'IT Services & Telecom',
    description: 'Specialist in digital transformation, consulting and business re-engineering services.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Aptitude & Verbal Ability', category: 'APTITUDE', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Coding & Logical Debugging', category: 'CODING', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Conversational Communication', category: 'BEHAVIORAL', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
  {
    slug: 'ibm',
    name: 'IBM',
    shortName: 'IBM',
    industry: 'Technology & Enterprise Solutions',
    description: 'Multinational technology corporate known for cognitive assessments and systems engineering roles.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Cognitive Ability & Problem Solving', category: 'APTITUDE', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Data Structures & Algorithmic Coding', category: 'CODING', importance: 1.5, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Computer Science Fundamentals', category: 'CORE_CS', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
  {
    slug: 'deloitte',
    name: 'Deloitte',
    shortName: 'Deloitte',
    industry: 'Management & Technology Consulting',
    description: 'Tier-1 consulting firm hiring analyst and technology risk/development engineers.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Quantitative & Analytical Aptitude', category: 'APTITUDE', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Group Discussion & Case Study', category: 'BEHAVIORAL', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Technical & Business Communication', category: 'INTERVIEW', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
  {
    slug: 'amazon',
    name: 'Amazon',
    shortName: 'Amazon',
    industry: 'Technology & Cloud Infrastructure',
    description: 'Global tech leader known for rigorous DSA coding assessments, system design, and Leadership Principles.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Data Structures & Algorithms (Trees, Graphs, DP)', category: 'CODING', importance: 2.0, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Operating Systems & Concurrency', category: 'CORE_CS', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'System Design & Scalability Basics', category: 'CORE_CS', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
      { skillName: 'Amazon Leadership Principles (Behavioral)', category: 'BEHAVIORAL', importance: 1.8, confidence: 'COMMONLY_REPORTED', displayOrder: 4 },
    ],
  },
  {
    slug: 'microsoft',
    name: 'Microsoft',
    shortName: 'Microsoft',
    industry: 'Technology & Software Products',
    description: 'Global software giant focusing on deep algorithmic problem solving, clean code, and CS core concepts.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Algorithmic Problem Solving & Data Structures', category: 'CODING', importance: 1.9, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Object-Oriented Architecture', category: 'CORE_CS', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'System Fundamentals & Memory', category: 'CORE_CS', importance: 1.3, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
      { skillName: 'Collaborative Problem Discussion', category: 'INTERVIEW', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 4 },
    ],
  },
  {
    slug: 'google',
    name: 'Google',
    shortName: 'Google',
    industry: 'Technology & Internet Products',
    description: 'Premier tech company evaluating candidate algorithmic efficiency, code complexity, and Googliness.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Advanced Data Structures & Algorithms', category: 'CODING', importance: 2.0, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Time & Space Complexity Optimization', category: 'CODING', importance: 1.8, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Computer Science Core Principles', category: 'CORE_CS', importance: 1.5, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
      { skillName: 'Behavioral & Googliness Interview', category: 'BEHAVIORAL', importance: 1.5, confidence: 'COMMONLY_REPORTED', displayOrder: 4 },
    ],
  },
  {
    slug: 'zoho',
    name: 'Zoho Corporation',
    shortName: 'Zoho',
    industry: 'SaaS Software Products',
    description: 'Indian SaaS product leader emphasizing C/C++ programming logic, puzzle solving, and machine coding.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Low-Level C/C++ Programming Logic', category: 'CODING', importance: 1.8, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Machine Coding & Application Building', category: 'CODING', importance: 1.7, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Logical Puzzles & Problem Solving', category: 'APTITUDE', importance: 1.5, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
  {
    slug: 'freshworks',
    name: 'Freshworks',
    shortName: 'Freshworks',
    industry: 'SaaS Customer Engagement',
    description: 'Global SaaS enterprise hiring software engineers proficient in web technologies and data structures.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Data Structures & Problem Solving', category: 'CODING', importance: 1.6, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Web & Backend Technologies', category: 'CORE_CS', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Culture & Behavioral Alignment', category: 'BEHAVIORAL', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
  {
    slug: 'razorpay',
    name: 'Razorpay',
    shortName: 'Razorpay',
    industry: 'FinTech Payment Infrastructure',
    description: 'Leading Indian payment gateway and financial software unicorn.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Machine Coding & LLD', category: 'CODING', importance: 1.8, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'DSA & Algorithmic Speed', category: 'CODING', importance: 1.7, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'SQL & Database Optimization', category: 'CORE_CS', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
  {
    slug: 'flipkart',
    name: 'Flipkart',
    shortName: 'Flipkart',
    industry: 'E-commerce & Consumer Tech',
    description: 'Major Indian e-commerce company evaluating machine coding, system design, and algorithms.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Machine Coding Round (LLD)', category: 'CODING', importance: 1.9, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Data Structures & Problem Solving', category: 'CODING', importance: 1.8, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'System Fundamentals & Databases', category: 'CORE_CS', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
  {
    slug: 'walmart-global-tech',
    name: 'Walmart Global Tech',
    shortName: 'Walmart',
    industry: 'Retail Technology & E-commerce',
    description: 'Innovation center for Walmart evaluating candidate CS fundamentals, coding, and system design.',
    dataSourceType: 'COMMONLY_REPORTED',
    requirements: [
      { skillName: 'Data Structures & Algorithms', category: 'CODING', importance: 1.7, confidence: 'COMMONLY_REPORTED', displayOrder: 1 },
      { skillName: 'Object-Oriented Design & CS Core', category: 'CORE_CS', importance: 1.4, confidence: 'COMMONLY_REPORTED', displayOrder: 2 },
      { skillName: 'Behavioral & Leadership Discussion', category: 'BEHAVIORAL', importance: 1.2, confidence: 'COMMONLY_REPORTED', displayOrder: 3 },
    ],
  },
]

/**
 * Seeds or syncs starter company catalog into PostgreSQL database.
 */
export async function seedCompanyCatalog(): Promise<number> {
  let count = 0
  for (const comp of STARTER_COMPANIES) {
    const dbCompany = await db.company.upsert({
      where: { slug: comp.slug },
      update: {
        name: comp.name,
        shortName: comp.shortName,
        industry: comp.industry,
        description: comp.description,
        dataSourceType: comp.dataSourceType,
        active: true,
      },
      create: {
        slug: comp.slug,
        name: comp.name,
        shortName: comp.shortName,
        industry: comp.industry,
        description: comp.description,
        dataSourceType: comp.dataSourceType,
        active: true,
      },
    })

    // Upsert company requirements
    for (const req of comp.requirements) {
      const existing = await db.companyRequirement.findFirst({
        where: { companyId: dbCompany.id, roleSlug: 'all', skillName: req.skillName },
      })
      if (!existing) {
        await db.companyRequirement.create({
          data: {
            companyId: dbCompany.id,
            roleSlug: 'all',
            skillName: req.skillName,
            category: req.category,
            importance: req.importance,
            confidence: req.confidence,
            sourceType: comp.dataSourceType,
            displayOrder: req.displayOrder,
            active: true,
          },
        })
      }
    }
    count++
  }
  return count
}
