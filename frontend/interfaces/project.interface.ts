export interface IProject {
  _id: string;
  title: string;
  description?: string;
  language?: string;
  git_link?: string;
  git_username?: string;
  git_password?: string;
  git_branch?: string;
  created_by?: {
    _id: string;
    full_name: string;
    email: string;
  }
  createdAt?: string;
  updatedAt?: string;

  uuid: string;
  scan_version?: string;
  status?: ProjectStatusEnum;
}

export enum ProjectStatusEnum {
  Active = 'Active',
  Inactive = 'Inactive',
  Archived = 'Archived',
}

export enum WorkflowStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}

export enum WorkflowStep {
  CLONING = 'CLONING',
  PARSING = 'PARSING',
  VECTORIZE = 'VECTORIZE',
}