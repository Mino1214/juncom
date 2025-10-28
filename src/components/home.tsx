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
    const [products, setProducts] = useState<Product[]>([]); // 배열로 변경
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // ✅ 403 에러 처리 함수
    const handle403Error = () => {
        alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "#/login"; // 맨 처음 도메인으로 이동
    };

    // ✅ 상품 불러오기
    useEffect(() => {
        if (!user) {
            navigate("#/login");
            return;
        }

        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("https://jimo.world/api/products/visible",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });

                // 403 에러 체크
                if (res.status === 403) {
                    handle403Error();
                    return;
                }

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log("Fetched products:", data);
                setProducts(data); // 전체 배열 저장
            } catch (error) {
                console.error("상품 불러오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        const interval = setInterval(fetchProducts, 10000);
        return () => clearInterval(interval);
    }, [user, navigate]);

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">현재 표시할 상품이 없습니다.</p>
            </div>
        );
    }

    // 상품별 판매 상태 계산 함수
    const getSaleStatus = (product: Product) => {
        const now = new Date();
        const releaseDate = product.release_date ? new Date(product.release_date) : null;
        const isBeforeRelease = releaseDate && releaseDate > now;
        const isAfterRelease = !releaseDate || (releaseDate && releaseDate <= now);

        if (product.status === "stopped") {
            return "stopped";
        } else if (isBeforeRelease) {
            return "before";
        } else if (isAfterRelease && product.status === "active" && product.stock > 0) {
            return "active";
        } else if (product.stock === 0) {
            return "ended";
        } else {
            return "active";
        }
    };

    // 상태 배지 컴포넌트
    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "before":
                return (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        <Clock size={12} />
                        판매 예정
                    </div>
                );
            case "active":
                return (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        판매중
                    </div>
                );
            case "stopped":
                return (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                        <PauseCircle size={12} />
                        판매 중지
                    </div>
                );
            default:
                return (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                        <Check size={12} />
                        판매 종료
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="/KPMG_logo.png" alt="KPMG Logo" className="h-10 object-contain" />
                        <span className="font-bold text-lg">임직원 전용 판매 페이지</span>
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
                                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-brand-50 to-purple-50">
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
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-brand-50 hover:to-purple-50 flex items-center gap-2"
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

            <div className="max-w-7xl mx-auto p-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">진행중인 혜택</h1>

                {/* 상품 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                        const saleStatus = getSaleStatus(product);

                        return (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1"
                            >
                                {/* 상품 이미지 */}
                                <div className="aspect-square overflow-hidden bg-gray-50 relative">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                    {/* 상태 배지 */}
                                    <div className="absolute top-3 right-3">
                                        <StatusBadge status={saleStatus} />
                                    </div>
                                </div>

                                {/* 상품 정보 */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>

                                    <div className="flex justify-between items-baseline mb-3">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {product.price.toLocaleString()}원
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-400 mb-4">
                                        재고 {product.stock}개
                                    </p>

                                    {/* 버튼 */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            className="w-full py-2.5 rounded-xl font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                                        >
                                            자세히 보기
                                        </button>

                                        <button
                                            disabled={saleStatus !== "active"}
                                            onClick={() => navigate(`/purchase?productId=${product.id}`)}
                                            className={`w-full py-2.5 rounded-xl font-semibold transition text-sm ${
                                                saleStatus === "active"
                                                    ? "bg-brand-600 text-white hover:bg-brand-700"
                                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            }`}
                                        >
                                            {saleStatus === "before"
                                                ? "판매 예정"
                                                : saleStatus === "active"
                                                    ? "구매하기"
                                                    : saleStatus === "stopped"
                                                        ? "판매 중지"
                                                        : "판매 종료"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HomePage;