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
  state: number;
}

export type QuestionType = "fill_in" | "choose" | "upload" | "none";
interface QuestionBase {
  id: number;
  title: string;
  desc?: string;
  type: QuestionType;
  answer?: Answer;
  max_score: number;
  precision: number;
  settings?: {
    imgs?: string[];
  };
}

export interface FillInOrUploadQuestion extends QuestionBase {
  type: "fill_in" | "upload";
  settings?: {
    imgs?: string[];
    answer?: string;
    answer_imgs?: string[];
  };
}
export interface ChooseQuestion extends QuestionBase {
  type: "choose";
  settings: {
    imgs?: string[];
    answer?: string;
    choices: string[];
    multiple?: boolean; // 默认false
  };
}
export interface NoneQuestion extends QuestionBase {
  type: "none";
  settings?: {
    imgs?: string[];
  };
}

export type Question = FillInOrUploadQuestion | ChooseQuestion | NoneQuestion;

export interface Answer {
  // id: number; // 用不上
  updated_at: string;
  content: string;
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
  precision: number;
  answers: ScoreAnswer[];
}
export interface ScoreAnswer {
  id: number;
  content: string;
  score: number;
}
