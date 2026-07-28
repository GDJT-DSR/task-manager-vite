export interface RBody<T> {
  code: number;
  msg: string;
  data?: T;
}

export interface Task {
  id: number;
  title: string;
  readable: boolean;
}
export interface TaskDetails extends Task {
  questions: Question[];
  desc: string;
  start_at?: string;
  end_at?: string;
  img?: string;
  changable: boolean;
  submittable: boolean;
}

export type QuestionType = "fill_in" | "choose" | "upload" | "none";
export interface Question {
  id: number;
  title: string;
  desc?: string;
  type: QuestionType;
  settings?: any;
  index: number;
  answer?: Answer;
  max_score: number;
}
export interface Answer {
  id: number;
  updated_at: string;
  content: string;
  img?: string;
  index: number;
  score?: number;
}

export type Token = { access_token: string };
export type TokenBody = RBody<Token>;

export interface ScoreTask {
  id: number;
  title: string;
  questions: ScoreQuestion[];
}

export interface ScoreQuestion {
  id: number;
  title: string;
  type: QuestionType;
}

export interface ScoreQuestionDetail extends ScoreQuestion {
  max_score: number;
  score_step: number;
  answers: ScoreAnswer[];
}
export interface ScoreAnswer {
  id: number;
  content: string;
  score: number;
}
