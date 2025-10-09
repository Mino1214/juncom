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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // ✅ 상태 및 출시일 계산
    const now = new Date();
    const releaseDate = product.release_date ? new Date(product.release_date) : null;
    const isBeforeRelease = releaseDate && releaseDate > now;

    let displayStatus: "before" | "active" | "stopped" | "draft" = "draft";
    if (isBeforeRelease) displayStatus = "before";
    else if (product.status === "active") displayStatus = "active";
    else if (product.status === "stopped") displayStatus = "stopped";

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
                    {/* ✅ 상품 이미지 - 세로로 길게 */}
                    <div
                        className="rounded-3xl aspect-[4/5] flex items-center justify-center overflow-hidden relative bg-transparent">
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

                    {/* 상품 정보 */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                            <p className="text-lg text-gray-600">{product.spec}</p>
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
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    판매 대기중
                                </div>
                            )}
                            {displayStatus === "active" && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    판매 진행중
                                </div>
                            )}
                            {displayStatus === "stopped" && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                    판매 중지됨
                                </div>
                            )}
                            {product.status === "draft" && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                                    임시 저장 상태
                                </div>
                            )}
                        </div>

                        {/* ✅ 출시일 표시 */}
                        {displayStatus === "before" && releaseDate && (
                            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    📅 출시 예정:{" "}
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
                        <button
                            onClick={() => displayStatus === "active" && navigate("/purchase")}
                            disabled={displayStatus !== "active"}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                                displayStatus === "active"
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {displayStatus === "before" && "출시 전입니다"}
                            {displayStatus === "active" && "구매하기"}
                            {displayStatus === "stopped" && "판매 중지됨"}
                            {product.status === "draft" && "임시 저장 상태"}
                        </button>

                        {/* ✅ 혜택 안내 */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Package size={18} className="text-blue-600" />
                                <span>1인 1대 한정 구매</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Truck size={18} className="text-blue-600" />
                                <span>구매 후 7일 이내 수령</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Shield size={18} className="text-blue-600" />
                                <span>제조사 공식 보증</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ 상품 설명 */}
                <div className="bg-white rounded-2xl p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">상품 설명</h2>
                    <p className="text-gray-600 leading-relaxed">
                        {product.description || '상품 설명이 없습니다.'}
                    </p>
                </div>

                {/* ✅ 상세 이미지 */}
                {product.detail_images && product.detail_images.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 mt-6">
                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                isDetailOpen ? "max-h-none" : "max-h-[500px] overflow-hidden"
                            }`}
                        >
                            {product.detail_images.map((imageUrl, index) => (
                                <img
                                    key={index}
                                    src={imageUrl}
                                    alt={`${product.name} 상세 이미지 ${index + 1}`}
                                    className="w-full block"
                                />
                            ))}

                            {!isDetailOpen && (
                                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/90 to-transparent flex items-end justify-center">
                                    <button
                                        onClick={() => setIsDetailOpen(true)}
                                        className="mb-4 px-6 py-2 bg-gray-900 text-white text-sm rounded-full shadow-lg hover:bg-gray-800"
                                    >
                                        더보기
                                    </button>
                                </div>
                            )}
                        </div>

                        {isDetailOpen && (
                            <div className="flex justify-center p-4 border-t border-gray-100">
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-300"
                                >
                                    접기 ▲
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;