// src/api/index.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://cleanupsystems.shop/api";

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
): Promise<T> {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "API 요청 실패");
    }

    return data;
}