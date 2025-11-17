import { ChevronLeft, User, Mail, Phone, MapPin, Calendar, Package } from 'lucide-react';
import { useEffect, useState } from "react";
import { type NavigateProps, useApp } from "../App.tsx";

interface UserDetail {
    id: number;
    employee_id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    address_detail?: string;
    kakao_id?: string;
    marketing_agreed: boolean;
    created_at: string;
}
// ✅ 주문 데이터 타입 정의
interface Order {
    order_id: string;
    product_name: string;
    amount: number;
    status: string;
    created_at: string;

    // ✅ 새로 추가된 배송 관련 필드
    recipient_name?: string;
    delivery_phone?: string;
    delivery_address?: string;
    delivery_detail_address?: string;
    delivery_request?: string;
    delivery_status?: string;
    tracking_number?: string;
}
// Daum 주소 검색 타입 정의
declare global {
    interface Window {
        daum: any;
    }
}

const MyPage = ({ navigate }: NavigateProps) => {
    const { user, setUser } = useApp();
    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        address_detail: '',
        // recipient_name: '',
        // delivery_phone: '',
        // delivery_request: ''
    });

    // ✅ 구매 내역 관련 상태
    const [orders, setOrders] = useState<Order[]>([]); // ✅ 배열 타입 지정
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // ✅ 단일 주문 타입
    // 추가: 어느 폼에서 주소검색을 호출했는지 구분
    const [activeAddressTarget, setActiveAddressTarget] = useState<"user" | "delivery" | null>(null);
    const [showModal, setShowModal] = useState(false);
    const handleOrderClick = (order: Order) => {
        // console.log("🧾 주문 상세 데이터:", order); // ✅ 콘솔에 전체 데이터 출력
        setSelectedOrder(order);
        setShowModal(true);
    };

    const [isEditingDelivery, setIsEditingDelivery] = useState(false);
    const [editDelivery, setEditDelivery] = useState({
        recipient_name: selectedOrder?.recipient_name || "",
        delivery_phone: selectedOrder?.delivery_phone || "",
        delivery_address: selectedOrder?.delivery_address || "",
        delivery_detail_address: selectedOrder?.delivery_detail_address || "",
        delivery_request: selectedOrder?.delivery_request || "",
    });
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://jimo.world/api/myorder?email=${user?.email}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();

            setOrders(data.orders || []);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        }
    };
    // ✅ 구매 내역 불러오기
    useEffect(() => {
        if (!user) return;



        fetchOrders();
    }, [user]);
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchUserDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`https://jimo.world/api/user/${user.email}`,{
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                setUserDetail(data);
                setEditForm({
                    name: data.name,
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    address_detail: data.address_detail || '',

                });
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch user detail:', error);
                setLoading(false);
            }
        };
        fetchUserDetail();
    }, [user, navigate]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressResults, setAddressResults] = useState<any[]>([]);
    const [addressKeyword, setAddressKeyword] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    // 카카오 주소 검색
    // PurchasePage와 동일한 주소 검색 함수
    const handleAddressSearch = async () => {
        if (!addressKeyword.trim()) {
            alert('검색어를 입력하세요');
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://jimo.world/api/address/search?keyword=${encodeURIComponent(addressKeyword)}`
            );
            const data = await response.json();

            if (data.documents && data.documents.length > 0) {
                setAddressResults(data.documents);
            } else {
                alert('검색 결과가 없습니다.');
                setAddressResults([]);
            }
        } catch (error) {
            console.error('Address search error:', error);
            alert('주소 검색 중 오류가 발생했습니다.');
        } finally {
            setIsSearching(false);
        }
    };


    const selectAddress = (addr: any) => {
        let fullAddress = '';

        if (addr.road_address?.address_name) {
            fullAddress = addr.road_address.address_name;
            if (addr.road_address.building_name) {
                fullAddress += ` (${addr.road_address.building_name})`;
            }
        } else if (addr.address_name) {
            fullAddress = addr.address_name;
        } else if (addr.address?.address_name) {
            fullAddress = addr.address.address_name;
        }

        if (!fullAddress) {
            alert('주소 정보를 가져올 수 없습니다.');
            return;
        }

        // ✅ 수정된 부분: 어느 폼이 활성인지에 따라 다른 상태 업데이트
        if (activeAddressTarget === "user") {
            setEditForm(prev => ({ ...prev, address: fullAddress }));
        } else if (activeAddressTarget === "delivery") {
            setEditDelivery(prev => ({ ...prev, delivery_address: fullAddress }));
        }

        setShowAddressModal(false);
        setAddressKeyword('');
        setAddressResults([]);
        setActiveAddressTarget(null); // 초기화
    };
    const handleSave = async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://jimo.world/api/user/${user.email}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`, // ✅ 토큰 첨부
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const data = await response.json();
                setUserDetail(data.user);
                setUser({ ...user, name: editForm.name });
                setIsEditing(false);
                alert('정보가 수정되었습니다.');
            } else {
                alert('정보 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('정보 수정 중 오류가 발생했습니다.');
        }
    };


    const handleDelete = async () => {
    if (!user) return;

    const confirmed = confirm('정말로 탈퇴하시겠습니까?\n탈퇴 후 모든 정보가 삭제되며 복구할 수 없습니다.');

    if (!confirmed) return;

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`https://jimo.world/api/user/${user.email}`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            alert('회원 탈퇴가 완료되었습니다.');

            // 🔥 로컬 상태 / 로컬 저장소 초기화
            setUser(null);
            localStorage.removeItem("token");

            // 🔥 해시 기반 라우팅으로 로그인 페이지 이동
            navigate('#/login');

        } else {
            const data = await response.json();
            alert(data.message || '회원 탈퇴에 실패했습니다.');
        }
    } catch (error) {
        console.error('Failed to delete user:', error);
        alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
};


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!userDetail) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">사용자 정보를 찾을 수 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
           <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div className="max-w-5xl mx-auto px-6 py-4">
        <button
            onClick={() => navigate('#/home')} // ✅ 이전 페이지로 이동
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
            <ChevronLeft size={20} />
            <span className="font-medium text-sm">홈으로</span>
        </button>
    </div>
</header>

            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* 프로필 헤더 */}
                <div className="bg-white rounded-2xl p-8 mb-6 border border-gray-100">
                    <div className="flex items-center gap-6">
                        <div
                            className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={36} className="text-white"/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{userDetail.name}</h1>
                            {/*<p className="text-sm text-gray-500">사번: {userDetail.employee_id}</p>*/}
                        </div>
                    </div>
                </div>

                {/* 개인 정보 */}
                <div className="bg-white rounded-2xl p-8 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-900">개인 정보</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium"
                            >
                                수정하기
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditForm({
                                            name: userDetail.name,
                                            email: userDetail.email || '',
                                            phone: userDetail.phone || '',
                                            address: userDetail.address || '',
                                            address_detail: userDetail.address_detail || ''
                                        });
                                    }}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium"
                                >
                                    저장
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* 이름 */}
                        <div className="flex items-start gap-4">
                            <User size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">이름</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium text-sm">{userDetail.name}</p>
                                )}
                            </div>
                        </div>

                        {/* 이메일 */}
                        <div className="flex items-start gap-4">
                            <Mail size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">이메일</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium text-sm break-all">{userDetail.email || '미입력'}</p>
                                )}
                            </div>
                        </div>

                        {/* 연락처 */}
                        <div className="flex items-start gap-4">
                            <Phone size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">연락처</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                        placeholder="010-1234-5678"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium text-sm">{userDetail.phone || '미입력'}</p>
                                )}
                            </div>
                        </div>

                        {/* 주소 */}
                        <div className="flex items-start gap-4">
                            <MapPin size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">배송지 주소</p>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editForm.address}
                                                placeholder="주소 검색 버튼을 클릭하세요"
                                                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50"
                                                readOnly
                                            />
                                            <button
                                                onClick={() => {
                                                    setActiveAddressTarget("user");
                                                    setShowAddressModal(true);
                                                }}
                                                className="px-4 py-2.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium whitespace-nowrap"
                                            >
                                                주소 검색
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={editForm.address_detail}
                                            onChange={(e) => setEditForm({...editForm, address_detail: e.target.value})}
                                            placeholder="상세주소 입력"
                                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-900 font-medium text-sm">{userDetail.address || '미입력'}</p>
                                        {userDetail.address_detail && (
                                            <p className="text-gray-600 text-sm mt-1">{userDetail.address_detail}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 가입일 */}
                        <div className="flex items-start gap-4">
                            <Calendar size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">가입일</p>
                                <p className="text-gray-900 font-medium text-sm">
                                    {new Date(userDetail.created_at).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 주소 검색 모달 */}
                {showAddressModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-bold mb-4 text-gray-900">주소 검색</h2>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="도로명 또는 지번 주소 입력"
                                        value={addressKeyword}
                                        onChange={(e) => setAddressKeyword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                                        className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleAddressSearch}
                                        disabled={isSearching}
                                        className="px-6 py-3 bg-brand-600 text-white text-sm rounded-xl hover:bg-brand-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isSearching ? '검색중...' : '검색'}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {addressResults.length === 0 ? (
                                    <p className="text-gray-500 text-center py-12 text-sm">
                                        주소를 검색해주세요
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {addressResults.map((addr, index) => {
                                            const isPlace = addr.address_type === 'PLACE';
                                            const mainAddress = addr.road_address?.address_name || addr.address_name || '';
                                            const subAddress = addr.address?.address_name;
                                            const buildingName = addr.road_address?.building_name || '';
                                            const placeName = addr.place_name || '';
                                            const category = addr.category_name || '';

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => selectAddress(addr)}
                                                    className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-colors"
                                                >
                                                    {isPlace && placeName && (
                                                        <div className="font-semibold text-brand-600 text-sm mb-1">
                                                            📍 {placeName}
                                                        </div>
                                                    )}
                                                    <div className="font-medium text-gray-900 text-sm">
                                                        {mainAddress}
                                                        {buildingName && ` (${buildingName})`}
                                                    </div>
                                                    {subAddress && mainAddress !== subAddress && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            지번: {subAddress}
                                                        </div>
                                                    )}
                                                    {isPlace && category && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {category}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowAddressModal(false);
                                        setAddressKeyword('');
                                        setAddressResults([]);
                                    }}
                                    className="w-full py-3 bg-gray-600 text-white text-sm rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 구매 내역 */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">구매 내역</h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div
                                className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto mb-4"></div>
                            <p className="text-gray-500 text-sm">구매 내역을 불러오는 중입니다...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package size={48} className="text-gray-300 mx-auto mb-4"/>
                            <p className="text-gray-500 text-sm">아직 구매 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.order_id}
                                    onClick={() => handleOrderClick(order)}
                                    className="p-5 border border-gray-200 rounded-xl hover:border-brand-400 hover:bg-brand-50 cursor-pointer transition"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold text-gray-900">{order.product_name}</h3>
                                        <span
                                            className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                                order.status === "paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : order.status === "cancelled"
                                                        ? "bg-red-100 text-red-700"
                                                        : order.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
  {order.status === "paid"
      ? "결제완료"
      : order.status === "cancelled"
          ? "결제취소"
          : order.status === "pending"
              ? "결제대기"
              : order.status}
</span>
                                    </div>

                                    <div className="flex justify-between items-end text-sm text-gray-600">
                                        <div>
                                            <p>주문번호: {order.order_id}</p>
                                            <p className="text-xs mt-1">
                                                {new Date(order.created_at).toLocaleString("ko-KR", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-lg">
                                            ₩{order.amount?.toLocaleString("ko-KR")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ✅ 상세내역 모달 */}
                    {showModal && selectedOrder && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
                                >
                                    ✕
                                </button>

                                <h2 className="text-xl font-bold text-gray-900 mb-6">주문 상세정보</h2>

                                {/* 상품 이미지 + 이름 */}
                                <div className="flex items-center gap-4 mb-6">
                                    <img
                                        src={`https://roomfiles.s3.ap-northeast-2.amazonaws.com/uploads/%E1%84%8F%E1%85%A1%E1%84%87%E1%85%A9%E1%86%ABX1%E1%84%8A%E1%85%A5%E1%86%B7%E1%84%82%E1%85%A6%E1%84%8B%E1%85%B5%E1%86%AF+(1).png`}
                                        alt={selectedOrder.product_name}
                                        className="w-20 h-20 object-cover rounded-xl border"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{selectedOrder.product_name}</p>
                                        <p className="text-gray-500 text-sm mt-1">
                                            ₩{selectedOrder.amount?.toLocaleString("ko-KR")} / 수량: 1
                                        </p>
                                    </div>
                                </div>

                                {/* 상세 내용 */}
                                <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4 shadow-sm">
                                    {/* 주문 기본 정보 */}
                                    <div className="space-y-2">
                                        <p>
                                            <span className="text-gray-500">주문번호:</span>{" "}
                                            <span className="font-medium text-gray-900">{selectedOrder.order_id}</span>
                                        </p>
                                        <p>
                                            <span className="text-gray-500">상태:</span>{" "}
                                            <span
                                                className={`font-semibold px-2 py-0.5 rounded-md ${
                                                    selectedOrder.status === "paid"
                                                        ? "bg-green-100 text-green-700"
                                                        : selectedOrder.status === "cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : selectedOrder.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-gray-100 text-gray-600"
                                                }`}

                                            >
  {selectedOrder.status === "paid"
      ? "결제완료"
      : selectedOrder.status === "cancelled"
          ? "결제취소"
          : selectedOrder.status === "pending"
              ? "결제대기"
              : selectedOrder   .status}
                                        </span>
                                        </p>
                                        <p>
                                            <span className="text-gray-500">결제금액:</span>{" "}
                                            <span className="font-bold text-gray-900">
              ₩{selectedOrder.amount?.toLocaleString("ko-KR")}
            </span>
                                        </p>
                                        <p>
                                            <span className="text-gray-500">주문일:</span>{" "}
                                            <span className="font-medium text-gray-900">
              {new Date(selectedOrder.created_at).toLocaleString("ko-KR")}
            </span>
                                        </p>
                                    </div>

                                    {/* 수령자 정보 */}
                                    {/* 배송정보 섹션 */}
                                    <div className="pt-4 border-t border-gray-100 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-800 text-sm">배송 정보</h3>
                                            {!isEditingDelivery ? (
                                                <button
                                                    onClick={() => setIsEditingDelivery(true)}
                                                    className="text-sm text-brand-600 hover:underline"
                                                >
                                                    수정
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setIsEditingDelivery(false)}
                                                        className="text-sm text-gray-500 hover:underline"
                                                    >
                                                        취소
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!selectedOrder) return;

                                                            try {
                                                                const token = localStorage.getItem("token");
                                                                const res = await fetch(`https://jimo.world/api/delivery/${selectedOrder.order_id}`,
                                                                    {
                                                                        method: "PUT",
                                                                        headers: {
                                                                            "Content-Type": "application/json",
                                                                            Authorization: `Bearer ${token}`,
                                                                        },
                                                                        body: JSON.stringify({
                                                                            recipient_name: editDelivery.recipient_name,
                                                                            delivery_address: editDelivery.delivery_address,
                                                                            delivery_detail_address: editDelivery.delivery_detail_address,
                                                                            delivery_phone: editDelivery.delivery_phone,
                                                                            delivery_request: editDelivery.delivery_request,
                                                                        }),
                                                                    }
                                                                );

                                                                if (res.ok) {
                                                                    const data = await res.json();
                                                                    // console.log("✅ 배송 정보 수정 성공:", data.order);
                                                                    alert("배송 정보가 수정되었습니다.");
                                                                    setIsEditingDelivery(false);
                                                                    setSelectedOrder(data.order); // 화면 즉시 반영
                                                                } else {
                                                                    const err = await res.json();
                                                                    alert(`수정 실패: ${err.message || "알 수 없는 오류"}`);
                                                                }
                                                            } catch (err) {
                                                                console.error("❌ 서버 오류 발생:", err);
                                                                alert("서버 오류가 발생했습니다.");
                                                            }
                                                        }}
                                                        className="text-sm text-brand-600 font-semibold"
                                                    >
                                                        저장
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {!isEditingDelivery ? (
                                            <div className="text-gray-700 text-sm space-y-0.5">
                                                <p>수령자: {selectedOrder.recipient_name || "미등록"}</p>
                                                <p>연락처: {selectedOrder.delivery_phone || "미등록"}</p>
                                                <p>
                                                    주소: {selectedOrder.delivery_address}
                                                    {selectedOrder.delivery_detail_address && `, ${selectedOrder.delivery_detail_address}`}
                                                </p>
                                                {selectedOrder.delivery_request &&
                                                    <p>요청사항: {selectedOrder.delivery_request}</p>}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 mt-3">
                                                <input
                                                    type="text"
                                                    value={editDelivery.recipient_name}
                                                    onChange={(e) => setEditDelivery({
                                                        ...editDelivery,
                                                        recipient_name: e.target.value
                                                    })}
                                                    placeholder="수령자 이름"
                                                    className="w-full px-3 py-2 text-sm border rounded-lg"
                                                />
                                                <input
                                                    type="text"
                                                    value={editDelivery.delivery_phone}
                                                    onChange={(e) => setEditDelivery({
                                                        ...editDelivery,
                                                        delivery_phone: e.target.value
                                                    })}
                                                    placeholder="연락처"
                                                    className="w-full px-3 py-2 text-sm border rounded-lg"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editDelivery.delivery_address}
                                                        readOnly
                                                        placeholder="주소 검색을 눌러주세요"
                                                        className="flex-1 px-3 py-2 text-sm border rounded-lg bg-gray-50"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setActiveAddressTarget("delivery");
                                                            setShowAddressModal(true);
                                                        }}
                                                        className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition"
                                                    >
                                                        주소 검색
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={editDelivery.delivery_detail_address}
                                                    onChange={(e) => setEditDelivery({
                                                        ...editDelivery,
                                                        delivery_detail_address: e.target.value
                                                    })}
                                                    placeholder="상세주소"
                                                    className="w-full px-3 py-2 text-sm border rounded-lg"
                                                />
                                                <input
                                                    type="text"
                                                    value={editDelivery.delivery_request}
                                                    onChange={(e) => setEditDelivery({
                                                        ...editDelivery,
                                                        delivery_request: e.target.value
                                                    })}
                                                    placeholder="요청사항 (선택)"
                                                    className="w-full px-3 py-2 text-sm border rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* 송장 / 배송 상태 */}
                                    {/*{selectedOrder.tracking_number && (*/}
                                    <div className="pt-4 border-t border-gray-100 space-y-1">
                                        <h3 className="font-semibold text-gray-800 text-sm mb-1">배송 현황</h3>
                                        <div className="text-gray-700 text-sm space-y-0.5">
                                            <p>배송회사: 우체국</p>
                                            <p>
                                                송장번호:{" "}
                                                {selectedOrder.tracking_number ? (
                                                    <a
                                                        href={`https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${selectedOrder.tracking_number}&displayHeader=`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        {selectedOrder.tracking_number}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">출고대기</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {/*// )}*/}
                                </div>

                                {/* 버튼 */}
                                {/* 버튼 */}
                                <div className="mt-6 flex gap-3">
                                    {selectedOrder.status === "pending" ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    navigate(`#/purchase?orderId=${selectedOrder.order_id}`);
                                                }}
                                                className="flex-1 py-2 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition"
                                            >
                                                결제하기
                                            </button>
                                            <button
                                                onClick={() => setShowModal(false)}
                                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                                            >
                                                닫기
                                            </button>
                                        </>
                                    ) : selectedOrder.status === "paid" ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    if (selectedOrder.tracking_number) {
                                                        window.open(
                                                            `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${selectedOrder.tracking_number}&displayHeader=`,
                                                            '_blank',
                                                            'noopener,noreferrer'
                                                        );
                                                    } else {
                                                        alert("아직 송장번호가 등록되지 않았습니다.");
                                                    }
                                                }}
                                                className="flex-1 py-2 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition"
                                            >
                                                배송조회
                                            </button>

                                            {/* ✅ 결제취소 버튼 */}
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("결제를 취소하시겠습니까?")) return;

                                                    try {
                                                        const token = localStorage.getItem("token");
                                                        const res = await fetch("https://jimo.world/api/payment/cancel", {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                Authorization: `Bearer ${token}`,
                                                            },
                                                            body: JSON.stringify({
                                                                orderId: selectedOrder.order_id,
                                                                amount: selectedOrder.amount,
                                                                reason: "사용자 요청",
                                                            }),
                                                        });

                                                        const data = await res.json();
                                                        if (data.success) {
                                                            alert("결제가 취소되었습니다.");
                                                            // ✅ 상태 갱신
                                                            setSelectedOrder((prev: any) => ({
                                                                ...prev,
                                                                status: "cancelled",
                                                            }));
                                                            fetchOrders();
                                                        } else {
                                                            alert("결제 취소 실패: " + (data.error || "서버 오류"));
                                                        }
                                                    } catch (err) {
                                                        console.error("결제취소 오류:", err);
                                                        alert("서버 오류로 결제를 취소하지 못했습니다.");
                                                    }
                                                }}
                                                className="flex-1 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition"
                                            >
                                                결제취소
                                            </button>

                                            <button
                                                onClick={() => setShowModal(false)}
                                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                                            >
                                                닫기
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                                        >
                                            닫기
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>


                {/* 회원 탈퇴 버튼 */}
                <div className="mt-8">
                    <button
                        onClick={handleDelete}
                        className="w-full py-4 bg-red-50 text-red-600 text-sm rounded-xl font-semibold hover:bg-red-100 transition-colors border border-red-200"
                    >
                        회원 탈퇴
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
