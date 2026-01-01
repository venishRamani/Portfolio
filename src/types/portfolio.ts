export type MessageStatus = 'unread' | 'read' | 'replied';

export interface ProfileData {
  name: string;
  role: string;
  location: string;
  email: string;
  headline: string;
  bio: string;
  heroImage: string;
  heroImageAlt: string;
}

export interface DirectMessage {
  id: string;
  referenceCode: string;
  name: string;
  email: string;
  organization: string;
  topic: string;
  message: string;
  referenceProject?: string;
  status: MessageStatus;
  createdAt: string;
}

export interface GitHubRepoPreview {
  owner: string;
  repo: string;
  fullName: string;
  htmlUrl: string;
  homepage?: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt: string;
}

export interface GitHubProject extends GitHubRepoPreview {
  id: string;
  customHighlight?: string;
  addedAt: string;
}
