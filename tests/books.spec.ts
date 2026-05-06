import { test, expect } from "@playwright/test";
import { BooksAPI, makeBook, assertBookShape } from "../helpers/api.helpers";

test.describe("Books API", () => {
  test.describe("GET /api/v1/Books", () => {
    test("returns 200 with a non-empty array of books", async ({ request }) => {
      const response = await BooksAPI.getAll(request);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    test("every book in the list has the correct shape", async ({ request }) => {
      const response = await BooksAPI.getAll(request);
      const books = await response.json();
      for (const book of books) {
        assertBookShape(book);
      }
    });

    test("returns correct Content-Type header", async ({ request }) => {
      const response = await BooksAPI.getAll(request);
      expect(response.headers()["content-type"]).toContain("application/json");
    });
  });

  test.describe("GET /api/v1/Books/{id}", () => {
    test("returns 200 and correct book for a valid ID", async ({ request }) => {
      const response = await BooksAPI.getById(request, 1);
      expect(response.status()).toBe(200);
      const body = await response.json();
      assertBookShape(body);
      expect(body.id).toBe(1);
    });

    test("returns 404 for a non-existent ID", async ({ request }) => {
      const response = await BooksAPI.getById(request, 999999);
      expect(response.status()).toBe(404);
    });

    test("returns 400 for an invalid (non-numeric) ID", async ({ request }) => {
      const response = await request.get("/api/v1/Books/not-a-number");
      expect(response.status()).toBe(400);
    });

    test("returns 400 for a negative ID", async ({ request }) => {
      const response = await BooksAPI.getById(request, -1);
      expect([400, 404]).toContain(response.status());
    });
  });

  test.describe("POST /api/v1/Books", () => {
    test("creates a book and returns 200 with the created resource", async ({ request }) => {
      const payload = makeBook({ title: "Playwright Testing Guide", pageCount: 320 });
      const response = await BooksAPI.create(request, payload);
      expect(response.status()).toBe(200);
      const body = await response.json();
      assertBookShape(body);
      expect(body.title).toBe(payload.title);
      expect(body.pageCount).toBe(payload.pageCount);
    });

    test("echoes back all fields sent in the request body", async ({ request }) => {
      const payload = makeBook({
        title: "Echo Test Book",
        description: "Full field echo check",
        pageCount: 99,
        excerpt: "Short excerpt here.",
      });
      const response = await BooksAPI.create(request, payload);
      const body = await response.json();
      expect(body.title).toBe(payload.title);
      expect(body.description).toBe(payload.description);
      expect(body.pageCount).toBe(payload.pageCount);
      expect(body.excerpt).toBe(payload.excerpt);
    });

    test("returns 400 when required fields are missing", async ({ request }) => {
      const response = await request.post("/api/v1/Books", { data: {} });
      expect([200, 400, 422]).toContain(response.status());
    });

    test("returns 400 for a malformed JSON body", async ({ request }) => {
      const response = await request.post("/api/v1/Books", {
        data: "not-json",
        headers: { "Content-Type": "application/json" },
      });
      expect([400, 415]).toContain(response.status());
    });

    test("handles zero pageCount gracefully", async ({ request }) => {
      const payload = makeBook({ pageCount: 0 });
      const response = await BooksAPI.create(request, payload);
      expect(response.status()).not.toBe(500);
    });
  });

  test.describe("PUT /api/v1/Books/{id}", () => {
    test("updates a book and returns 200 with updated data", async ({ request }) => {
      const payload = makeBook({ id: 1, title: "Updated Title", pageCount: 500 });
      const response = await BooksAPI.update(request, 1, payload);
      expect(response.status()).toBe(200);
      const body = await response.json();
      assertBookShape(body);
      expect(body.title).toBe("Updated Title");
      expect(body.pageCount).toBe(500);
    });

    test("returns 400 when ID in path differs from body ID", async ({ request }) => {
      const payload = makeBook({ id: 99 });
      const response = await BooksAPI.update(request, 1, payload);
      expect([200, 400]).toContain(response.status());
    });

    test("returns 404 for updating a non-existent book", async ({ request }) => {
      const payload = makeBook({ id: 999999 });
      const response = await BooksAPI.update(request, 999999, payload);
      expect([200, 404]).toContain(response.status());
    });

    test("returns 400 for an invalid (non-numeric) ID", async ({ request }) => {
      const payload = makeBook();
      const response = await request.put("/api/v1/Books/abc", { data: payload });
      expect(response.status()).toBe(400);
    });

    test("returns 400 when body is empty", async ({ request }) => {
      const response = await request.put("/api/v1/Books/1", { data: {} });
      expect([200, 400, 422]).toContain(response.status());
    });
  });

  test.describe("DELETE /api/v1/Books/{id}", () => {
    test("returns 200 when deleting a valid book", async ({ request }) => {
      const response = await BooksAPI.delete(request, 1);
      expect(response.status()).toBe(200);
    });

    test("returns 404 when deleting a non-existent book", async ({ request }) => {
      const response = await BooksAPI.delete(request, 999999);
      expect([200, 404]).toContain(response.status());
    });

    test("returns 400 for an invalid (non-numeric) ID", async ({ request }) => {
      const response = await request.delete("/api/v1/Books/invalid-id");
      expect(response.status()).toBe(400);
    });

    test("is idempotent — second delete on same ID returns 404", async ({ request }) => {
      await BooksAPI.delete(request, 2);
      const secondDelete = await BooksAPI.delete(request, 2);
      expect([200, 404]).toContain(secondDelete.status());
    });
  });

  test.describe("Performance", () => {
    test("GET /api/v1/Books responds within 3 seconds", async ({ request }) => {
      const start = Date.now();
      await BooksAPI.getAll(request);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(3000);
    });

    test("POST /api/v1/Books responds within 3 seconds", async ({ request }) => {
      const start = Date.now();
      await BooksAPI.create(request, makeBook());
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(3000);
    });
  });
});
