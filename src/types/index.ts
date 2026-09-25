export interface SyllableWord {
  id: string;
  word: string;
  syllables: string[];
  stressedIndex: number; // 0-indexed
  phonetic?: string;
  soundChangeNote?: string;
  category?: string;
  hint1: string;
  hint2: string;
  audioText?: string;
}

export interface YetSentence {
  id: string;
  toxicSentence: string;
  correctedSentence: string;
  explanation: string;
}

export interface ToolMatch {
  id: string;
  toolName: string;
  bestUse: string;
  icon: string;
  url?: string;
}

export interface VoiceChallenge {
  id: string;
  prompt: string;
  targetWords: string[];
  displaySyllables: string;
  spokenModelText: string;
  stressedSyllable?: string;
  guidePhonetic?: string;
  pedagogicalTip: string;
}

export interface CourseSession {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  topic: string;
  date: string;
  storyIntro: string;
  vaultCode: string;
  yetSentences: YetSentence[];
  rhythmWords: SyllableWord[];
  voiceChallenges: VoiceChallenge[];
  recapNotes: string[];
}

export interface GameProgress {
  sessionId: string;
  studentName: string;
  currentStage: number; // 1 to 5
  stagesCompleted: number[];
  score: number;
  unlockedDigits: string[];
  startTime: number;
  completedTime?: number;
  hintsUsed: number;
}
