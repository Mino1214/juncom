import React, {useEffect, useState} from "react";
import type {NavigateProps} from "../App.tsx";
import {Package, Eye, EyeOff, AlertCircle} from "lucide-react";

export interface AdminProduct {
    id: number;
    name: string;
    price: number;
    stock: number;
    emoji?: string;
    description?: string;
    image_url?: string;
    is_visible?: boolean;
}

export interface AdminOrder {
    no: number;
    결제수단: string;
    거래상태: string;
    승인일자: string;
    취소일자?: string;
    거래금액: number;
    구매자: string;
    상품명: string;
    주문번호: string;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

const AdminPage: React.FC<NavigateProps> = ({navigate}) => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const token = localStorage.getItem("token");
    const [orderStats, setOrderStats] = useState({
        total: 0,
        pending: 0,
        paid: 0,
        cancelled: 0
    });
    const fetchOrderStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://cleanupsystems.shop/api/orders/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            setOrderStats(data);
        } catch (err) {
            console.error("order stats load error:", err);
        }
    };
    // 상단에 추가 (컴포넌트 밖, import 아래)
    function maskName(name?: string) {
        if (!name) return "-";
        if (name.length <= 1) return name;
        if (name.length === 2) return name[0] + "*";
        // 이름이 3글자 이상이면 가운데만 *
        return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
    }

    const fetchUsers = async () => {
        try {
            const res = await fetch(`https://cleanupsystems.shop/api/users?page=${page}&limit=50`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
                setHasMore(data.hasMore);
                setTotalCount(data.totalCount); // ✅ 총 회원 수 상태 추가
            }
        } catch (err) {
            console.error("회원 목록 불러오기 실패:", err);
        }
    };
    const fetchProducts = async () => {
        try {
            const response = await fetch("https://cleanupsystems.shop/api/admin/products", {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!response.ok) throw new Error(`서버 오류: ${response.status}`);
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
            setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch("https://cleanupsystems.shop/api/all/orders", {
                headers: {Authorization: `Bearer ${token}`},
            });
            const data = await res.json();
            if (data.success) setOrders(data.orders);
        } catch (err) {
            console.error("주문 내역 불러오기 실패:", err);
        }
    };


    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchOrderStats();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [page]);
    if (loading) return <div className="p-6 text-gray-600 text-center">로딩 중...</div>;
    if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

    const totalProducts = products.length;
    const visibleProducts = products.filter((p) => p.is_visible).length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 5).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10 space-y-12">
            {/* ======================= 상품 현황 ======================= */}
            <section>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-8 text-gray-900">
                    관리자 페이지
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <SummaryCard title="총 상품 수" value={totalProducts} color="text-brand-600"/>
                    <SummaryCard title="노출 중" value={visibleProducts} color="text-green-600"/>
                    <SummaryCard title="총 재고" value={totalStock.toLocaleString()} color="text-blue-600"/>
                    <SummaryCard title="재고 부족" value={lowStock} color="text-red-500"/>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p}/>
                    ))}
                </div>
            </section>

            {/* ======================= 회원 가입 내역 ======================= */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        회원 가입 내역
                    </h2>
                    <span className="text-gray-600 text-sm">
  총 회원 수: {totalCount.toLocaleString()}명
</span>
                </div>

                <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                    <table className="min-w-full text-sm text-center">
                        <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-2">이름</th>
                            <th className="p-2">이메일</th>
                            <th className="p-2">가입일</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-4 text-gray-400">
                                    가입된 회원이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="border-t hover:bg-gray-50">
                                    <td className="p-2">{maskName(u.name)}</td>
                                    <td className="p-2">{u.email}</td>
                                    <td className="p-2">
                                        {new Date(u.created_at).toLocaleString("ko-KR")}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* ✅ 페이지네이션 버튼 */}
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-lg border ${
                            page === 1
                                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                : "text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                        ◀ 이전
                    </button>

                    <span className="text-gray-600 text-sm">페이지 {page}</span>

                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={!hasMore}
                        className={`px-4 py-2 rounded-lg border ${
                            !hasMore
                                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                : "text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                        다음 ▶
                    </button>
                </div>
            </section>
            {/* ======================= 주문 내역 ======================= */}
            <section>
                {/* 주문 통계 박스 */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-gray-500 text-sm">총 주문</div>
                        <div className="text-xl font-bold">{orderStats.total}</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-gray-500 text-sm">결제 대기</div>
                        <div className="text-xl font-bold text-yellow-600">{orderStats.pending}</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-gray-500 text-sm">결제 완료</div>
                        <div className="text-xl font-bold text-green-600">{orderStats.paid}</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-gray-500 text-sm">취소됨</div>
                        <div className="text-xl font-bold text-red-600">{orderStats.cancelled}</div>
                    </div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">
                    결제 / 주문 내역
                </h2>

                <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                    <table className="min-w-full text-sm text-center">
                        <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-2">No</th>
                            <th className="p-2">결제수단</th>
                            <th className="p-2">거래상태</th>
                            <th className="p-2">승인일자</th>
                            <th className="p-2">취소일자</th>
                            <th className="p-2">거래금액</th>
                            <th className="p-2">구매자</th>
                            <th className="p-2">상품명</th>
                            <th className="p-2">주문번호</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="p-4 text-gray-400">
                                    주문 내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            orders.map((o) => (
                                <tr key={o.주문번호} className="border-t hover:bg-gray-50">
                                    <td className="p-2">{o.no}</td>
                                    <td className="p-2">{o.결제수단}</td>
                                    <td
                                        className={`p-2 font-semibold ${
                                            o.거래상태.includes("취소")
                                                ? "text-red-600"
                                                : o.거래상태 === "대기중"
                                                    ? "text-gray-500"
                                                    : "text-green-600"
                                        }`}
                                    >
                                        {o.거래상태}
                                    </td>
                                    <td className="p-2">
                                        {new Date(o.승인일자).toLocaleString("ko-KR")}
                                    </td>
                                    <td className="p-2">
                                        {o.취소일자
                                            ? new Date(o.취소일자).toLocaleString("ko-KR")
                                            : "-"}
                                    </td>
                                    <td className="p-2 font-semibold text-gray-800">
                                        {o.거래금액.toLocaleString("ko-KR")}원
                                    </td>
                                    <td className="p-2">{"***"}</td>
                                    <td className="p-2">{o.상품명}</td>
                                    <td className="p-2 font-mono text-xs">{o.주문번호}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </section>


            <div className="text-center mt-10">
                <button
                    onClick={() => navigate("/home")}
                    className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition"
                >
                    ← 홈으로
                </button>
            </div>
        </div>
    );
};

/* 🔹 요약 카드 */
const SummaryCard = ({title, value, color}: { title: string; value: string | number; color: string }) => (
    <div className="backdrop-blur-md bg-white/70 border border-gray-200 p-4 rounded-2xl shadow-sm text-center">
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

/* 🔹 상품 카드 */
const ProductCard = ({product}: { product: AdminProduct }) => (
    <div
        className="backdrop-blur-md bg-white/80 border border-gray-200 shadow-md rounded-2xl p-5 hover:shadow-lg transition">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="object-cover w-full h-full"/>
                ) : (
                    <Package className="w-8 h-8 text-gray-400"/>
                )}
            </div>
            <div>
                <h2 className="font-semibold text-gray-900 text-lg">{product.name}</h2>
                <p className="text-gray-500 text-sm">{product.description || "설명 없음"}</p>
            </div>
        </div>

        <div className="flex justify-between items-center text-sm border-t pt-3">
            <div className="flex flex-col">
                <span className="text-gray-400">가격</span>
                <span className="font-medium text-gray-800">{product.price.toLocaleString()}원</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-gray-400">재고</span>
                <span className={`font-semibold ${product.stock <= 5 ? "text-red-500" : "text-gray-800"}`}>
                    {product.stock}개
                </span>
            </div>
        </div>

        <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center gap-1 text-sm text-gray-500">
                {product.is_visible ? (
                    <>
                        <Eye className="w-4 h-4 text-green-600"/> <span>노출 중</span>
                    </>
                ) : (
                    <>
                        <EyeOff className="w-4 h-4 text-gray-400"/> <span>비노출</span>
                    </>
                )}
            </div>

            {product.stock <= 5 && (
                <div className="flex items-center text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3 mr-1"/> 재고 부족
                </div>
            )}
        </div>
    </div>
);

export default AdminPage;