/**
 * Curated Pool of Placement & Campus Drive Group Discussion (GD) Topics
 * Categorized by industry, social, technology, and economic themes.
 */

export interface GDTopicItem {
  id: string
  category: string
  topic: string
  topicContext: string
}

export const GD_TOPIC_POOL: GDTopicItem[] = [
  // 1. Artificial Intelligence & Employment
  {
    id: 'ai-jobs-1',
    category: 'Technology & Employment',
    topic: 'Will Artificial Intelligence Create More Jobs Than It Destroys?',
    topicContext: 'Automation is accelerating across software, manufacturing, and services. Participants should debate whether AI will lead to net job growth through new industries or cause widespread structural unemployment.',
  },
  {
    id: 'ai-ethics-2',
    category: 'AI & Ethics',
    topic: 'Should AI Systems Be Regulated Strictly By Government Authorities?',
    topicContext: 'As AI models gain decision-making power in healthcare, hiring, and finance, evaluate the trade-off between strict safety regulations and technological innovation.',
  },

  // 2. Work Culture & Corporate Ethics
  {
    id: 'work-culture-3',
    category: 'Work Culture',
    topic: 'Is a 70-Hour Work Week Culture Productive or Toxic for Youth?',
    topicContext: 'Corporate leaders advocate intense work habits for national growth, while wellness advocates warn against burnout. Discuss productivity, economic ambition, and mental health.',
  },
  {
    id: 'remote-work-4',
    category: 'Future of Work',
    topic: 'Is Remote Work Sustainable for Organizational Culture and Mentorship?',
    topicContext: 'Remote and hybrid models offer flexibility but challenge team cohesion and onboarding. Debate whether physical office collaboration remains essential for early-career growth.',
  },

  // 3. Startups vs Corporate Careers
  {
    id: 'startup-vs-corp-5',
    category: 'Career & Business',
    topic: 'Should Freshers Join Startups or Established Tech Corporates?',
    topicContext: 'Startups offer rapid learning and broad responsibility but risk instability. Corporates offer structured training and stability but slower career movement. Analyze the trade-offs for fresh graduates.',
  },
  {
    id: 'entrepreneurship-6',
    category: 'Entrepreneurship',
    topic: 'Is India Ready to Become a Nation of Job Creators Rather Than Job Seekers?',
    topicContext: 'With startup ecosystems booming, evaluate if infrastructure, venture capital, and societal mindset truly support risk-taking entrepreneurship over traditional job security.',
  },

  // 4. Social Media & Mental Health
  {
    id: 'social-media-7',
    category: 'Social Impact',
    topic: 'Does Social Media Do More Harm Than Good to Youth Focus and Mental Health?',
    topicContext: 'Social networks connect people globally but increase anxiety, distraction, and polarization. Discuss whether self-regulation or platform accountability is needed.',
  },

  // 5. Higher Education & Skilling
  {
    id: 'online-ed-8',
    category: 'Education',
    topic: 'Can Online Certifications Replace Traditional University College Degrees?',
    topicContext: 'Tech giants offer skill-first hiring, while traditional degrees emphasize foundational theory and campus exposure. Debate the future of higher education.',
  },

  // 6. Sustainability & Economy
  {
    id: 'climate-corp-9',
    category: 'Environment & Business',
    topic: 'Should Corporations Prioritize Environmental Sustainability Over Short-Term Profits?',
    topicContext: 'Climate change demands urgent green investments, yet shareholders demand immediate returns. Discuss how businesses should balance ESG goals with profitability.',
  },
  {
    id: 'cashless-economy-10',
    category: 'Economy & Tech',
    topic: 'Is a 100% Cashless Digital Economy Realistic for Developing Nations?',
    topicContext: 'Digital payments like UPI have scaled rapidly, but digital literacy, cybersecurity, and rural access remain concerns. Discuss the feasibility of a completely cashless society.',
  },

  // 7. Leadership & Management
  {
    id: 'leadership-style-11',
    category: 'Management & Leadership',
    topic: 'Are Empathetic Leaders More Effective Than Results-Driven Authoritative Leaders?',
    topicContext: 'Modern leadership emphasizes emotional intelligence and empathy, whereas high-pressure markets often reward aggressive goals. Debate what constitutes effective leadership.',
  },
  {
    id: 'gig-economy-12',
    category: 'Gig Economy',
    topic: 'Is the Gig Economy Empowering Flexible Work or Exploiting Labor?',
    topicContext: 'Platform-based freelance and delivery work offers freedom but lacks healthcare, pensions, and job security. Discuss regulation vs flexible employment opportunities.',
  },
]

/**
 * Utility to pick a random fresh topic from the pool, excluding recently used topics.
 */
export function getRandomGDTopic(excludeTopics: string[] = []): GDTopicItem {
  const excludeSet = new Set(
    (excludeTopics || [])
      .filter((t): t is string => typeof t === 'string' && Boolean(t))
      .map((t) => t.toLowerCase().trim())
  )
  const available = GD_TOPIC_POOL.filter((item) => !excludeSet.has((item.topic || '').toLowerCase().trim()))

  if (available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length)
    return available[randomIndex]
  }

  // Fallback to random from entire pool if all excluded
  const randomIndex = Math.floor(Math.random() * GD_TOPIC_POOL.length)
  return GD_TOPIC_POOL[randomIndex]
}
