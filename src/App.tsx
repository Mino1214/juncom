import React, {useState, createContext, useContext, useEffect, type ReactNode} from 'react';
import Footer from "./components/footer.tsx";
import ProductDetailPage from "./components/product.tsx";
import PurchasePage from "./components/purchase.tsx";
import SignupPage from "./components/signup.tsx";
import LoginPage from "./components/login.tsx";
import HomePage from "./components/home.tsx";

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

const Router = () => {
    const [currentPath, setCurrentPath] = useState<string>(window.location.hash || '#/login');
    const { user, saleStatus } = useApp();

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash || '#/login';
            console.log('Hash changed to:', hash);
            setCurrentPath(hash);
        };

        window.addEventListener('hashchange', handleHashChange);

        // 초기 로드시 실행
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (path: string): void => {
        // #이 있으면 그대로, 없으면 추가
        const finalPath = path.startsWith('#') ? path : `#${path}`;
        console.log('Navigating to:', finalPath);
        window.location.hash = finalPath;
    };

    // 쿼리 파라미터를 제거한 순수 경로 추출
    const cleanPath = currentPath.split('?')[0]; // #/signup?kakaoId=xxx -> #/signup
    console.log('Current path:', currentPath, '| Clean path:', cleanPath);

    // 상품 상세 페이지 매칭
    const productMatch = cleanPath.match(/#\/product\/(\d+)/);

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

    // cleanPath로 매칭 (쿼리 파라미터 제거된 상태)
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