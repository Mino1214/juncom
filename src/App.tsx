import React, {useState, createContext, useContext, useEffect, type ReactNode} from 'react';
import { Check, Clock } from 'lucide-react';
import Footer from "./components/footer.tsx";
import Product from "./components/product.tsx";
import ProductDetailPage from "./components/product.tsx";
import PurchasePage from "./components/purchase.tsx";
// import type { JSX } from 'react';
// Types
interface User {
    name: string;
    employeeId: string;
}

type SaleStatus = 'before' | 'during' | 'after';

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

interface AppContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    saleStatus: SaleStatus;
    setSaleStatus: (status: SaleStatus) => void;
}

export interface NavigateProps {
    navigate: (path: string) => void;
}

interface FormData {
    name: string;
    employeeId: string;
    email: string;
    password: string;
}

// Context for global state
const AppContext = createContext<AppContextType | null>(null);

const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [saleStatus, setSaleStatus] = useState<SaleStatus>('before');

    return (
        <AppContext.Provider value={{ user, setUser, saleStatus, setSaleStatus }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

// Router simulation
// Router 컴포넌트 수정
const Router = () => {
    const [currentPath, setCurrentPath] = useState<string>(window.location.hash || '#/login');
    const { user, saleStatus } = useApp(); // Context에서 가져오기

    useEffect(() => {
        const handleHashChange = () => setCurrentPath(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (path: string): void => {
        window.location.hash = path;
    };

    // 상품 상세 페이지인지 확인
    const productMatch = currentPath.match(/#\/product\/(\d+)/);

    if (productMatch) {
        const productId = parseInt(productMatch[1]);
        return <ProductDetailPage navigate={navigate} user={user} saleStatus={saleStatus} productId={productId} />;
    }

    const routes: Record<string, React.ComponentType<NavigateProps>> = {
        '#/login': LoginPage,
        '#/signup': SignupPage,
        '#/home': HomePage,
        '#/purchase': PurchasePage,
    };

    const Component = routes[currentPath] || LoginPage;

    return <Component navigate={navigate} />;
};

// 로그인 페이지
const LoginPage = ({ navigate }: NavigateProps) => {
    const { setUser } = useApp();
    const [employeeId, setEmployeeId] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = async (): Promise<void> => {
        // TODO: API 연동
        setUser({ name: '홍길동', employeeId });
        navigate('#/home');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img
                        src="/KPMG_logo.png"
                        alt="KPMG Logo"
                        className="w-32 mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">임직원 복지몰</h1>
                    <p className="text-gray-600">사번으로 로그인해주세요</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="사번"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                className="w-full px-4 py-4 bg-gray-50 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                className="w-full px-4 py-4 bg-gray-50 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            disabled={!employeeId || !password}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-base disabled:bg-gray-200 disabled:text-gray-400 transition hover:bg-blue-700"
                        >
                            로그인
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('#/signup')}
                            className="text-gray-600 text-sm hover:text-gray-900"
                        >
                            처음이신가요? <span className="font-semibold text-blue-600">회원가입</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 회원가입 페이지
const SignupPage = ({ navigate }: NavigateProps) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        employeeId: '',
        email: '',
        password: ''
    });

    const handleSignup = async (): Promise<void> => {
        // TODO: API 연동
        alert('회원가입이 완료되었습니다!');
        navigate('#/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto p-4">
                <button
                    onClick={() => navigate('#/login')}
                    className="mb-6 text-gray-600 flex items-center gap-1 hover:text-gray-900"
                >
                    ← 뒤로
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
                <p className="text-gray-600 mb-8">임직원 정보를 입력해주세요</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">이름</label>
                        <input
                            type="text"
                            placeholder="홍길동"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">사번</label>
                        <input
                            type="text"
                            placeholder="EMP2024001"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
                        <input
                            type="email"
                            placeholder="hong@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
                        <input
                            type="password"
                            placeholder="8자 이상"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <button
                        onClick={handleSignup}
                        disabled={!formData.name || !formData.employeeId || !formData.email || !formData.password}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition disabled:bg-gray-200 disabled:text-gray-400"
                    >
                        가입하기
                    </button>
                </div>
            </div>
        </div>
    );
};

// 홈 페이지
const HomePage = ({ navigate }: NavigateProps) => {
    const { user, setUser, saleStatus, setSaleStatus } = useApp();

    useEffect(() => {
        if (!user) navigate('#/login');
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
                                navigate('#/login');
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
                                        onClick={() => navigate(`#/product/${product.id}`)}
                                        className="w-full py-3.5 rounded-xl font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        자세히 보기
                                    </button>

                                    {/* 구매하기 버튼 */}
                                    <button
                                        onClick={() => saleStatus === 'during' && navigate('#/purchase')}
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

// 구매 페이지
// const PurchasePage = ({navigate}: NavigateProps) => {
//     const {user} = useApp();
//     const [agreed, setAgreed] = useState<boolean>(false);
//     const [purchasing, setPurchasing] = useState<boolean>(false);
//     const [success, setSuccess] = useState<boolean>(false);
//
//     useEffect(() => {
//         if (!user) navigate('#/login');
//     }, [user, navigate]);
//
//     const handlePurchase = async (): Promise<void> => {
//         setPurchasing(true);
//         // TODO: API 연동
//
//         setTimeout(() => {
//             setPurchasing(false);
//             setSuccess(true);
//         }, 1500);
//     };
//
//     if (success) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//                 <div className="max-w-md w-full">
//                     <div className="bg-white rounded-3xl p-8 text-center">
//                         <div
//                             className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                             <Check className="text-green-600" size={40}/>
//                         </div>
//                         <h2 className="text-2xl font-bold text-gray-900 mb-3">구매 완료</h2>
//                         <p className="text-gray-600 mb-8">
//                             주문이 성공적으로 완료되었습니다<br/>
//                             수령 안내는 이메일로 발송됩니다
//                         </p>
//                         <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
//                             <div className="space-y-2">
//                                 <div className="flex justify-between text-sm">
//                                     <span className="text-gray-600">주문번호</span>
//                                     <span className="font-semibold">#2024100301</span>
//                                 </div>
//                                 <div className="flex justify-between text-sm">
//                                     <span className="text-gray-600">구매자</span>
//                                     <span className="font-semibold">{user?.name} ({user?.employeeId})</span>
//                                 </div>
//                             </div>
//                         </div>
//                         <button
//                             onClick={() => navigate('#/home')}
//                             className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
//                         >
//                             확인
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
//
//     return (
//         <div className="min-h-screen bg-gray-50">
//             <div className="max-w-2xl mx-auto p-4 py-8">
//                 <button
//                     onClick={() => navigate('#/home')}
//                     className="mb-6 text-gray-600 flex items-center gap-1 hover:text-gray-900"
//                 >
//                     ← 뒤로
//                 </button>
//
//                 <h1 className="text-3xl font-bold text-gray-900 mb-8">구매하기</h1>
//
//                 {/* 선택 상품 */}
//                 <div className="bg-white rounded-2xl p-6 mb-4">
//                     <h2 className="font-semibold text-gray-900 mb-4">선택 상품</h2>
//                     <div className="flex items-center gap-4">
//                         <div className="text-5xl">💻</div>
//                         <div className="flex-1">
//                             <h3 className="font-bold text-gray-900">MacBook Pro 14" M3</h3>
//                             <p className="text-sm text-gray-500 mt-1">M3 칩 • 16GB • 512GB</p>
//                         </div>
//                         <div className="text-xl font-bold text-gray-900">1,200,000원</div>
//                     </div>
//                 </div>
//
//                 {/* 구매자 정보 */}
//                 <div className="bg-white rounded-2xl p-6 mb-4">
//                     <h2 className="font-semibold text-gray-900 mb-4">구매자 정보</h2>
//                     <div className="space-y-3">
//                         <div className="flex justify-between py-3 border-b border-gray-100">
//                             <span className="text-gray-600">이름</span>
//                             <span className="font-semibold">{user?.name}</span>
//                         </div>
//                         <div className="flex justify-between py-3">
//                             <span className="text-gray-600">사번</span>
//                             <span className="font-semibold">{user?.employeeId}</span>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* 주의사항 */}
//                 <div className="bg-yellow-50 rounded-2xl p-5 mb-6 border border-yellow-100">
//                     <div className="flex gap-3">
//                         <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
//                         <div>
//                             <h3 className="font-semibold text-yellow-900 mb-2">구매 전 확인사항</h3>
//                             <ul className="text-sm text-yellow-800 space-y-1">
//                                 <li>• 1인 1대 한정 구매 가능합니다</li>
//                                 <li>• 구매 후 취소/환불이 불가능합니다</li>
//                                 <li>• 수령은 구매일로부터 7일 이내 가능합니다</li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* 동의 */}
//                 <label className="flex items-start gap-3 mb-6 cursor-pointer">
//                     <input
//                         type="checkbox"
//                         checked={agreed}
//                         onChange={(e) => setAgreed(e.target.checked)}
//                         className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                     />
//                     <span className="text-gray-700">위 내용을 확인했으며, 구매에 동의합니다</span>
//                 </label>
//
//                 {/* 구매 버튼 */}
//                 <button
//                     onClick={handlePurchase}
//                     disabled={!agreed || purchasing}
//                     className={`w-full py-4 rounded-xl font-bold text-lg transition ${
//                         agreed && !purchasing
//                             ? 'bg-blue-600 text-white hover:bg-blue-700'
//                             : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                     }`}
//                 >
//                     {purchasing ? '처리중...' : '구매 확정하기'}
//                 </button>
//             </div>
//         </div>
//     );
// };


const App = () => {
    return (
        <AppProvider>
            <div className="flex flex-col min-h-screen">
                <div className="flex-grow">
                    <Router />
                </div>
                <Footer />
            </div>
        </AppProvider>
    );
};

export default App;