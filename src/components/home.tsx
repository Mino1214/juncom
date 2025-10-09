// 홈 페이지
import {type NavigateProps, type Product, useApp} from "../App.tsx";
import {Check, Clock} from "lucide-react";
import {useEffect, useState} from "react";

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

const HomePage = ({ navigate }: NavigateProps) => {
    const { user, setUser } = useApp();
    const [saleInfo, setSaleInfo] = useState<SaleInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // 판매 정보 가져오기
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchSaleInfo = async () => {
            try {
                const response = await fetch('https://jimo.world/api/sale/current');
                const data = await response.json();
                setSaleInfo(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch sale info:', error);
                setLoading(false);
            }
        };

        fetchSaleInfo();

        // 10초마다 업데이트
        const interval = setInterval(fetchSaleInfo, 10000);
        return () => clearInterval(interval);
    }, [user, navigate]);

    // 카운트다운 타이머
    useEffect(() => {
        if (!saleInfo || saleInfo.sale.status !== 'before') return;

        const calculateTimeLeft = () => {
            const seconds = Math.max(0, saleInfo.sale.secondsUntilStart);

            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            return { days, hours, minutes, seconds: secs };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            // 시간이 0이 되면 페이지 새로고침
            if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 &&
                newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
                window.location.reload();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [saleInfo]);

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
                    <p className="text-gray-600">판매 정보가 없습니다.</p>
                </div>
            </div>
        );
    }

    const { product, sale } = saleInfo;
    const saleStatus = sale.status;

    const Countdown = () => {
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
                        <p className="text-sm text-yellow-700 mt-4">
                            {new Date(sale.saleStart).toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })} 판매 시작
                        </p>
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
                        <p className="text-lg text-green-700 mt-2">
                            선착순 {sale.totalStock}대 한정! (남은 재고: {sale.remainingStock}대)
                        </p>
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

                {/* 상품 카드 */}
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-12 flex items-center justify-center">
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
                            <p className="text-xs text-gray-400 mb-4">
                                재고 {sale.remainingStock}/{sale.totalStock}대
                            </p>

                            {product.description && (
                                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                            )}

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
                </div>
            </div>
        </div>
    );
};

export default HomePage;