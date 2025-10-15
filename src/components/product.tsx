import { ChevronLeft, Package, Truck, Shield } from 'lucide-react';
import { useEffect, useState } from "react";

interface Product {
    id: number;
    name: string;
    spec: string;
    price: number;
    stock: number;
    emoji?: string;
    description?: string;
    features?: string[];
    detail_images?: string[];
    created_at?: string;
    updated_at?: string;
    status?: "draft" | "scheduled" | "active" | "stopped";
    release_date?: string;
    is_visible?: boolean;
    image_url?: string;
}

interface ProductDetailPageProps {
    navigate: (path: string) => void;
    user: any;
    productId?: number;
}

const ProductDetailPage = ({ navigate, user, productId }: ProductDetailPageProps) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"info" | "detail" | "refund">("info");

    // ✅ 데이터 로드
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`https://jimo.world/api/products/${productId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) throw new Error("상품 조회 실패");
                const data = await res.json();
                setProduct(data);
            } catch (err) {
                console.error("상품 불러오기 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [user, navigate, productId]);

    // ✅ 로딩 처리
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">상품 정보를 찾을 수 없습니다.</p>
                    <button
                        onClick={() => navigate('/home')}
                        className="mt-4 px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // ✅ 상태 및 출시일 계산
    // ✅ 상태 및 출시일 계산 (수정)
    const now = new Date();
    const releaseDate = product.release_date ? new Date(product.release_date) : null;
    const isBeforeRelease = releaseDate && releaseDate > now;

    let displayStatus: "before" | "active" | "stopped" | "draft" | "ended" = "draft";

    if (product.stock === 0) {
        displayStatus = "ended";  // 재고 0이면 판매 종료
    } else if (isBeforeRelease) {
        displayStatus = "before";
    } else if (product.status === "active") {
        displayStatus = "active";
    } else if (product.status === "stopped") {
        displayStatus = "stopped";
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-medium">상품 목록으로</span>
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div
                        className="rounded-3xl aspect-square flex items-center justify-center overflow-hidden relative bg-transparent cursor-pointer hover:opacity-90 transition"
                        onClick={() => product.image_url && setPreviewImage(product.image_url)}
                    >
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-9xl">{product.emoji || "📦"}</span>
                        )}
                    </div>

                    {previewImage && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
                            onClick={() => setPreviewImage(null)}
                        >
                            <img
                                src={previewImage}
                                alt="미리보기"
                                className="max-w-full max-h-full object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    {/* 상품 정보 */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold text-gray-900">
                                    {product.price.toLocaleString()}원
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">재고 {product.stock}개 남음</p>
                        </div>

                        {/* ✅ 상태 배지 */}
                        <div className="mb-6">
                            {displayStatus === "before" && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    판매 대기중
                                </div>
                            )}
                            {displayStatus === "active" && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    판매 진행중
                                </div>
                            )}
                            {displayStatus === "stopped" && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    판매 중지됨
                                </div>
                            )}
                            {product.status === "draft" && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    임시 저장
                                </div>
                            )}
                        </div>

                        {/* ✅ 출시일 표시 */}
                        {displayStatus === "before" && releaseDate && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700">
                                    출시 예정일:&nbsp;
                                    {releaseDate.toLocaleString("ko-KR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        )}

                        {/* ✅ 구매 버튼 */}
                        {/* ✅ 구매 버튼 - ended 케이스 추가 */}
                        <button
                            onClick={() => displayStatus === "active" && navigate(`/purchase?productId=${product.id}`)}
                            disabled={displayStatus !== "active"}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                                displayStatus === "active"
                                    ? "bg-brand text-white hover:bg-brand/90"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {displayStatus === "before" && "출시 전입니다"}
                            {displayStatus === "active" && "구매하기"}
                            {displayStatus === "stopped" && "판매 중지됨"}
                            {displayStatus === "ended" && "품절"}
                            {product.status === "draft" && "임시 저장 상태"}
                        </button>

                        {/* ✅ 혜택 안내 */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Package size={18} className="text-brand"/>
                                <span>1인 1대 한정 구매</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Truck size={18} className="text-brand"/>
                                <span>구매 후 7일 이내 수령</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Shield size={18} className="text-brand"/>
                                <span>판매사 공식 보증</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ 탭 메뉴 */}
                <div className="bg-white border-b border-gray-200 sticky top-[55px] z-10">
                    <div className="max-w-5xl mx-auto flex">
                        <button
                            onClick={() => setActiveTab("detail")}
                            className={`flex-1 py-5 text-center font-semibold transition ${
                                activeTab === "detail"
                                    ? "text-brand border-b-2 border-brand"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            상세정보
                        </button>
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`flex-1 py-5 text-center font-semibold transition ${
                                activeTab === "info"
                                    ? "text-brand border-b-2 border-brand"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            구매정보
                        </button>

                        <button
                            onClick={() => setActiveTab("refund")}
                            className={`flex-1 py-5 text-center font-semibold transition ${
                                activeTab === "refund"
                                    ? "text-brand border-b-2 border-brand"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            배송 및 환불
                        </button>
                    </div>
                </div>

                {/* ✅ 탭 콘텐츠 */}
                <div className="bg-white overflow-hidden">
                {/* 구매정보 탭 */}
                    {activeTab === "info" && (
                        <div className="animate-fadeIn">
                            <img
                                src="/info.png"
                                alt="구매 정보"
                                className="w-full block"
                            />
                        </div>
                    )}

                    {/* 상세정보 탭 */}
                    {activeTab === "detail" && (
                        <div className="animate-fadeIn">
                            <div
                                className={`relative transition-all duration-500 ease-in-out ${
                                    isDetailOpen ? "max-h-none" : "max-h-[500px] overflow-hidden"
                                }`}
                            >
                                <img
                                    src="/detail.png"
                                    alt="상세 정보"
                                    className="w-full block"
                                />

                                {!isDetailOpen && (
                                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-6">
                                        <button
                                            onClick={() => setIsDetailOpen(true)}
                                            className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full shadow-lg hover:bg-gray-800 transition"
                                        >
                                            상세정보 더보기 ▼
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isDetailOpen && (
                                <div className="flex justify-center p-6 bg-white border-t border-gray-100">
                                    <button
                                        onClick={() => setIsDetailOpen(false)}
                                        className="px-8 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition"
                                    >
                                        접기 ▲
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 배송 및 환불 탭 */}
                    {activeTab === "refund" && (
                        <div className="p-8 animate-fadeIn">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">배송 및 환불 정보</h2>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">배송 안내</h3>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700 min-w-[100px]">배송 방법</span>
                                        <span>택배 배송</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700 min-w-[100px]">배송 기간</span>
                                        <span>결제 완료 후 7일 이내 수령</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700 min-w-[100px]">배송 비용</span>
                                        <span>무료 배송</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">환불 규정</h3>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700 min-w-[100px]">교환/반품</span>
                                        <span>상품 수령 후 7일 이내 가능 (단순 변심 시 왕복 배송비 고객 부담)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700 min-w-[100px]">불량 제품</span>
                                        <span>수령 후 14일 이내 무상 교환 또는 환불 (배송비 판매자 부담)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700 min-w-[100px]">환불 기간</span>
                                        <span>반품 승인 후 3-5 영업일 내 환불 처리</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-300">
                                <p className="text-xs text-gray-500">
                                    * 상세한 교환/환불 절차는 고객센터(010-2385-4214)로 문의해주세요.<br/>
                                    * 전자상거래법 및 소비자보호법에 따라 소비자의 권리가 보호됩니다.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;