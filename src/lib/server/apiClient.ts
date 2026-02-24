import { cookies } from "next/headers";

type ApiOptions = {
  headers?: HeadersInit;
  body?: any;
  cache?: RequestCache;
};

const BASE_URL = "https://acadify-backend.thoughtproorion.com";

async function request(method: string, url: string, options: ApiOptions = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || "API request failed");
  }

  return data;
}

export const apiClient = {
  get: (url: string, options?: ApiOptions) => request("GET", url, options),
  post: (url: string, body?: any, options?: ApiOptions) =>
    request("POST", url, { ...options, body }),
  put: (url: string, body?: any, options?: ApiOptions) =>
    request("PUT", url, { ...options, body }),
  patch: (url: string, body?: any, options?: ApiOptions) =>
    request("PATCH", url, { ...options, body }),
  delete: (url: string, options?: ApiOptions) =>
    request("DELETE", url, options),
};