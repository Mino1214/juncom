import { ChevronLeft, Package, Truck, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { type NavigateProps, useApp } from "../App.tsx";

interface OrderDetail {
    id: number;
    order_id: string;
    product_name: string;
    amount: number;
    status: string; // e.g., "결제완료", "배송중", "배송완료"
    created_at: string;
    delivery_address: string;
    delivery_detail: string;
    recipient_name: string;
    recipient_phone: string;
    tracking_number?: string;
    payment_method?: string;
    payment_time?: string;
}

const OrderDetailPage = ({ navigate }: NavigateProps) => {
    const { user } = useApp();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ 주문 ID 가져오기
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("orderId");

        if (!orderId) {
            alert("잘못된 접근입니다.");
            navigate("/home");
            return;
        }

        const fetchOrderDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`https://jimo.world/api/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setOrder(data);
            } catch (err) {
                console.error("Failed to fetch order:", err);
                alert("주문 정보를 불러올 수 없습니다.");
                navigate("/home");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [navigate, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-12 h-12 border-b-2 border-brand-600 rounded-full"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">주문 정보를 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ChevronLeft size={20} />
                        <span className="text-sm font-medium">뒤로가기</span>
                    </button>
                </div>
            </header>

            {/* 본문 */}
            <div className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">주문 상세</h1>

                {/* 주문 상태 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-900">주문번호: {order.order_id}</h2>
                        <span
                            className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                                order.status === "배송중"
                                    ? "bg-blue-100 text-blue-700"
                                    : order.status === "결제완료"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                            }`}
                        >
              {order.status}
            </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        주문일시:{" "}
                        {new Date(order.created_at).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>

                {/* 상품 정보 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={18} /> 상품 정보
                    </h2>
                    <div className="flex items-center gap-4">
                        <img
                            src={`https://jimo.world/api/uploads/product-${order.id}.png`}
                            alt={order.product_name}
                            className="w-20 h-20 object-cover rounded-xl border"
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{order.product_name}</p>
                            <p className="text-gray-500 text-sm mt-1">수량: 1개</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                                ₩{order.amount.toLocaleString("ko-KR")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 배송 정보 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck size={18} /> 배송 정보
                    </h2>
                    <div className="space-y-3 text-sm text-gray-700">
                        <p>
                            <span className="font-medium">수령자:</span> {order.recipient_name}
                        </p>
                        <p>
                            <span className="font-medium">연락처:</span> {order.recipient_phone}
                        </p>
                        <p>
                            <span className="font-medium">주소:</span> {order.delivery_address}{" "}
                            {order.delivery_detail && `, ${order.delivery_detail}`}
                        </p>
                        {order.tracking_number && (
                            <p>
                                <span className="font-medium">송장번호:</span>{" "}
                                <span className="text-blue-600">{order.tracking_number}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* 결제 정보 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard size={18} /> 결제 정보
                    </h2>
                    <div className="space-y-3 text-sm text-gray-700">
                        <p>
                            <span className="font-medium">결제수단:</span>{" "}
                            {order.payment_method || "신용/체크카드"}
                        </p>
                        <p>
                            <span className="font-medium">결제일시:</span>{" "}
                            {order.payment_time
                                ? new Date(order.payment_time).toLocaleString("ko-KR")
                                : "-"}
                        </p>
                        <p>
                            <span className="font-medium">결제금액:</span>{" "}
                            ₩{order.amount.toLocaleString("ko-KR")}
                        </p>
                    </div>
                </div>

                {/* 버튼 */}
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={() => navigate("/mypage")}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                        마이페이지로
                    </button>
                    <button
                        onClick={() => alert("배송조회 기능은 준비 중입니다.")}
                        className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition"
                    >
                        배송조회
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;