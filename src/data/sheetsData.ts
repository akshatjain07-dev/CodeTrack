export interface QuestionSheet {
  id: string;
  name: string;
  author: string;
  description: string;
  isImported: boolean;
  totalQuestions?: number;
  iconName: 'GraduationCap' | 'ListOrdered' | 'Code2' | 'Terminal' | 'Sparkles';
}

export const QUESTION_SHEETS: QuestionSheet[] = [
  {
    id: 'striver-a2z',
    name: 'Striver A2Z',
    author: 'TakeUForward',
    description: 'Comprehensive 18-step DSA roadmap covering all foundational to advanced patterns.',
    isImported: true,
    totalQuestions: 213,
    iconName: 'GraduationCap',
  },
  {
    id: 'love-babbar-450',
    name: 'Love Babbar 450',
    author: 'Love Babbar',
    description: '450 curated DSA cracker coding questions for product company prep.',
    isImported: false,
    iconName: 'ListOrdered',
  },
  {
    id: 'neetcode-150',
    name: 'NeetCode 150',
    author: 'NeetCode',
    description: 'Curated list of 150 LeetCode patterns for FAANG/tier-1 technical interviews.',
    isImported: true,
    totalQuestions: 150,
    iconName: 'Code2',
  },
  {
    id: 'neetcode-250',
    name: 'NeetCode 250',
    author: 'NeetCode',
    description: 'Extended 250-problem comprehensive algorithm and data structure catalog.',
    isImported: true,
    totalQuestions: 250,
    iconName: 'Terminal',
  },
  {
    id: 'apna-college',
    name: 'Apna College',
    author: 'Apna College',
    description: 'Placement-focused DSA questions curated by Aman Dhattarwal & Shraddha Khapra.',
    isImported: false,
    iconName: 'Sparkles',
  },
];

export function getSheetById(id: string): QuestionSheet | undefined {
  return QUESTION_SHEETS.find((s) => s.id === id);
}
