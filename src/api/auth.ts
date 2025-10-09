// src/api/auth.ts
import { apiRequest } from "./index";

export async function login(employeeId: string, password: string) {
    return apiRequest<{
        message: string;
        token: string;
        user: {
            name: string;
            employeeId: string;
            email?: string;
            role?: string;
        };
    }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ employeeId, password }),
    }, false);
}

export async function signup(payload: any) {
    return apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
    }, false);
}

export async function getMyInfo() {
    return apiRequest("/user/me");
}