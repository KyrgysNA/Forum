export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  tags: string[]; // parsed on client
  user_id: number;
  author: string;
  created_at: string;
}

export interface Post {
  id: number;
  topic_id: number;
  user_id: number;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
  likesCount: number;
  likedByMe: boolean;
}
