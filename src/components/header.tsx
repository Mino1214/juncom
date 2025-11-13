import { User } from "lucide-react";
import {useState} from "react";
import {jwtDecode} from "jwt-decode"; // 이미 import 돼 있을 가능성 있음

interface JwtPayload {
    role?: string;
    name?: string;
    email?: string;
}

const Header = ({ user, setUser, navigate }: any) => {
    const [open, setOpen] = useState(false);

    // ✅ 관리자 판별
    let isAdmin = false;
    const token = localStorage.getItem("token");

    if (token) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            isAdmin = decoded.role === "admin";
        } catch (e) {
            console.error("JWT decode error", e);
        }
    }

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img
                        src="/KPMG_logo.png"
                        alt="KPMG Logo"
                        className="h-10 object-contain"
                    />
                    <span className="font-bold text-lg">임직원 전용 판매 페이지</span>
                </div>
                <div className="relative">
                    {/* 아이콘 버튼 */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition"
                    >
                        <User className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {open && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                            {/* 사용자 정보 섹션 */}
                            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-brand-50 to-purple-50">
                                <p className="text-sm font-semibold text-gray-800">
                                    {user?.name ? `${user.name}님` : "게스트"}
                                </p>
                            </div>

                            {/* 메뉴 아이템들 */}
                            <div className="py-1">
                                {/* ✅ 관리자 전용 메뉴 */}
                                {isAdmin && (
                                    <button
                                        onClick={() => {
                                            navigate("/admin");
                                            setOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-all duration-200 flex items-center gap-2 group"
                                    >
                                        <svg
                                            className="w-4 h-4 text-yellow-500 group-hover:text-yellow-600 transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        관리자 리모컨
                                    </button>
                                )}

                                {/* 마이페이지 */}
                                <button
                                    onClick={() => {
                                        navigate("/mypage");
                                        setOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-brand-50 hover:to-purple-50 transition-all duration-200 flex items-center gap-2 group"
                                >
                                    <svg
                                        className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    마이페이지
                                </button>

                                {/* 로그아웃 */}
                                <button
                                    onClick={() => {
                                        setUser(null);
                                        localStorage.removeItem("token");
                                        navigate("/login");
                                        setOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center gap-2 group"
                                >
                                    <svg
                                        className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;