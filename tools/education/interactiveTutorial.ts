/**
 * Interactive Tutorial System
 * Provides guided learning experiences with quizzes and code challenges
 */

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  codeExamples: CodeExample[];
  quiz: Question[];
}

export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'code' | 'true-false';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

export interface LessonProgress {
  lessonId: string;
  started: Date;
  completed: boolean;
  completedAt?: Date;
  score: number;
  answeredQuestions: Map<string, Answer>;
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  timestamp: Date;
}

export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  startingCode: string;
  testCases: TestCase[];
  hints: string[];
}

interface TestCase {
  input: any;
  expectedOutput: any;
}

export class InteractiveTutorial {
  private lessons: Map<string, LessonContent> = new Map();
  private challenges: Map<string, CodeChallenge> = new Map();
  private userProgress: Map<string, LessonProgress[]> = new Map();

  createLesson(lesson: LessonContent): void {
    this.lessons.set(lesson.id, lesson);
  }

  getLesson(id: string): LessonContent | undefined {
    return this.lessons.get(id);
  }

  listLessons(difficulty?: string): LessonContent[] {
    const lessons = Array.from(this.lessons.values());
    return difficulty 
      ? lessons.filter(l => l.difficulty === difficulty)
      : lessons;
  }

  createChallenge(challenge: CodeChallenge): void {
    this.challenges.set(challenge.id, challenge);
  }

  getChallenge(id: string): CodeChallenge | undefined {
    return this.challenges.get(id);
  }

  async answerQuestion(
    userId: string,
    lessonId: string,
    questionId: string,
    userAnswer: string
  ): Promise<Answer> {
    const lesson = this.lessons.get(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const question = lesson.quiz.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    const correct = this.checkAnswer(userAnswer, question.correctAnswer);
    const answer: Answer = {
      questionId,
      userAnswer,
      correct,
      timestamp: new Date()
    };

    this.recordProgress(userId, lessonId, answer);
    return answer;
  }

  private checkAnswer(userAnswer: string, correctAnswer: string | string[]): boolean {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.includes(userAnswer);
    }
    return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
  }

  private recordProgress(userId: string, lessonId: string, answer: Answer): void {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, []);
    }

    let progress = this.userProgress.get(userId)?.find(p => p.lessonId === lessonId);
    if (!progress) {
      progress = {
        lessonId,
        started: new Date(),
        completed: false,
        score: 0,
        answeredQuestions: new Map()
      };
      this.userProgress.get(userId)?.push(progress);
    }

    progress.answeredQuestions.set(answer.questionId, answer);
    progress.score = this.calculateScore(progress.answeredQuestions);
  }

  private calculateScore(answers: Map<string, Answer>): number {
    const total = answers.size;
    if (total === 0) return 0;

    const correct = Array.from(answers.values()).filter(a => a.correct).length;
    return Math.round((correct / total) * 100);
  }

  getUserProgress(userId: string): LessonProgress[] {
    return this.userProgress.get(userId) || [];
  }

  getHint(challengeId: string, hintLevel: number): string | undefined {
    const challenge = this.challenges.get(challengeId);
    return challenge?.hints[hintLevel];
  }
}

export const interactiveTutorial = new InteractiveTutorial();
