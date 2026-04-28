import { getAdminDb, isFirebaseAdminConfigured } from './firebase-admin'

// ─── Types ────────────────────────────────────────────────────────────────────

export type StudentInfo = {
  name: string
  teacher: string
  program: string
  currentLevel: string
  targetLevel: string
  frequency: string
  learningFocus: string
}

export type ManageLink = {
  label: string
  url: string
  icon: string
}

export type ProgressSkill = {
  skill: string
  status: 'Very Strong' | 'Strong' | 'Active Growth' | 'Improving' | 'Developing'
  insight: string
}

export type AttendanceData = {
  total: number
  attended: number
  missed: number
  consistency: string
  dates: string[]
}

export type ClassReport = {
  date: string
  summary: string
  grammarFocus: string
  vocabulary: string[]
  goals: string[]
}

export type GrammarItem = {
  focusArea: string
  description: string
  status: string
}

export type VocabularyItem = {
  category: string
  word: string
  meaning: string
  example: string
}

export type StudentData = {
  info: StudentInfo
  links: ManageLink[]
  progressTracker: ProgressSkill[]
  attendance: AttendanceData
  classes: ClassReport[]
  grammarOverview: GrammarItem[]
  vocabularyBank: VocabularyItem[]
  teacherFeedback: string
  teacherFeedbackMonth: string
  previewMode?: boolean
}

// ─── Fetch from Firestore (server-side only) ──────────────────────────────────

export async function getStudentData(email: string): Promise<StudentData | null> {
  // Se Firebase Admin não está configurado, retorna preview mode com dados do Rafael
  if (!isFirebaseAdminConfigured()) {
    return { ...rafaelData, previewMode: true }
  }

  try {
    const db = getAdminDb()
    if (!db) return { ...rafaelData, previewMode: true }

    const collection = process.env.FIREBASE_STUDENT_COLLECTION ?? 'students'
    const ref = db.collection(collection).doc(email)
    const snap = await ref.get()

    if (!snap.exists) return null // aluno não cadastrado → pending-access

    return snap.data() as StudentData
  } catch (err) {
    console.error('[student-data] Firestore error:', err)
    return { ...rafaelData, previewMode: true }
  }
}

// ─── Seed data — Rafael Copolillo ─────────────────────────────────────────────

export const rafaelData: StudentData = {
  info: {
    name: 'Rafael Copolillo',
    teacher: 'Alexandre Mello',
    program: 'Prime Upper',
    currentLevel: 'B2',
    targetLevel: 'C1',
    frequency: 'Once a week',
    learningFocus: 'Fluency Development & Grammar Consolidation',
  },
  links: [
    { label: 'My Portfolio', url: '#', icon: 'folder' },
    { label: 'Join My Live Class', url: '#', icon: 'video' },
    { label: 'Class Materials', url: '#', icon: 'book-open' },
    { label: 'My Homework Page', url: '#', icon: 'pencil' },
    { label: 'My AI Speaking Mentor', url: '#', icon: 'bot' },
    { label: 'My Lesson Calendar', url: '#', icon: 'calendar' },
    { label: 'Prime Support', url: '#', icon: 'headphones' },
  ],
  progressTracker: [
    { skill: 'Fluency & Listening', status: 'Strong', insight: 'Improved structure and clarity. Understands complex real-world input.' },
    { skill: 'Vocabulary', status: 'Active Growth', insight: 'Expanding with better nuance and precision.' },
    { skill: 'Grammar', status: 'Improving', insight: 'Clear progress in past tense accuracy and self-correction.' },
    { skill: 'Analytical Discussion', status: 'Very Strong', insight: 'Explains, connects, and evaluates complex ideas effectively.' },
    { skill: 'Pronunciation', status: 'Developing', insight: 'Working on natural rhythm and connected speech.' },
  ],
  attendance: {
    total: 6,
    attended: 6,
    missed: 0,
    consistency: 'Excellent',
    dates: [
      'March 5, 2026',
      'March 12, 2026',
      'March 23, 2026',
      'March 26, 2026',
      'April 6, 2026',
      'April 9, 2026',
    ],
  },
  classes: [
    {
      date: 'March 5, 2026',
      summary: 'Rafael shared details about his recent trip to Italy (Venice, Milan, Rome, Pisa). Demonstrated strong communicative instincts and natural ability to retell events chronologically. Also discussed current geopolitical events using a BBC news report about Iran.',
      grammarFocus: 'Simple Past — telling verbs (tell→told, see→saw, go→went), action verbs, news vocabulary.',
      vocabulary: ['birth certificate', 'to enroll', 'lawsuit', 'paste', 'folder', 'retaliate', 'citizenship'],
      goals: ['Use Simple Past accurately in storytelling', 'Expand news vocabulary'],
    },
    {
      date: 'March 12, 2026',
      summary: 'Discussion about work-life balance and remote work culture. Rafael demonstrated strong analytical ability when comparing hybrid and remote work models.',
      grammarFocus: 'Passive Voice — using passive forms for formal and news-style communication.',
      vocabulary: ['tax auditor', 'Legislative Assembly', 'remote work', 'hybrid work', 'milestone'],
      goals: ['Use passive voice in formal contexts', 'Discuss professional topics with precision'],
    },
    {
      date: 'March 23, 2026',
      summary: 'Explored AI and technology topics. Rafael engaged confidently with complex concepts around data, machine learning, and business applications.',
      grammarFocus: 'Say vs Tell — correct structure: tell + person / say + message.',
      vocabulary: ['AI', 'data patterns', 'demand forecasting', 'efficiency', 'supply chain', 'revenue'],
      goals: ['Distinguish say vs tell correctly', 'Use tech vocabulary in context'],
    },
    {
      date: 'March 26, 2026',
      summary: 'Geopolitics focus: Middle East tensions and international relations. Rafael showed excellent comprehension of complex news content.',
      grammarFocus: 'Natural phrasing & comparatives — avoiding literal translations.',
      vocabulary: ['asymmetry', 'attrition', 'interceptor', 'Strait of Hormuz', 'plenary session'],
      goals: ['Use comparatives naturally', 'Discuss geopolitical events fluently'],
    },
    {
      date: 'April 6, 2026',
      summary: 'Lifestyle and personal development discussion. Rafael spoke about nutrition, technology habits and screen time with great fluency.',
      grammarFocus: 'Sentence structure & completion — building complete, connected sentences.',
      vocabulary: ['nutrition', 'tasty', 'gadgets', 'screen time', 'annotations', 'willingness'],
      goals: ['Build longer, connected sentences', 'Expand lifestyle vocabulary'],
    },
    {
      date: 'April 9, 2026',
      summary: 'Culture and society discussion. Rafael demonstrated impressive range when discussing education systems, cultural differences and social norms.',
      grammarFocus: 'Past tense consistency — reducing overuse of continuous forms.',
      vocabulary: ['educated', 'foreigner', 'polite', 'indirect election', 'resign', 'take over'],
      goals: ['Maintain past tense consistency', 'Discuss cultural topics with nuance'],
    },
  ],
  grammarOverview: [
    { focusArea: 'Past tense consistency', description: 'Accurate use of past simple in storytelling; reducing overuse of continuous forms.', status: 'Improving' },
    { focusArea: 'Sentence structure & completion', description: 'Building complete, connected sentences without interruption.', status: 'Developing' },
    { focusArea: 'Natural phrasing & comparatives', description: 'Avoiding literal translations; using more natural English structures.', status: 'Developing' },
    { focusArea: 'Passive voice (reporting)', description: 'Using passive forms for formal and news-style communication.', status: 'Active' },
    { focusArea: 'Say vs Tell', description: 'Correct structure: tell + person / say + message.', status: 'Active' },
  ],
  vocabularyBank: [
    { category: 'Travel & Documentation', word: 'Birth certificate', meaning: 'Official document proving birth', example: 'She needed her birth certificate to apply for a passport.' },
    { category: 'Travel & Documentation', word: 'Citizenship', meaning: 'Legal status of being a citizen', example: 'He applied for dual citizenship.' },
    { category: 'Travel & Documentation', word: 'Luggage / Baggage', meaning: 'Bags and suitcases for travel', example: 'Please keep your luggage with you at all times.' },
    { category: 'Work & Institutions', word: 'Tax auditor', meaning: 'Official who examines financial records', example: 'The tax auditor reviewed all company expenses.' },
    { category: 'Work & Institutions', word: 'Remote work', meaning: 'Working from a location outside the office', example: 'Remote work became common after the pandemic.' },
    { category: 'Geopolitics', word: 'Retaliate', meaning: 'To take action in response to an attack', example: 'The country threatened to retaliate after the attack.' },
    { category: 'Geopolitics', word: 'Asymmetry', meaning: 'Lack of equality or equivalence', example: 'There is a clear asymmetry of power in the conflict.' },
    { category: 'AI & Business', word: 'Demand forecasting', meaning: 'Predicting future customer demand', example: 'AI is used for demand forecasting in retail.' },
    { category: 'AI & Business', word: 'Supply chain', meaning: 'Network of production and distribution', example: 'The supply chain was disrupted by the pandemic.' },
    { category: 'Daily Life', word: 'Screen time', meaning: 'Time spent looking at a digital screen', example: 'Doctors recommend limiting screen time for children.' },
    { category: 'Daily Life', word: 'Milestone', meaning: 'An important event or achievement', example: 'Graduating was a major milestone in her life.' },
    { category: 'Communication', word: 'To enroll', meaning: 'To become a member or participant', example: 'He decided to enroll in an English course.' },
  ],
  teacherFeedback: 'Rafael continues to demonstrate strong communicative ability and confidence when discussing complex, real-world topics. His fluency and analytical thinking remain key strengths, allowing him to express ideas clearly and engage in meaningful conversations. Recent lessons show clear progress in grammatical awareness, particularly with past tense usage and self-correction. The main focus moving forward is increasing consistency and precision in structure and vocabulary choice, which will elevate his communication to a more refined and advanced level.',
  teacherFeedbackMonth: 'April 2026',
}
