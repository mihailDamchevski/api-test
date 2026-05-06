import { APIRequestContext, expect } from "@playwright/test";

export interface Book {
  id: number;
  title: string;
  description: string;
  pageCount: number;
  excerpt: string;
  publishDate: string;
}

export interface Author {
  id: number;
  idBook: number;
  firstName: string;
  lastName: string;
}

export function makeBook(overrides: Partial<Book> = {}): Omit<Book, "id"> & { id?: number } {
  return {
    id: overrides.id ?? 0,
    title: overrides.title ?? "Test Book Title",
    description: overrides.description ?? "A test book description",
    pageCount: overrides.pageCount ?? 200,
    excerpt: overrides.excerpt ?? "A short excerpt of the book.",
    publishDate: overrides.publishDate ?? new Date().toISOString(),
  };
}

export function makeAuthor(overrides: Partial<Author> = {}): Omit<Author, "id"> & { id?: number } {
  return {
    id: overrides.id ?? 0,
    idBook: overrides.idBook ?? 1,
    firstName: overrides.firstName ?? "Jane",
    lastName: overrides.lastName ?? "Doe",
  };
}

export function assertBookShape(book: unknown) {
  expect(book).toMatchObject({
    id: expect.any(Number),
    title: expect.any(String),
    description: expect.any(String),
    pageCount: expect.any(Number),
    excerpt: expect.any(String),
    publishDate: expect.any(String),
  });
}

export function assertAuthorShape(author: unknown) {
  expect(author).toMatchObject({
    id: expect.any(Number),
    idBook: expect.any(Number),
    firstName: expect.any(String),
    lastName: expect.any(String),
  });
}

export const BooksAPI = {
  getAll: (request: APIRequestContext) => request.get("/api/v1/Books"),

  getById: (request: APIRequestContext, id: number) => request.get(`/api/v1/Books/${id}`),

  create: (request: APIRequestContext, payload: ReturnType<typeof makeBook>) =>
    request.post("/api/v1/Books", { data: payload }),

  update: (request: APIRequestContext, id: number, payload: ReturnType<typeof makeBook>) =>
    request.put(`/api/v1/Books/${id}`, { data: payload }),

  delete: (request: APIRequestContext, id: number) => request.delete(`/api/v1/Books/${id}`),
};

export const AuthorsAPI = {
  getAll: (request: APIRequestContext) => request.get("/api/v1/Authors"),

  getById: (request: APIRequestContext, id: number) => request.get(`/api/v1/Authors/${id}`),

  create: (request: APIRequestContext, payload: ReturnType<typeof makeAuthor>) =>
    request.post("/api/v1/Authors", { data: payload }),

  update: (request: APIRequestContext, id: number, payload: ReturnType<typeof makeAuthor>) =>
    request.put(`/api/v1/Authors/${id}`, { data: payload }),

  delete: (request: APIRequestContext, id: number) => request.delete(`/api/v1/Authors/${id}`),
};
