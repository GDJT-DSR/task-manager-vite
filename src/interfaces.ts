export interface RBody<T> {
  code: number;
  msg: string;
  data?: T;
}

export interface Task {
  id: number;
  title: string;
  desc: string;
  start_at?: string;
  end_at?: string;
  img?: string;
  submittable: boolean;
  changable: boolean;
  readable: boolean;
}
export interface TaskDetails extends Task {
  sub_tasks: SubTask[];
}
export interface SubTask {
  id: number;
  title: string;
  desc?: string;
  img?: string;
  index: number;
  record?: TaskRecord;
  max_score: number;
}
export interface TaskRecord {
  id: number;
  content: string;
  img?: string;
  index: number;
  score: number;
}

export type Token = { access_token: string };
export type TokenBody = RBody<Token>;

export interface ScoreTask {
  id: number;
  title: string;
  sub_tasks: {
    id: number;
    title: string;
    max_score: number;
    step: number;
    records: TaskRecord[];
  }[];
}
