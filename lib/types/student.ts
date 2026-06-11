export interface Option {
  id: string;
  text: string;
  order: number;
}

export interface QuestionData {
  id: string;
  text: string;
  categoryName: string;
  imageUrl: string | null;
  options: Option[];
  progress: { selectedOptionId: string; isCorrect: boolean } | null;
}

export interface AnswerResult {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string;
}

export interface Subscription {
  plan: "free" | "premium";
  status: "active" | "canceled" | "expired";
}

export interface UserMe {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  subscription: Subscription | null;
}
