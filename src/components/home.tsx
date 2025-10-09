// 홈 페이지
import {type NavigateProps, type Product, useApp} from "../App.tsx";
import {Check, Clock} from "lucide-react";
import {useEffect, useState} from "react";

const HomePage = ({ navigate }: NavigateProps) => {
    const { user, setUser, saleStatus, setSaleStatus } = useApp();

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const products: Product[] = [
        {
            id: 1,
            name: 'MacBook Pro 14" M3',
            spec: 'M3 칩 • 16GB • 512GB',
            price: 1200000,
            stock: 150,
            emoji: '💻'
        },
        {
            id: 2,
            name: 'LG 그램 17',
            spec: 'Intel i7 • 16GB • 1TB',
            price: 980000,
            stock: 180,
            emoji: '💻'
        },
        {
            id: 3,
            name: 'Dell XPS 15',
            spec: 'Intel i9 • 32GB • 1TB',
            price: 1450000,
            stock: 170,
            emoji: '💻'
        }
    ];

    const Countdown = () => {
        const [timeLeft, setTimeLeft] = useState({ days: 6, hours: 23, minutes: 45, seconds: 30 });

        useEffect(() => {
            if (saleStatus !== 'before') return;

            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    let { days, hours, minutes, seconds } = prev;

                    if (seconds > 0) {
                        seconds--;
                    } else {
                        seconds = 59;
                        if (minutes > 0) {
                            minutes--;
                        } else {
                            minutes = 59;
                            if (hours > 0) {
                                hours--;
                            } else {
                                hours = 23;
                                if (days > 0) {
                                    days--;
                                }
                            }
                        }
                    }

                    return { days, hours, minutes, seconds };
                });
            }, 1000);

            return () => clearInterval(timer);
        }, [saleStatus]);

        if (saleStatus === 'before') {
            return (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-8 rounded-r-xl">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Clock className="text-yellow-600" size={24} />
                            <p className="font-bold text-2xl text-yellow-900">판매 시작까지</p>
                        </div>
                        <div className="flex justify-center gap-3 mb-2">
                            <div className="bg-white rounded-xl p-4 min-w-[80px]">
                                <div className="text-4xl font-bold text-gray-900">{timeLeft.days}</div>
                                <div className="text-sm text-gray-500 mt-1">일</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 min-w-[80px]">
                                <div className="text-4xl font-bold text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</div>
                                <div className="text-sm text-gray-500 mt-1">시간</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 min-w-[80px]">
                                <div className="text-4xl font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</div>
                                <div className="text-sm text-gray-500 mt-1">분</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 min-w-[80px]">
                                <div className="text-4xl font-bold text-gray-900">{String(timeLeft.seconds).padStart(2, '0')}</div>
                                <div className="text-sm text-gray-500 mt-1">초</div>
                            </div>
                        </div>
                        <p className="text-sm text-yellow-700 mt-4">2025년 10월 10일 오후 2시 판매 시작</p>
                    </div>
                </div>
            );
        } else if (saleStatus === 'during') {
            return (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-400 p-8 rounded-r-xl">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="font-bold text-3xl text-green-900">판매 진행중</p>
                        </div>
                        <p className="text-lg text-green-700 mt-2">선착순 500대 한정!</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-l-4 border-gray-400 p-8 rounded-r-xl">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Check className="text-gray-600" size={28} />
                            <p className="font-bold text-3xl text-gray-900">판매 종료</p>
                        </div>
                        <p className="text-lg text-gray-700 mt-2">모든 상품이 품절되었습니다</p>
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
                        {/* 로고 이미지 */}
                        <img
                            src="/KPMG_logo.png"
                            alt="KPMG Logo"
                            className="h-10 object-contain"
                        />
                        <span className="font-bold text-lg">임직원 복지몰</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{user?.name}님</span>
                        <button
                            onClick={() => {
                                setUser(null);
                                navigate('/login');
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 py-8">
                {/* 상태 배너 */}
                <div className="mb-6">
                    <Countdown/>
                </div>

                {/* 데모 버튼 */}
                <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-3">🎮 데모: 판매 상태 변경</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSaleStatus('before')}
                            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition"
                        >
                            판매 전
                        </button>
                        <button
                            onClick={() => setSaleStatus('during')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition"
                        >
                            판매 중
                        </button>
                        <button
                            onClick={() => setSaleStatus('after')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        >
                            판매 종료
                        </button>
                    </div>
                </div>

                {/* 상품 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <div key={product.id}
                             className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition">
                            <div
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-12 flex items-center justify-center">
                                <span className="text-6xl">{product.emoji}</span>
                            </div>

                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{product.spec}</p>

                                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-bold text-gray-900">
                        {product.price.toLocaleString()}원
                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mb-4">재고 {product.stock}대</p>

                                <div className="space-y-2">
                                    {/* 상세보기 버튼 */}
                                    <button
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="w-full py-3.5 rounded-xl font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        자세히 보기
                                    </button>

                                    {/* 구매하기 버튼 */}
                                    <button
                                        onClick={() => saleStatus === 'during' && navigate('/purchase')}
                                        disabled={saleStatus !== 'during'}
                                        className={`w-full py-3.5 rounded-xl font-semibold transition ${
                                            saleStatus === 'during'
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {saleStatus === 'before' && '판매 대기중'}
                                        {saleStatus === 'during' && '구매하기'}
                                        {saleStatus === 'after' && '품절'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default HomePage;