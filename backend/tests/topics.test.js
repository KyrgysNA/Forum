import request from "supertest";
import app from "../server.js";

describe("Topics API (tags)", () => {
  let cookie;
  beforeAll(async () => {
    const email = "apitester2@example.com";
    const password = "secret123";
    await request(app).post("/api/auth/register").send({ username: "apitester2", email, password });
    const res = await request(app).post("/api/auth/login").send({ email, password });
    cookie = res.headers["set-cookie"];
  });

  test("creates topic with tags", async () => {
    const res = await request(app)
      .post("/api/topics")
      .set("Cookie", cookie)
      .send({ title: "Tagged topic", description: "with tags", tags: ["react", "node"] });
    expect(res.statusCode).toBe(201);
    expect(res.body.tags).toBeDefined();
  });
});
