import request from "supertest";
import app from "../server.js";

describe("Likes API", () => {
  let cookie;
  let topicId;
  let postId;

  beforeAll(async () => {
    const email = "likeuser@example.com";
    const password = "secret123";
    await request(app).post("/api/auth/register").send({ username: "likeuser", email, password });
    const login = await request(app).post("/api/auth/login").send({ email, password });
    cookie = login.headers["set-cookie"];

    const topicRes = await request(app).post("/api/topics").set("Cookie", cookie).send({ title: "Like topic", tags: ["likes"] });
    topicId = topicRes.body.id;

    const postRes = await request(app).post(`/api/posts/topic/${topicId}`).set("Cookie", cookie).send({ content: "hello" });
    postId = postRes.body.id;
  });

  test("toggles like on post", async () => {
    const res1 = await request(app).post(`/api/posts/${postId}/like`).set("Cookie", cookie);
    expect(res1.statusCode).toBe(200);
    expect(res1.body.likesCount).toBe(1);

    const res2 = await request(app).post(`/api/posts/${postId}/like`).set("Cookie", cookie);
    expect(res2.statusCode).toBe(200);
    expect(res2.body.likesCount).toBe(0);
  });
});
