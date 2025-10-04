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
    detailImages?: string[]; // 상세 설명 이미지 URL 배열
}

interface User {
    name: string;
    employeeId: string;
}

interface ProductDetailPageProps {
    navigate: (path: string) => void;
    user: User | null;
    saleStatus: 'before' | 'during' | 'after';
    productId: number;
}

const ProductDetailPage = ({ navigate, user, saleStatus, productId }: ProductDetailPageProps) => {
    const [isDetailOpen, setIsDetailOpen] = useState(false); // 상세 이미지 펼치기/접기 상태

    useEffect(() => {
        if (!user) navigate('#/login');
    }, [user, navigate]);

    // 실제로는 productId로 상품 정보를 가져와야 하지만, 여기서는 하드코딩
    const products: Product[] = [
        {
            id: 1,
            name: 'MacBook Pro 14" M3',
            spec: 'M3 칩 • 16GB • 512GB',
            price: 1200000,
            stock: 150,
            emoji: '💻',
            description: '강력한 성능의 M3 칩을 탑재한 MacBook Pro입니다. 전문가를 위한 최고의 선택입니다.',
            features: [
                'M3 Pro 칩으로 놀라운 성능',
                '14.2형 Liquid Retina XDR 디스플레이',
                '최대 18시간의 배터리 사용 시간',
                '16GB 통합 메모리',
                '512GB SSD 저장 공간',
                'MagSafe 3 충전 포트',
                '3개의 Thunderbolt 4 포트'
            ],
            detailImages: [
                'https://www.jungomall.com/web/upload/NNEditor/20250707/24d1de9c4bc3b42a1b2b60928bc931d7.jpg'
            ]
        },
        {
            id: 2,
            name: 'LG 그램 17',
            spec: 'Intel i7 • 16GB • 1TB',
            price: 980000,
            stock: 180,
            emoji: '💻',
            description: '초경량 대화면 노트북으로 휴대성과 생산성을 모두 갖췄습니다.',
            features: [
                '17인치 대화면 WQXGA 디스플레이',
                '1.35kg의 초경량 무게',
                'Intel Core i7 13세대 프로세서',
                '16GB DDR5 메모리',
                '1TB NVMe SSD',
                '최대 20시간 배터리',
                'Thunderbolt 4 지원'
            ],
            detailImages: [
                'https://www.jungomall.com/web/upload/NNEditor/20250707/24d1de9c4bc3b42a1b2b60928bc931d7.jpg'
            ]
        },
        {
            id: 3,
            name: 'Dell XPS 15',
            spec: 'Intel i9 • 32GB • 1TB',
            price: 1450000,
            stock: 170,
            emoji: '💻',
            description: '최고 사양의 프리미엄 노트북으로 모든 작업을 완벽하게 처리합니다.',
            features: [
                '15.6인치 4K OLED 터치 디스플레이',
                'Intel Core i9 13세대 프로세서',
                '32GB DDR5 메모리',
                '1TB PCIe NVMe SSD',
                'NVIDIA GeForce RTX 4060',
                'CNC 가공 알루미늄 섀시',
                '프리미엄 사운드 시스템'
            ],
            detailImages: [
                'https://www.jungomall.com/web/upload/NNEditor/20250707/24d1de9c4bc3b42a1b2b60928bc931d7.jpg'
            ]
        }
    ];

    const product = products.find(p => p.id === productId) || products[0];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('#/home')}
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
                            <p className="text-sm text-gray-500">재고 {product.stock}대 남음</p>
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

                        {/* 구매 버튼 */}
                        <button
                            onClick={() => saleStatus === 'during' && navigate('#/purchase')}
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
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* 주요 특징 */}
                <div className="bg-white rounded-2xl p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">주요 특징</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {product.features?.map((feature, index) => (
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
                                        className="mb-4 px-6 py-2 bg-gray-900 text-white text-sm rounded-full shadow-lg"
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