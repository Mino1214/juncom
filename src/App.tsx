import React, {useState, createContext, useContext, useEffect, type ReactNode} from 'react';
import Footer from "./components/footer.tsx";
import ProductDetailPage from "./components/product.tsx";
import PurchasePage from "./components/purchase.tsx";
import SignupPage from "./components/signup.tsx";
import LoginPage from "./components/login.tsx";
import HomePage from "./components/home.tsx";
import MyPage from "./components/mypage.tsx";
import AdminPage from "./components/admin.tsx";
import {jwtDecode} from "jwt-decode";
import PrivacyPolicyPage from "./components/privacypolicy.tsx";
import PaymentResultPage from "./components/payment.result.tsx";
import TermsOfServicePage from "./components/terms.of.use.tsx";

// JWT Payload 타입 정의
export interface JwtPayload {
    employeeId: string;
    role: string;
    name: string;
    exp: number;
}
// Types
interface User {
    name: string;
    email : string;
    employeeId: string;
}

type SaleStatus = 'before' | 'during' | 'after';

export interface Product {
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

interface AppContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    saleStatus: SaleStatus;
    setSaleStatus: (status: SaleStatus) => void;
}

export interface NavigateProps {
    navigate: (path: string) => void;
}

// Context for global state
const AppContext = createContext<AppContextType | null>(null);

const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [saleStatus, setSaleStatus] = useState<SaleStatus>('before');

    // user가 바뀔 때마다 localStorage에 저장
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

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

const Router = () => {
    const [currentPath, setCurrentPath] = useState<string>(window.location.hash || '#/login');
    const { user } = useApp();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash || '#/login';
            setCurrentPath(hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (path: string): void => {
        const finalPath = path.startsWith('#') ? path : `#${path}`;
        window.location.hash = finalPath;
    };

    // ✅ JWT 토큰에서 role 추출
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                setRole(decoded.role);
            } catch (err) {
                console.error("JWT decode 실패:", err);
                setRole(null);
            }
        } else {
            setRole(null);
        }
    }, [user]);

    // ✅ 로그인 상태 제어
    useEffect(() => {
        const cleanPath = (currentPath.split('?')[0]).toLowerCase();
        const isLoginPage = cleanPath === '#/login' || cleanPath === '#/signup';

        if (!user && !isLoginPage) {
            navigate('/login');
        } else if (user && isLoginPage) {
            navigate('/home');
        }
    }, [user, currentPath]);

    const cleanPath = currentPath.split('?')[0];
    const productMatch = cleanPath.match(/#\/product\/(\d+)/);

    if (productMatch) {
        const productId = parseInt(productMatch[1]);
        return (
            <ProductDetailPage
                navigate={navigate}
                user={user}
                // saleStatus={saleStatus}
                productId={productId}
            />
        );
    }

    // ✅ 관리자만 접근 가능한 경로
    if (cleanPath === '#/admin') {
        if (role === "admin") {
            return <AdminPage navigate={navigate} />;
        } else {
            return (
                <div className="p-6 text-center text-red-500">
                    ⚠ 접근 권한이 없습니다.
                </div>
            );
        }
    }

    const routes: Record<string, React.ComponentType<NavigateProps>> = {
        '#/login': LoginPage,
        '#/signup': SignupPage,
        '#/home': HomePage,
        '#/purchase': PurchasePage,
        '#/mypage': MyPage,
        '#/privacy': PrivacyPolicyPage,
        '#/terms' : TermsOfServicePage,
        '#/payment-result': PaymentResultPage, // ✅ 추가
    };

    const Component = routes[cleanPath] || LoginPage;

    return <Component navigate={navigate} />;
};
// App 컴포넌트
// App.tsx 맨 위에 추가
// App.tsx 맨 위에 추가
const App = () => {
    const [currentPath, setCurrentPath] = useState<string>(window.location.hash || '#/login');

    // ✅ fetch 래핑 - 타입 에러 수정
    useEffect(() => {
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            // 401 에러 감지 (토큰 만료)
            if (response.status === 401) {
                // URL 추출 (타입 안전하게)
                let url = '';
                if (typeof args[0] === 'string') {
                    url = args[0];
                } else if (args[0] instanceof URL) {
                    url = args[0].href;
                } else if (args[0] instanceof Request) {
                    url = args[0].url;
                }

                // 로그인/회원가입 API는 제외
                if (!url.includes('/login') && !url.includes('/signup')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');

                    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.hash = '#/login';
                    window.location.reload();
                }
            }

            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash || '#/login';
            setCurrentPath(hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const cleanPath = currentPath.split('?')[0];
    const hideFooterPaths = ['#/login', '#/signup'];
    const shouldShowFooter = !hideFooterPaths.includes(cleanPath);

    return (
        <AppProvider>
            <div className="flex flex-col min-h-screen">
                <div className="flex-grow">
                    <Router />
                </div>
                {shouldShowFooter && <Footer />}
            </div>
        </AppProvider>
    );
};

export default App;