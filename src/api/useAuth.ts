// src/hooks/useAuth.ts
import { useState } from "react";
import { login } from "../api/auth";
import {useNavigate} from "react-router-dom";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (employeeId: string, password: string) => {
        setLoading(true);
        setError("");

        try {
            const data = await login(employeeId, password);

            // ✅ 토큰 저장
            localStorage.setItem("token", data.token);

            // ✅ 사용자 정보 저장
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/home");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return { handleLogin, logout, loading, error };
}