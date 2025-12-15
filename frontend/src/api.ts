import { Topic, Post, User } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(API_BASE + url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!res.ok) throw new Error(data?.message || `Ошибка ${res.status}`);
  return data as T;
}

function parseTopic(raw: any): Topic {
  let tags: string[] = [];
  try {
    tags = Array.isArray(raw.tags) ? raw.tags : JSON.parse(raw.tags || "[]");
  } catch {
    tags = [];
  }
  return { ...raw, tags };
}

export const api = {
  async register(username: string, email: string, password: string): Promise<{ user: User }> {
    return request("/api/auth/register", { method: "POST", body: JSON.stringify({ username, email, password }) });
  },
  async login(email: string, password: string): Promise<{ user: User }> {
    return request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },
  async logout(): Promise<void> {
    await request("/api/auth/logout", { method: "POST" });
  },
  async me(): Promise<{ user: User | null }> {
    return request("/api/auth/me");
  },

  async getTopics(q?: string): Promise<Topic[]> {
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    const raws = await request<any[]>(`/api/topics${query}`);
    return raws.map(parseTopic);
  },

  async createTopic(title: string, description: string, tags: string[]): Promise<Topic> {
    const raw = await request<any>("/api/topics", { method: "POST", body: JSON.stringify({ title, description, tags }) });
    return parseTopic(raw);
  },

  async getTopic(id: number): Promise<{ topic: Topic; posts: Post[] }> {
    const raw = await request<any>(`/api/topics/${id}`);
    return { topic: parseTopic(raw.topic), posts: raw.posts };
  },

  async createPost(topicId: number, content: string): Promise<Post> {
    return request(`/api/posts/topic/${topicId}`, { method: "POST", body: JSON.stringify({ content }) });
  },

  async toggleLike(postId: number): Promise<{ liked: boolean; likesCount: number }> {
    return request(`/api/posts/${postId}/like`, { method: "POST" });
  }
};
