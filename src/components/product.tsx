import { ChevronLeft, Package, Truck, Shield, AlertCircle } from 'lucide-react';
import {useEffect, useState} from "react";

interface Product {
    id: number;
    name: string;
    spec: string;
    price: number;
    stock: number;
    emoji: string;
    description?: string;
    features?: string[];
    detailImages?: string[];
}

interface User {
    name: string;
    employeeId: string;
}

interface SaleInfo {
    product: Product;
    sale: {
        id: number;
        saleStart: string;
        saleEnd: string;
        totalStock: number;
        remainingStock: number;
        status: 'before' | 'during' | 'after';
        secondsUntilStart: number;
    };
}

interface ProductDetailPageProps {
    navigate: (path: string) => void;
    user: User | null;
    saleStatus?: 'before' | 'during' | 'after';
    productId?: number; // 선택적으로 변경
}

const ProductDetailPage = ({ navigate, user }: ProductDetailPageProps) => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [saleInfo, setSaleInfo] = useState<SaleInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // 판매 정보 가져오기
        const fetchSaleInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch('https://jimo.world/api/sale/current',
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`, // ✅ 토큰 첨부
                            "Content-Type": "application/json",
                        },
                    });
                const data = await response.json();
                setSaleInfo(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch sale info:', error);
                setLoading(false);
            }
        };

        fetchSaleInfo();
    }, [user, navigate]);

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

    if (!saleInfo) {
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

    const { product, sale } = saleInfo;
    const saleStatus = sale.status;

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
                    {/* 상품 이미지 */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-16 flex items-center justify-center">
                        <span className="text-9xl">{product.emoji}</span>
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
                            <p className="text-sm text-gray-500">
                                재고 {sale.remainingStock}/{sale.totalStock}대 남음
                            </p>
                        </div>

                        {/* 상태 배지 */}
                        <div className="mb-6">
                            {saleStatus === 'before' && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    판매 대기중
                                </div>
                            )}
                            {saleStatus === 'during' && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    판매 진행중
                                </div>
                            )}
                            {saleStatus === 'after' && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                    품절
                                </div>
                            )}
                        </div>

                        {/* 판매 시작 시간 표시 (before 상태일 때) */}
                        {saleStatus === 'before' && (
                            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    📅 판매 시작: {new Date(sale.saleStart).toLocaleString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                </p>
                            </div>
                        )}

                        {/* 구매 버튼 */}
                        <button
                            onClick={() => saleStatus === 'during' && navigate('/purchase')}
                            disabled={saleStatus !== 'during'}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                                saleStatus === 'during'
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {saleStatus === 'before' && '판매 시작 전입니다'}
                            {saleStatus === 'during' && '구매하기'}
                            {saleStatus === 'after' && '품절되었습니다'}
                        </button>

                        {/* 혜택 안내 */}
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

                {/* 상품 설명 */}
                <div className="bg-white rounded-2xl p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">상품 설명</h2>
                    <p className="text-gray-600 leading-relaxed">
                        {product.description || '상품 설명이 없습니다.'}
                    </p>
                </div>

                {/* 주요 특징 */}
                {product.features && product.features.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">주요 특징</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {product.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 주의사항 */}
                <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
                    <div className="flex gap-3">
                        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-semibold text-yellow-900 mb-3">구매 전 확인사항</h3>
                            <ul className="text-sm text-yellow-800 space-y-2">
                                <li>• 임직원 복지 프로그램의 일환으로 할인된 가격으로 제공됩니다</li>
                                <li>• 1인 1대 한정으로 구매 가능하며, 중복 구매 시 주문이 취소됩니다</li>
                                <li>• 구매 후 취소 및 환불이 불가능하니 신중하게 선택해 주세요</li>
                                <li>• 수령은 구매일로부터 7일 이내 본사 1층 로비에서 가능합니다</li>
                                <li>• 재고 소진 시 판매가 조기 종료될 수 있습니다</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 상세 이미지 (접기/펼치기) */}
                {product.detailImages && product.detailImages.length > 0 && (
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 mt-6">
                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                isDetailOpen ? "max-h-none" : "max-h-[500px] overflow-hidden"
                            }`}
                        >
                            {product.detailImages.map((imageUrl, index) => (
                                <img
                                    key={index}
                                    src={imageUrl}
                                    alt={`${product.name} 상세 이미지 ${index + 1}`}
                                    className="w-full"
                                />
                            ))}

                            {!isDetailOpen && (
                                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent flex items-end justify-center">
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
                            <div className="flex justify-center p-4 border-t">
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