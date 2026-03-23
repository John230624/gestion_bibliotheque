import {
  Book,
  BooksResponse,
  BorrowRequest,
  RequestsResponse,
  StatsResponse,
  User,
  UsersResponse,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type RequestOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Verifie que le backend fonctionne sur http://127.0.0.1:8000.");
  }

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      if (text.trim().startsWith("<")) {
        throw new ApiError(
          "Le backend a renvoye une page d erreur HTML. Verifie que le serveur Symfony et la base MySQL fonctionnent correctement."
        , response.status || 500);
      }

      throw new ApiError("Le serveur a renvoye une reponse invalide.", response.status || 500);
    }
  }

  if (!response.ok) {
    const errorPayload = payload as { message?: string } | null;
    throw new ApiError(errorPayload?.message ?? `API error ${response.status}`, response.status);
  }

  return payload as T;
}

export const api = {
  login: (payload: { username: string; password: string }) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  register: (payload: { fullName: string; email: string; phone?: string; password: string }) =>
    request<{ message: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: (token: string) => request<User>("/auth/me", { token }),
  updateMe: (token: string, payload: { fullName?: string; phone?: string; password?: string }) =>
    request<{ message: string; user: User }>("/auth/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),
  books: (params?: { q?: string; category?: string; available?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.category) query.set("category", params.category);
    if (params?.available) query.set("available", "true");
    const suffix = query.size ? `?${query.toString()}` : "";
    return request<BooksResponse>(`/books${suffix}`);
  },
  book: (id: number) => request<Book>(`/books/${id}`),
  createBook: (token: string, payload: Partial<Book>) =>
    request<{ message: string; book: Book }>("/books", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  updateBook: (token: string, id: number, payload: Partial<Book>) =>
    request<{ message: string; book: Book }>(`/books/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),
  deleteBook: (token: string, id: number) =>
    request<{ message: string }>(`/books/${id}`, {
      method: "DELETE",
      token,
    }),
  borrowRequests: (token: string) => request<RequestsResponse>("/borrow-requests", { token }),
  createBorrowRequest: (token: string, payload: { bookId: number; note?: string }) =>
    request<{ message: string; request: BorrowRequest }>("/borrow-requests", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  updateBorrowRequest: (
    token: string,
    id: number,
    payload: { status: BorrowRequest["status"]; note?: string }
  ) =>
    request<{ message: string; request: BorrowRequest }>(`/borrow-requests/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),
  deleteBorrowRequest: (token: string, id: number) =>
    request<{ message: string }>(`/borrow-requests/${id}`, {
      method: "DELETE",
      token,
    }),
  users: (token: string) => request<UsersResponse>("/admin/users", { token }),
  createUser: (
    token: string,
    payload: { fullName: string; email: string; phone?: string; password: string; roles: string[] }
  ) =>
    request<{ message: string; user: User }>("/admin/users", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  updateUser: (
    token: string,
    id: number,
    payload: { fullName?: string; email?: string; phone?: string; password?: string; roles?: string[] }
  ) =>
    request<{ message: string; user: User }>(`/admin/users/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),
  deleteUser: (token: string, id: number) =>
    request<{ message: string }>(`/admin/users/${id}`, {
      method: "DELETE",
      token,
    }),
  stats: (token: string) => request<StatsResponse>("/stats", { token }),
};
