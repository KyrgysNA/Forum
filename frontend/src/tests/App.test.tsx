import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { App } from "../App";

vi.mock("../api", () => ({
  api: {
    me: vi.fn().mockResolvedValue({ user: null }),
    getTopics: vi.fn().mockResolvedValue([
      {
        id: 1,
        title: "Тестовая тема",
        description: "Описание темы",
        tags: ["react", "node"],
        user_id: 1,
        author: "tester",
        created_at: new Date().toISOString()
      }
    ]),
    createTopic: vi.fn(),
    getTopic: vi.fn().mockResolvedValue({
      topic: {
        id: 1,
        title: "Тестовая тема",
        description: "Описание темы",
        tags: ["react"],
        user_id: 1,
        author: "tester",
        created_at: new Date().toISOString()
      },
      posts: [
        {
          id: 10,
          topic_id: 1,
          user_id: 1,
          author: "tester",
          content: "hello",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likesCount: 3,
          likedByMe: false
        }
      ]
    }),
    createPost: vi.fn(),
    toggleLike: vi.fn().mockResolvedValue({ liked: true, likesCount: 4 })
  }
}));

describe("Testing Library (components + fetch-like)", () => {
  it("renders topics list and tags", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider><App /></AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Тестовая тема")).toBeInTheDocument();
    expect(screen.getByText("#react")).toBeInTheDocument();
    expect(screen.getByText("#node")).toBeInTheDocument();
  });

  it("navigates to topic page and shows post", async () => {
    render(
      <MemoryRouter initialEntries={["/topics/1"]}>
        <AuthProvider><App /></AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("hello")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows error when getTopics fails", async () => {
    const { api } = await import("../api");
    (api.getTopics as any).mockRejectedValueOnce(new Error("Ошибка сети"));

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider><App /></AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Ошибка сети");
    });
  });
});
