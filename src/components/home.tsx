// 홈 페이지
import { type JwtPayload, type NavigateProps, useApp } from "../App.tsx";
import { Check, Clock, User, PauseCircle, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import QueueModal from "./QueueModal.tsx";
// ✅ 수정된 admin 판별 부분
interface CustomJwtPayload {
    email?: string;
    role?: string;
}
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
    const [showQueue, setShowQueue] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

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

                // ✅ 여기서 직접 admin 판별
                // let isAdmin = false;
                if (token) {
                    try {
                        const decoded = jwtDecode<CustomJwtPayload>(token); // ✅ 명시적 타입 지정
                        isAdmin = decoded.email === "admin" || decoded.role === "admin";
                        // console.log("decoded token:", decoded);
                    } catch (e) {
                        console.error("JWT decode error", e);
                    }
                }

                // console.log("현재 로그인 상태:", isAdmin ? "관리자 계정" : "일반 사용자");

                // ✅ admin 계정이면 테스트용 더미데이터 바로 표시
                // if (isAdmin) {
                //     const response = await fetch("https://jimo.world/api/products/test", {
                //         headers: {
                //             "Authorization": `Bearer ${token}`,
                //             "Content-Type": "application/json",
                //         },
                //     });

                //     const testData = await response.json();
                //     console.log("관리자 테스트 모드 실행됨",testData);
                //     setProducts(
                //         testData);
                //     setLoading(false);
                //     return;
                // }
                // else {
                    // ✅ 일반 사용자용 실제 데이터 요청
                    const res = await fetch("https://jimo.world/api/products/visible", {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (res.status === 403) {
                        handle403Error();
                        return;
                    }

                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }

                    const data = await res.json();
                    // console.log("Fetched products:", data);
                    setProducts(data);
                // }


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

    // 카운트다운 타이머
    useEffect(() => {
        if (products.length === 0) return;

        const mainProduct = products[0];
        if (!mainProduct.release_date) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();

            // 🔥 KST 기반 파싱 (핵심 수정)
            const releaseDate = new Date(
                mainProduct.release_date!.replace(" ", "T") + "+09:00"
            ).getTime();

            const distance = releaseDate - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [products]);

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
    // 🔥 테스트 모드 (true면 모든 상품을 강제로 판매중 처리)
    // const TEST_SALE_ACTIVE = false; // ← 테스트할 때만 true로 잠깐 바꾸기
    // 🔥 수정된 getSaleStatus 함수
    // const getSaleStatus = (product: Product) => {
    //     // 1. 재고 체크를 가장 먼저 (최우선 조건)
    //     if (!product.stock || product.stock === 0) {f
    //         return "ended";  // 재고 없으면 무조건 판매 종료
    //     }
    //
    //     // 2. 상태가 stopped인 경우
    //     if (product.status === "stopped") {
    //         return "stopped";
    //     }
    //
    //     // 3. 출시일 체크
    //     if (product.release_date) {
    //         const now = new Date();
    //         const releaseDate = new Date(
    //             product.release_date.includes('T')
    //                 ? product.release_date
    //                 : product.release_date.replace(' ', 'T') + '+09:00'
    //         );
    //
    //         if (releaseDate > now) {
    //             return "before";  // 출시 전
    //         }
    //     }
    //
    //     // 4. 그 외 모든 경우는 판매중
    //     return "active";
    // };

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
                    // <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    //     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    //     판매중
                    // </div>
                    <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                        <PauseCircle size={12}/>
                        판매 종료
                    </div>
                );
            case "stopped":
                return (
                    <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
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

    const mainProduct = products[0]; // 첫 번째 상품을 메인으로
    const otherProducts = products.slice(1); // 나머지 상품들
    const mainSaleStatus = getSaleStatus(mainProduct);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
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
                                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-brand-50 to-purple-50 z-9999">
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
                {/* 메인 히어로 섹션 - 카운트다운과 메인 상품 */}
                <div
                    className="bg-gradient-to-r from-[#6A11CB] to-[#2575FC] rounded-3xl p-8 mb-12 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">

                        {/* 왼쪽: 카운트다운 타이머 */}
                        <div className="text-center md:text-left">
                            <div className="mb-6">
                                <p className="text-white/80 text-lg">
                                    {mainProduct.name}
                                </p>
                            </div>

                            {mainProduct.release_date && new Date(mainProduct.release_date) > new Date() ? (
                                // 출시 전 - 카운트다운 표시
                                <div className="grid grid-cols-4 gap-4 max-w-md mx-auto md:mx-0">
                                    {[
                                        {label: "일", value: timeLeft.days},
                                        {label: "시간", value: timeLeft.hours},
                                        {label: "분", value: timeLeft.minutes},
                                        {label: "초", value: timeLeft.seconds},
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-md"
                                        >
                                            <div className="text-3xl md:text-4xl font-bold drop-shadow-sm">
                                                {item.value.toString().padStart(2, '0')}
                                            </div>
                                            <div className="text-sm text-white/90 mt-1">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // 출시 후 - 재고 상태에 따라 다르게 표시
                                <div
                                    className="bg-white/25 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md mx-auto md:mx-0">
                                    {mainProduct.stock > 0 ? (
                                        // 재고 있음 - 판매중
                                        <>
                                            <div className="text-2xl font-bold flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                                판매중
                                            </div>
                                            <p className="text-white/80 mt-2">재고 {mainProduct.stock}개 남음</p>
                                        </>
                                    ) : (
                                        // 재고 없음 - 판매 종료
                                        <>
                                            <div className="text-2xl font-bold flex items-center gap-2">
                                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                                판매 종료
                                            </div>
                                            <p className="text-white/80 mt-2">재고 소진</p>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 flex items-center gap-2 text-white/80">
                                <Calendar className="w-5 h-5"/>
                                <span>
            출시일:{" "}
                                    {mainProduct.release_date
                                        ? new Date(mainProduct.release_date).toLocaleDateString("ko-KR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "미정"}
        </span>
                            </div>
                        </div>

                        {/* 오른쪽: 메인 상품 */}
                        {/* 메인 상품 카드 */}
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl
                w-full max-w-lg transform hover:scale-[1.02] transition-transform duration-300">
                            <div className="aspect-[4/4] overflow-hidden bg-gray-50 relative">
                                <img
                                    src={mainProduct.image_url}
                                    alt={mainProduct.name}
                                    className="w-full h-full object-cover object-center"
                                />
                                <div className="absolute top-4 right-4">
                                    <StatusBadge status={mainSaleStatus}/>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl text-gray-900 mb-2">
                                    {mainProduct.name}
                                </h3>
                                <p className="text-gray-600 mb-3 line-clamp-2 text-base">
                                    {mainProduct.description}
                                </p>
                                <div className="flex justify-between items-center mb-4">
      <span className="text-2xl font-bold text-gray-900">
        {mainProduct.price.toLocaleString()}원
      </span>
                                    <span className="text-sm text-gray-500">
        재고 {mainProduct.stock}개
      </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => navigate(`/product/${mainProduct.id}`)}
                                        className="py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                    >
                                        자세히 보기
                                    </button>

                                    <button
                                        disabled={mainSaleStatus !== "active"}
                                        onClick={async () => {
                                            if (mainSaleStatus !== "active") return;

                                            try {
                                                // 🔥 1. 시간 체크 먼저
                                                // const timeRes = await fetch('https://jimo.world/api/check/purchase-time', {
                                                //     method: 'POST',
                                                //     headers: {
                                                //         'Content-Type': 'application/json'
                                                //     },
                                                //     body: JSON.stringify({ productId: mainProduct.id })
                                                // });
                                                //
                                                // if (!timeRes.ok) {åç
                                                //     const timeData = await timeRes.json();
                                                //     alert(timeData.error);
                                                //     return;
                                                // }

                                                // 2. 블랙리스트 체크 (기존 코드)
                                                const res = await fetch(
                                                    `https://jimo.world/api/employee/status/check?email=${user?.email}`
                                                );
                                                const data = await res.json();

                                                if (data.is_blacklisted) {
                                                    alert("노트북 교체 시...");
                                                    return;
                                                }

                                                // 3. 모두 통과하면 QueueModal 열기
                                                setSelectedProductId(mainProduct.id);
                                                setShowQueue(true);

                                            } catch (e) {
                                                console.error("구매 검증 오류:", e);
                                                alert("일시적인 오류가 발생했습니다.");
                                            }
                                        }}
                                        className={`py-2.5 rounded-xl font-semibold text-white ${
                                            mainSaleStatus === "active"
                                                ? "bg-brand-600 hover:bg-brand-700"
                                                : "bg-gray-300 cursor-not-allowed"
                                        }`}
                                    >
                                        {mainSaleStatus === "before"
                                            ? "판매 예정"
                                            : mainSaleStatus === "active"
                                                ? "구매하기"
                                                : "판매 종료"}
                                    </button>

                                    {showQueue && selectedProductId !== null && (
                                        <QueueModal
                                            visible={showQueue}
                                            productId={selectedProductId}
                                            onReady={(orderId) => {
                                                setShowQueue(false);
                                                navigate(`/purchase?orderId=${orderId}`);
                                            }}
                                            onClose={() => setShowQueue(false)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 나머지 상품들 */}
                {otherProducts.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">다른 혜택 상품</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherProducts.map((product) => {
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
                                                <StatusBadge status={saleStatus}/>
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
                                                    onClick={() => {
                                                        if (saleStatus !== "active") return; // 클릭 차단
                                                        setSelectedProductId(product.id);
                                                        setShowQueue(true);
                                                    }}
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
                                                            : "판매 종료"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;
