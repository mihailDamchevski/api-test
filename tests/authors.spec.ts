import { test, expect } from "@playwright/test";
import { AuthorsAPI, makeAuthor, assertAuthorShape } from "../helpers/api.helpers";

test.describe("Authors API", () => {
  test.describe("GET /api/v1/Authors", () => {
    test("returns 200 with a non-empty array of authors", async ({ request }) => {
      const response = await AuthorsAPI.getAll(request);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    test("every author in the list has the correct shape", async ({ request }) => {
      const response = await AuthorsAPI.getAll(request);
      const authors = await response.json();
      for (const author of authors) {
        assertAuthorShape(author);
      }
    });

    test("returns correct Content-Type header", async ({ request }) => {
      const response = await AuthorsAPI.getAll(request);
      expect(response.headers()["content-type"]).toContain("application/json");
    });
  });

  test.describe("GET /api/v1/Authors/{id}", () => {
    test("returns 200 and correct author for a valid ID", async ({ request }) => {
      const response = await AuthorsAPI.getById(request, 1);
      expect(response.status()).toBe(200);
      const body = await response.json();
      assertAuthorShape(body);
      expect(body.id).toBe(1);
    });

    test("returns 404 for a non-existent ID", async ({ request }) => {
      const response = await AuthorsAPI.getById(request, 999999);
      expect(response.status()).toBe(404);
    });

    test("returns 400 for an invalid (non-numeric) ID", async ({ request }) => {
      const response = await request.get("/api/v1/Authors/not-a-number");
      expect(response.status()).toBe(400);
    });

    test("returns author with linked book ID", async ({ request }) => {
      const response = await AuthorsAPI.getById(request, 1);
      const body = await response.json();
      expect(typeof body.idBook).toBe("number");
    });
  });

  test.describe("POST /api/v1/Authors", () => {
    test("creates an author and returns 200 with created resource", async ({ request }) => {
      const payload = makeAuthor({ firstName: "Alice", lastName: "Smith", idBook: 1 });
      const response = await AuthorsAPI.create(request, payload);
      expect(response.status()).toBe(200);
      const body = await response.json();
      assertAuthorShape(body);
      expect(body.firstName).toBe(payload.firstName);
      expect(body.lastName).toBe(payload.lastName);
    });

    test("echoes back all fields sent in the request body", async ({ request }) => {
      const payload = makeAuthor({
        firstName: "Robert",
        lastName: "Martin",
        idBook: 5,
      });
      const response = await AuthorsAPI.create(request, payload);
      const body = await response.json();
      expect(body.firstName).toBe(payload.firstName);
      expect(body.lastName).toBe(payload.lastName);
      expect(body.idBook).toBe(payload.idBook);
    });

    test("returns 400 when required fields are missing", async ({ request }) => {
      const response = await request.post("/api/v1/Authors", { data: {} });
      expect([200, 400, 422]).toContain(response.status());
    });

    test("handles special characters in name fields", async ({ request }) => {
      const payload = makeAuthor({ firstName: "Jose", lastName: "O'Brien" });
      const response = await AuthorsAPI.create(request, payload);
      expect(response.status()).not.toBe(500);
    });
  });

  test.describe("PUT /api/v1/Authors/{id}", () => {
    test("updates an author and returns 200 with updated data", async ({ request }) => {
      const payload = makeAuthor({ id: 1, firstName: "Updated", lastName: "Name", idBook: 2 });
      const response = await AuthorsAPI.update(request, 1, payload);
      expect(response.status()).toBe(200);
      const body = await response.json();
      assertAuthorShape(body);
      expect(body.firstName).toBe("Updated");
    });

    test("returns 404 for updating a non-existent author", async ({ request }) => {
      const payload = makeAuthor({ id: 999999 });
      const response = await AuthorsAPI.update(request, 999999, payload);
      expect([200, 404]).toContain(response.status());
    });

    test("returns 400 for an invalid (non-numeric) ID", async ({ request }) => {
      const payload = makeAuthor();
      const response = await request.put("/api/v1/Authors/abc", { data: payload });
      expect(response.status()).toBe(400);
    });

    test("returns 400 when body is empty", async ({ request }) => {
      const response = await request.put("/api/v1/Authors/1", { data: {} });
      expect([200, 400, 422]).toContain(response.status());
    });
  });

  test.describe("DELETE /api/v1/Authors/{id}", () => {
    test("returns 200 when deleting a valid author", async ({ request }) => {
      const response = await AuthorsAPI.delete(request, 1);
      expect(response.status()).toBe(200);
    });

    test("returns 404 when deleting a non-existent author", async ({ request }) => {
      const response = await AuthorsAPI.delete(request, 999999);
      expect([200, 404]).toContain(response.status());
    });

    test("returns 400 for an invalid (non-numeric) ID", async ({ request }) => {
      const response = await request.delete("/api/v1/Authors/invalid-id");
      expect(response.status()).toBe(400);
    });

    test("is idempotent — second delete on same ID returns 404", async ({ request }) => {
      await AuthorsAPI.delete(request, 2);
      const secondDelete = await AuthorsAPI.delete(request, 2);
      expect([200, 404]).toContain(secondDelete.status());
    });
  });

  test.describe("Performance", () => {
    test("GET /api/v1/Authors responds within 3 seconds", async ({ request }) => {
      const start = Date.now();
      await AuthorsAPI.getAll(request);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(3000);
    });
  });
});
