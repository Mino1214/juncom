import React, {useState, createContext, useContext, useEffect, type ReactNode} from 'react';
import Footer from "./components/footer.tsx";
import ProductDetailPage from "./components/product.tsx";
import PurchasePage from "./components/purchase.tsx";
import SignupPage from "./components/signup.tsx";
import LoginPage from "./components/login.tsx";
import HomePage from "./components/home.tsx";
import MyPage from "./components/mypage.tsx";

// Types
interface User {
    name: string;
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
    const { user, saleStatus } = useApp();

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

    // 로그인 상태 제어
    useEffect(() => {
        const cleanPath = (currentPath.split('?')[0]).toLowerCase();
        const isLoginPage = cleanPath === '#/login' || cleanPath === '#/signup';

        if (!user && !isLoginPage) {
            // ✅ 로그인 안된 상태에서 접근 시 로그인 페이지로 이동
            navigate('/login');
        } else if (user && isLoginPage) {
            // ✅ 로그인된 상태에서 로그인/회원가입 페이지 접근 시 홈으로 이동
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
                saleStatus={saleStatus}
                productId={productId}
            />
        );
    }

    const routes: Record<string, React.ComponentType<NavigateProps>> = {
        '#/login': LoginPage,
        '#/signup': SignupPage,
        '#/home': HomePage,
        '#/purchase': PurchasePage,
        '#/mypage': MyPage,
    };

    const Component = routes[cleanPath] || LoginPage;

    return <Component navigate={navigate} />;
};

// App 컴포넌트
const App = () => {
    const [currentPath, setCurrentPath] = useState<string>(window.location.hash || '#/login');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash || '#/login';
            setCurrentPath(hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Footer를 숨길 페이지 목록 (쿼리 파라미터 제거)
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