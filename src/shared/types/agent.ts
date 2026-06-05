export type AgentTemplate =
  | 'manus'
  | 'chatgpt'
  | 'github'
  | 'gmail'
  | 'hackathon-hunter'
  | 'custom';

export interface AgentCell {
  id: string;
  name: string;
  url: string;
  icon: string;
  template: AgentTemplate;
  partition: string; // `persist:${id}`
  createdAt: number;
}

export interface HivemindFile {
  path: string;
  content: string;
  author: string; // agentId
  timestamp: number;
  provider: 'github' | 'gdrive' | 'onedrive' | 's3';
}

export interface Mission {
  id: string;
  title: string;
  source: 'hackathon-hunter' | 'manual';
  deadline?: number;
  status: 'open' | 'in-progress' | 'done';
  assignedAgents: string[]; // agentIds
}
