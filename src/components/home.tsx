// 홈 페이지
import { type JwtPayload, type NavigateProps, useApp } from "../App.tsx";
import { Check, Clock, User, PauseCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export interface Product {
    id: number;
    name: string;
    spec?: string;
    price: number;
    stock: number;
    emoji?: string;
    description?: string;
    features?: string[];
    detail_images?: string[];
    image_url?: string;
    release_date?: string;
    status?: "draft" | "scheduled" | "active" | "stopped";
    is_visible?: boolean;
    created_at?: string;
    updated_at?: string;
}

const HomePage = ({ navigate }: NavigateProps) => {
    const { user, setUser } = useApp();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [open, setOpen] = useState(false);

    // ✅ 상품 불러오기
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("https://jimo.world/api/products/visible",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                const data = await res.json();

                setProduct(data[0] || null);
            } catch (error) {
                console.error("상품 불러오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        const interval = setInterval(fetchProduct, 10000);
        return () => clearInterval(interval);
    }, [user, navigate]);

    // ✅ 타이머 계산
    useEffect(() => {
        if (!product?.release_date) return;

        const releaseDate = new Date(product.release_date);
        const now = new Date();

        if (releaseDate <= now) return;

        const calculateTimeLeft = () => {
            const diff = Math.max(0, releaseDate.getTime() - new Date().getTime());
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            return { days, hours, minutes, seconds };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [product]);

    const token = localStorage.getItem("token");
    let isAdmin = false;
    if (token) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            isAdmin = decoded.role === "admin";
        } catch (e) {
            console.error("JWT decode error", e);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">현재 표시할 상품이 없습니다.</p>
            </div>
        );
    }

    const now = new Date();
    const releaseDate = product.release_date ? new Date(product.release_date) : null;
    const isBeforeRelease = releaseDate && releaseDate > now;
    const isAfterRelease = releaseDate && releaseDate <= now;

    let saleStatus: "before" | "active" | "stopped" | "ended" = "before";
    if (product.status === "stopped") {
        saleStatus = "stopped";
    } else if (isBeforeRelease) {
        saleStatus = "before";
    } else if (isAfterRelease && product.status === "active") {
        saleStatus = "active";
    } else {
        saleStatus = "ended";
    }

    const Countdown = () => {
        switch (saleStatus) {
            case "before":
                return (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-8 rounded-xl">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <Clock className="text-yellow-600" size={24} />
                                <p className="font-bold text-2xl text-yellow-900">출시까지 남은 시간</p>
                            </div>
                            <div className="flex justify-center gap-3 mb-4">
                                {["일", "시간", "분", "초"].map((label, i) => {
                                    const val = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds][i];
                                    return (
                                        <div key={label} className="bg-white rounded-lg p-4 min-w-[80px] shadow-sm">
                                            <div className="text-4xl font-bold text-gray-900">
                                                {String(val).padStart(2, "0")}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">{label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-sm text-yellow-800">
                                {releaseDate?.toLocaleString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}{" "}
                                출시 예정
                            </p>
                        </div>
                    </div>
                );

            case "active":
                return (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-8 rounded-xl">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="font-bold text-3xl text-green-900">판매 중</p>
                            </div>
                            <p className="text-lg text-green-800">현재 구매 가능합니다.</p>
                        </div>
                    </div>
                );

            case "stopped":
                return (
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 p-8 rounded-xl">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <PauseCircle className="text-gray-600" size={28} />
                                <p className="font-bold text-3xl text-gray-900">판매 중지됨</p>
                            </div>
                            <p className="text-lg text-gray-700">관리자에 의해 일시 중단되었습니다.</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 p-8 rounded-xl">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <Check className="text-gray-600" size={28} />
                                <p className="font-bold text-3xl text-gray-900">판매 종료</p>
                            </div>
                            <p className="text-lg text-gray-700">모든 상품이 품절되었습니다.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="/KPMG_logo.png" alt="KPMG Logo" className="h-10 object-contain" />
                        <span className="font-bold text-lg">임직원 복지몰</span>
                    </div>
                    <div className="relative">
                        {isAdmin && (
                            <button
                                onClick={() => navigate("/admin")}
                                className="fixed bottom-20 right-4 bg-black text-white text-sm px-4 py-2 rounded-full shadow-lg z-50"
                            >
                                🛠 관리자 리모컨
                            </button>
                        )}

                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition"
                        >
                            <User className="w-5 h-5 text-gray-600" />
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-purple-50">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {user?.name ? `${user.name}님` : "게스트"}
                                    </p>
                                </div>

                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            navigate("/mypage");
                                            setOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center gap-2"
                                    >
                                        마이페이지
                                    </button>

                                    <button
                                        onClick={() => {
                                            setUser(null);
                                            navigate("/login");
                                            setOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 py-8">
                {/* 데스크톱: 좌우 레이아웃, 모바일: 세로 레이아웃 */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* 상태 배너 (왼쪽 - 40%) */}
                    <div className="w-full lg:w-[40%]">
                        <Countdown/>
                    </div>

                    {/* 상품 카드 (오른쪽 - 60%) */}
                    <div className="w-full lg:w-[60%]">
                        <div
                            className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1">

                            {/* ✅ 이미지 더 커지게 조정 */}
                            <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* ✅ 여백 확대 + 시각적 강조 */}
                            <div className="p-6">
                                <h3 className="font-bold text-2xl text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-5">{product.description}</p>

                                <div className="flex justify-between items-baseline mb-2">
            <span className="text-3xl font-bold text-gray-900">
              {product.price.toLocaleString()}원
            </span>
                                </div>

                                <p className="text-xs text-gray-400 mb-4">재고 {product.stock}개</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="w-full py-3.5 rounded-xl font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        자세히 보기
                                    </button>

                                    <button
                                        disabled={saleStatus !== "active"}
                                        onClick={() => navigate("/purchase")}
                                        className={`w-full py-3.5 rounded-xl font-semibold transition ${
                                            saleStatus === "active"
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {saleStatus === "before"
                                            ? "출시 대기중"
                                            : saleStatus === "active"
                                                ? "구매하기"
                                                : saleStatus === "stopped"
                                                    ? "판매 중지"
                                                    : "판매 종료"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;