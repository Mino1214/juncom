import {useEffect, useState} from "react";
import {AlertCircle, Check} from "lucide-react";
import {type NavigateProps, useApp} from "../App.tsx";

declare global {
    interface Window {
        AUTHNICE: any;
    }
}

const PurchasePage = ({navigate}: NavigateProps) => {
    const {user} = useApp();
    const [agreements, setAgreements] = useState({
        terms: false,
        privacy: false,
        refund: false
    });
    const [purchasing, setPurchasing] = useState<boolean>(false);
    const [success] = useState<boolean>(false);
    const [deliveryInfo, setDeliveryInfo] = useState({
        recipientName: '',
        address: '',
        detailAddress: '',
        phone: '',
        requestMessage: ''
    });
    const [userEmail, setUserEmail] = useState<string>('');
    const [showModal, setShowModal] = useState<string | null>(null);
    const [product, setProduct] = useState<any>(null); // 상품 정보 state 추가
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // ✅ 해시 라우팅 대응
        // useEffect 맨 위
        let productId: string | null = null;
        let orderId: string | null = null;

// ✅ Hash 라우팅 대응
        if (window.location.hash.includes('?')) {
            const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
            productId = hashParams.get('productId');
            orderId = hashParams.get('orderId');
        } else {
            const params = new URLSearchParams(window.location.search);
            productId = params.get('productId');
            orderId = params.get('orderId');
        }
        // ✅ 주문 기반 진입 (결제대기 내역에서 이동)
        const fetchOrderInfo = async (orderId: string) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`https://jimo.world/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('주문 정보 불러오기 실패');

                const data = await res.json();
                console.log('주문 정보:', data);

                // ✅ 상품 정보 세팅 (서버에서 product 객체가 아닌 경우 직접 구성)
                setProduct({
                    id: 0, // 백엔드에서 product_id를 내려주면 여기 교체
                    name: data.order.product_name,
                    price: data.order.amount,
                    // emoji: '📦',
                    description: '',
                });

                // ✅ 배송 정보 세팅
                setDeliveryInfo({
                    recipientName: data.order.recipient_name || '',
                    address: data.order.delivery_address || '',
                    detailAddress: data.order.delivery_detail || '',
                    phone: data.order.recipient_phone || '',
                    requestMessage: data.order.request_message || ''
                });

                // ✅ 구매자 이메일 (혹시 없을 수도 있음)
                setUserEmail(data.order.buyer_email || '');

                // ✅ 콘솔로 확인
                console.log('📦 세팅된 데이터:', {
                    product: {
                        name: data.order.product_name,
                        price: data.order.amount,
                    },
                    deliveryInfo: {
                        recipientName: data.order.recipient_name,
                        address: data.order.delivery_address,
                        detailAddress: data.order.delivery_detail,
                        phone: data.order.recipient_phone,
                    },
                });
            } catch (err) {
                console.error(err);
                alert('주문 정보를 불러올 수 없습니다.');
                navigate('/home');
            }
        };

// ✅ 상품 기반 진입 (상품 상세 > 구매하기 버튼)
        const fetchProductInfo = async (productId: string) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`https://jimo.world/api/products/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('상품 정보 불러오기 실패');
                const data = await res.json();
                setProduct(data);
            } catch (err) {
                console.error(err);
                alert('상품 정보를 불러올 수 없습니다.');
                navigate('/home');
            }
        };
        if (orderId) {
            // ✅ 결제대기 내역에서 진입
            fetchOrderInfo(orderId);
        } else if (productId) {
            // ✅ 일반 구매진입
            fetchProductInfo(productId);
        } else {
            // alert('잘못된 접근입니다.');
            navigate('/home');
        }


        // 나이스페이 스크립트 로드
        const script = document.createElement('script');
        script.src = 'https://pay.nicepay.co.kr/v1/js/';
        script.async = true;
        document.head.appendChild(script);
        // 사용자 정보 불러오기
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://jimo.world/api/user/${user.email}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const userData = await response.json();

                if (userData) {
                    setDeliveryInfo({
                        recipientName: userData.name || '',
                        address: userData.address || '',
                        detailAddress: userData.address_detail || '',
                        phone: userData.phone || '',
                        requestMessage: ''
                    });
                    setUserEmail(userData.email || '');
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
        };

        fetchUserInfo();

        return () => {
            // 컴포넌트 언마운트 시 스크립트 제거
            const scripts = document.querySelectorAll('script[src="https://pay.nicepay.co.kr/v1/js/"]');
            scripts.forEach(s => s.remove());
        };
    }, [user, navigate]);

    const allAgreed = agreements.terms && agreements.privacy && agreements.refund;

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressResults, setAddressResults] = useState<any[]>([]);
    const [addressKeyword, setAddressKeyword] = useState('');
    const [isSearching, setIsSearching] = useState(false);

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

        setDeliveryInfo(prev => ({ ...prev, address: fullAddress }));
        setShowAddressModal(false);
        setAddressKeyword('');
        setAddressResults([]);
    };
    const handlePurchase = async (): Promise<void> => {
        if (!allAgreed) {
            alert('약관에 모두 동의해야 결제 가능합니다.');
            return;
        }

        // 배송 정보 유효성 검사
        if (!deliveryInfo.recipientName || !deliveryInfo.address || !deliveryInfo.phone) {
            alert('배송 정보를 모두 입력해주세요.');
            return;
        }

        // ✅ 상품 정보가 없으면 에러 처리
        if (!product) {
            alert('상품 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        setPurchasing(true);

        try {
            // ✅ 기존 orderId가 있으면 그대로 사용
            let orderId: string | null = null;
            if (window.location.hash.includes('?')) {
                const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
                orderId = hashParams.get('orderId');
            } else {
                const params = new URLSearchParams(window.location.search);
                orderId = params.get('orderId');
            }
            const finalOrderId = orderId || `ORD-${Date.now()}`;

            console.log('🛒 최종 주문 ID:', finalOrderId);
            // 백엔드에서 결제 정보 생성
            const response = await fetch('https://jimo.world/api/payment/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: finalOrderId,
                    amount: product.price,
                    // amount: 1000,
                    buyerName: deliveryInfo.recipientName,
                    buyerEmail: userEmail,
                    buyerTel: deliveryInfo.phone,
                    productName: product.name,
                    productId: product.id,
                    employeeId: user?.employeeId,
                    // ✅ 서버 엔드포인트로 설정
                    returnUrl: `https://jimo.world/api/payment/complete`,

                    // ✅ 배송 정보 추가
                    recipientName: deliveryInfo.recipientName,
                    deliveryAddress: deliveryInfo.address,
                    deliveryDetailAddress: deliveryInfo.detailAddress,
                    deliveryPhone: deliveryInfo.phone,
                    deliveryRequest: deliveryInfo.requestMessage
                })
            });


            const data = await response.json();
            console.log('💳 결제 요청 응답:', data);
            // ✅ result 중첩 유무 자동 감지
            const paymentData = data.result ? data.result : data;
            // ✅ AUTHNICE 결제 요청
            if (window.AUTHNICE) {
                window.AUTHNICE.requestPay({
                    clientId: paymentData.clientId,
                    method: 'card',
                    orderId: paymentData.orderId,
                    amount: paymentData.amount,
                    goodsName: paymentData.goodsName,
                    returnUrl: paymentData.returnUrl,
                    fnSuccess: async function (response: any) {
                        console.log("결제 성공:", response);
                        try {
                            const approveRes = await fetch('https://jimo.world/api/payment/result', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    tid: response.tid,
                                    orderId: response.orderId,
                                    amount: response.amount
                                })
                            });
                            const approveData = await approveRes.json();

                            if (approveData.success) {
                                alert("결제가 완료되었습니다!");
                                navigate(`/order?orderId=${response.orderId}`);
                            } else {
                                alert("결제 승인 실패: " + approveData.error);
                            }
                        } catch (e) {
                            console.error("승인 요청 오류:", e);
                            alert("결제 승인 중 오류가 발생했습니다.");
                        } finally {
                            setPurchasing(false);
                        }
                    },
                    fnError: function (error: any) {
                        console.error("결제 실패:", error);
                        alert("결제 실패: " + (error?.resultMsg || error?.errorMsg || "알 수 없는 오류"));
                        setPurchasing(false);
                    }
                });
            } else {
                alert('결제 요청 실패 (AUTHNICE 객체 없음)');
                setPurchasing(false);
            }
        } catch (error) {
            console.error('결제 요청 오류:', error);
            alert('결제 요청 중 오류가 발생했습니다.');
            setPurchasing(false);
        }
    };
    // const handlePurchase = async (): Promise<void> => {
    //     setPurchasing(true);
    //     // TODO: API 연동
    //
    //     setTimeout(() => {
    //         setPurchasing(false);
    //         setSuccess(true);
    //     }, 1500);
    // };

    const agreementContents = {
        terms: {
            title: '전자금융거래 이용약관',
            content: `
                <h3 class="font-bold text-lg mb-4">제1조 (목적)</h3>
                <p class="mb-4">본 약관은 회사가 제공하는 전자금융거래 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                
                <h3 class="font-bold text-lg mb-4 mt-6">제2조 (용어의 정의)</h3>
                <p class="mb-2">1. "전자금융거래"라 함은 회사가 전자적 장치를 통하여 제공하는 금융상품 및 서비스를 이용자가 전자적 장치를 통하여 비대면·자동화된 방식으로 직접 이용하는 거래를 말합니다.</p>
                <p class="mb-2">2. "이용자"라 함은 전자금융거래를 위하여 회사와 체결한 계약에 따라 회사가 제공하는 전자금융거래서비스를 이용하는 자를 말합니다.</p>
                <p class="mb-4">3. "접근매체"라 함은 전자금융거래에 있어서 거래지시를 하거나 이용자 및 거래내용의 진실성과 정확성을 확보하기 위하여 사용되는 수단 또는 정보를 말합니다.</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제3조 (이용시간)</h3>
                <p class="mb-4">전자금융거래 서비스의 이용시간은 회사의 업무 또는 기술상 특별한 지장이 없는 한 연중무휴 1일 24시간을 원칙으로 합니다. 다만, 정기 점검 등의 필요로 회사가 정한 날 또는 시간은 제외됩니다.</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제4조 (거래내용의 확인)</h3>
                <p class="mb-4">회사는 이용자와 미리 약정한 전자적 방법을 통하여 이용자의 거래내용을 확인할 수 있도록 하며, 이용자의 요청이 있는 경우에는 요청을 받은 날로부터 2주 이내에 거래내용에 관한 서면을 교부합니다.</p>
            `
        },
        privacy: {
            title: '개인정보 제3자 제공 동의',
            content: `
                <h3 class="font-bold text-lg mb-4">제공받는 자</h3>
                <p class="mb-4">상품 배송업체, 결제 대행사</p>
                
                <h3 class="font-bold text-lg mb-4 mt-6">제공 목적</h3>
                <p class="mb-2">1. 상품 배송 및 배송 현황 안내</p>
                <p class="mb-2">2. 결제 처리 및 결제 내역 관리</p>
                <p class="mb-4">3. 고객 문의 및 A/S 처리</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제공 항목</h3>
                <p class="mb-2">- 성명, 사번</p>
                <p class="mb-2">- 배송지 주소, 연락처</p>
                <p class="mb-4">- 주문 상품 정보</p>

                <h3 class="font-bold text-lg mb-4 mt-6">보유 및 이용기간</h3>
                <p class="mb-2">- 배송 완료후 보증 기간 종료 후 삭제(또는 요청시 즉시 삭제)</p>

                <h3 class="font-bold text-lg mb-4 mt-6">거부권 및 불이익</h3>
                <p class="mb-4">귀하는 개인정보 제3자 제공에 대한 동의를 거부할 권리가 있습니다. 단, 동의를 거부할 경우 상품 구매 및 배송이 불가능합니다.</p>
                
                
            `
        },
        refund: {
            title: '결제 취소 및 환불 규정',
            content: `
                <h3 class="font-bold text-lg mb-4">제1조 (취소 및 환불 정책)</h3>
               <p className="mb-4">
본 상품은 구매 후에도 결제 취소 및 환불이 가능합니다. 
다만, 배송이 이미 시작된 경우에는 상품이 도착한 이후 반품 및 환불 절차가 진행됩니다.
</p>
                <h3 class="font-bold text-lg mb-4 mt-6">제2조 (예외 사항)</h3>
                <p class="mb-2">다음의 경우에는 환불 또는 교환이 가능합니다:</p>
                <p class="mb-2">1. 상품에 하자가 있거나 주문한 상품과 다른 상품이 배송된 경우</p>
                <p class="mb-2">2. 배송 과정에서 상품이 파손된 경우</p>
                <p class="mb-4">3. 회사의 귀책사유로 정상적인 배송이 불가능한 경우</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제3조 (환불 절차)</h3>
                <p class="mb-2">1. 환불 사유 발생 시 고객센터(010-2385-4214)로 연락</p>
                <p class="mb-2">2. 상품 반송 (택배비 회사 부담)</p>
                <p class="mb-2">3. 상품 확인 후 3영업일 이내 환불 처리</p>
                <p class="mb-4">4. 결제 수단에 따라 환불 완료까지 3-7영업일 소요</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제4조 (유의사항)</h3>
                <p class="mb-2">- 본 상품은 1인 1회 한정 구매 가능한 복리후생 혜택 상품입니다.</p>
                <p class="mb-4">- 수령 후 7일 이내 하자 발견 시 즉시 신고해 주시기 바랍니다.</p>
            `
        }
    };

    const openModal = (type: string) => {
        setShowModal(type);
    };

    const closeModal = () => {
        setShowModal(null);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-3xl p-8 text-center">
                        <div
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="text-green-600" size={40}/>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">구매 완료</h2>
                        <p className="text-gray-600 mb-8">
                            주문이 성공적으로 완료되었습니다<br/>
                            수령 안내는 이메일로 발송됩니다
                        </p>
                        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">주문번호</span>
                                    <span className="font-semibold">#2024100301</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">구매자</span>
                                    <span className="font-semibold">{user?.name} ({user?.employeeId})</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">배송지</span>
                                    <span className="font-semibold text-right">{deliveryInfo.address}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/home')}
                            className="w-full py-4 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto p-4 py-8">
                <button
                    onClick={() => navigate('/home')}
                    className="mb-6 text-gray-600 flex items-center gap-1 hover:text-gray-900"
                >
                    ← 뒤로
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">구매하기</h1>

                {/* 선택 상품 */}
                <div className="bg-white rounded-2xl p-6 mb-4">
                    <h2 className="font-semibold text-gray-900 mb-4">선택 상품</h2>
                    <div className="flex items-center gap-4">
                        <img
                            src={"https://roomfiles.s3.ap-northeast-2.amazonaws.com/uploads/%E1%84%8F%E1%85%A1%E1%84%87%E1%85%A9%E1%86%ABX1%E1%84%8A%E1%85%A5%E1%86%B7%E1%84%82%E1%85%A6%E1%84%8B%E1%85%B5%E1%86%AF+(1).png"}
                            alt={product?.name}
                            className="w-16 h-16 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{product?.name || "Lenovo Thinkpad X1 Carbon Gen9"}</h3>
                            {/*<p className="text-sm text-gray-500 mt-1">{product?.spec}</p>*/}
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                                ₩{product?.price?.toLocaleString('ko-KR') || '330,000'}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">수량: 1개</div>
                        </div>
                    </div>
                </div>

                {/* 구매자 정보 */}
                <div className="bg-white rounded-2xl p-6 mb-4">
                    <h2 className="font-semibold text-gray-900 mb-4">구매자 정보</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">이름</span>
                            <span className="font-semibold">{user?.name}</span>
                        </div>
                        {/*<div className="flex justify-between py-3 border-b border-gray-100">*/}
                        {/*    <span className="text-gray-600">사번</span>*/}
                        {/*    <span className="font-semibold">{user?.employeeId}</span>*/}
                        {/*</div>*/}
                        {userEmail && (
                            <div className="flex justify-between py-3">
                                <span className="text-gray-600">이메일</span>
                                <span className="font-semibold text-sm">{userEmail}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 배송 정보 */}
                <div className="bg-white rounded-2xl p-6 mb-4">
                    <h2 className="font-semibold text-gray-900 mb-4">배송 정보</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-600 block mb-2">수령자</label>
                            <input
                                type="text"
                                value={deliveryInfo.recipientName}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, recipientName: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="수령자 이름"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-2">배송지 주소</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={deliveryInfo.address}
                                    readOnly
                                    placeholder="주소 검색 버튼을 클릭하세요"
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(true)}
                                    className="px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium whitespace-nowrap"
                                >
                                    주소 검색
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-2">상세 주소</label>
                            <input
                                type="text"
                                value={deliveryInfo.detailAddress}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, detailAddress: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-2">연락처</label>
                            <input
                                type="tel"
                                value={deliveryInfo.phone}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-2">배송 요청사항</label>
                            <textarea
                                value={deliveryInfo.requestMessage}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, requestMessage: e.target.value})}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                placeholder="예) 부재 시 경비실에 맡겨주세요"
                            />
                        </div>
                        {/*<div className="bg-brand-50 rounded-lg p-4 border border-brand-100">*/}
                        {/*    <p className="text-sm text-brand-800">*/}
                        {/*        <span className="font-semibold">예상 수령일:</span> 2024년 10월 10일 (목)*/}
                        {/*    </p>*/}
                        {/*</div>*/}
                    </div>
                </div>

                {/* 주소 검색 모달 */}
                {showAddressModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold mb-4">주소 검색</h2>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="도로명 또는 지번 주소 입력"
                                        value={addressKeyword}
                                        onChange={(e) => setAddressKeyword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl"
                                    />
                                    <button
                                        onClick={handleAddressSearch}
                                        disabled={isSearching}
                                        className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium disabled:bg-gray-300"
                                    >
                                        {isSearching ? '검색중...' : '검색'}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {addressResults.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
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
                                                    className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition"
                                                >
                                                    {isPlace && placeName && (
                                                        <div className="font-semibold text-brand-600 text-sm mb-1">
                                                            📍 {placeName}
                                                        </div>
                                                    )}
                                                    <div className="font-medium text-gray-900">
                                                        {mainAddress}
                                                        {buildingName && ` (${buildingName})`}
                                                    </div>
                                                    {subAddress && mainAddress !== subAddress && (
                                                        <div className="text-sm text-gray-500 mt-1">
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

                            <div className="p-6 border-t">
                                <button
                                    onClick={() => {
                                        setShowAddressModal(false);
                                        setAddressKeyword('');
                                        setAddressResults([]);
                                    }}
                                    className="w-full py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 결제 정보 */}
                <div className="bg-white rounded-2xl p-6 mb-4">
                    <h2 className="font-semibold text-gray-900 mb-4">결제 정보</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">상품 금액</span>
                            <span className="font-semibold">
    {product?.price?.toLocaleString('ko-KR') || '330,000'}원
  </span>
                        </div>

                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">배송비</span>
                            <span className="font-semibold text-green-600">무료</span>
                        </div>

                        <div className="border-t border-gray-200 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">최종 결제금액</span>
                                <span className="text-2xl font-bold text-black">
      {product?.price?.toLocaleString('ko-KR')|| '330,000'}원
    </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 결제 수단 */}
                <div className="bg-white rounded-2xl p-6 mb-4">
                    <h2 className="font-semibold text-gray-900 mb-4">결제 수단</h2>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <label className="flex items-center gap-3 cursor-not-allowed">
                            <input
                                type="radio"
                                checked
                                disabled
                                readOnly
                                className="w-5 h-5 text-brand-600 border-gray-300"
                            />
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-6 h-6 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                </svg>
                                <span className="font-medium text-gray-700">신용카드</span>
                            </div>
                        </label>
                        <p className="text-sm text-gray-500 mt-2 ml-8">
                            나이스페이 결제 시스템을 통해 안전하게 결제됩니다.
                        </p>
                        <p className="text-xs text-gray-400 mt-1 ml-8">
                            ※ 현재는 <span className="font-medium text-gray-600">신용카드 결제만 지원</span>됩니다.
                        </p>
                    </div>
                </div>

                {/* 주의사항 */}
                <div className="bg-gray-100 rounded-2xl p-5 mb-6 border border-gray-300">
                    <div className="flex gap-3">
                        <AlertCircle className="text-gray-600 flex-shrink-0 mt-0.5" size={20}/>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">구매 전 확인사항</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• 1인 1대 한정 구매 가능합니다</li>
                                <li>• 수령은 구매일로부터 7일 이내 가능합니다</li>
                            </ul>

                            {/* ✅ 추가된 환불 규정 */}
                            <div className="mt-4 text-sm text-gray-700 space-y-1">
                                <h4 className="font-semibold text-gray-900">환불 규정</h4>
                                <p>교환/반품: 상품 수령 후 7일 이내 가능 (단순 변심 시 왕복 배송비 고객 부담)</p>
                                <p>불량 제품: 수령 후 14일 이내 무상 교환 또는 환불 (배송비 판매자 부담)</p>
                                <p>환불 기간: 반품 승인 후 3-5 영업일 내 환불 처리</p>
                                <p className="text-xs text-gray-600 mt-2">
                                    * 상세한 교환/환불 절차는 고객센터(010-2385-4214)로 문의해주세요.<br/>
                                    * 전자상거래법 및 소비자보호법에 따라 소비자의 권리가 보호됩니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 동의 */}
                <div className="bg-white rounded-2xl p-6 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-4">약관 동의</h2>

                    <div className="space-y-4">
                        {/* 전자금융거래 이용약관 */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreements.terms}
                                onChange={(e) => setAgreements({...agreements, terms: e.target.checked})}
                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <div className="flex-1">
                                <span className="text-gray-700">전자금융거래 이용약관에 동의합니다. (필수)</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openModal('terms');
                                    }}
                                    className="ml-2 text-sm text-brand-600 hover:text-brand-700 underline"
                                >
                                    상세보기
                                </button>
                            </div>
                        </label>

                        {/* 개인정보 제3자 제공 */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreements.privacy}
                                onChange={(e) => setAgreements({...agreements, privacy: e.target.checked})}
                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <div className="flex-1">
                                <span className="text-gray-700">개인정보 제3자 제공에 동의합니다. (필수)</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openModal('privacy');
                                    }}
                                    className="ml-2 text-sm text-brand-600 hover:text-brand-700 underline"
                                >
                                    상세보기
                                </button>
                            </div>
                        </label>

                        {/* 결제 취소 및 환불 규정 */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreements.refund}
                                onChange={(e) => setAgreements({...agreements, refund: e.target.checked})}
                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <div className="flex-1">
                                <span className="text-gray-700">결제 취소 및 환불 규정에 동의합니다. (필수)</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openModal('refund');
                                    }}
                                    className="ml-2 text-sm text-brand-600 hover:text-brand-700 underline"
                                >
                                    상세보기
                                </button>
                            </div>
                        </label>
                    </div>
                </div>

                {/* 구매 버튼 */}
                <button
                    onClick={handlePurchase}
                    disabled={!allAgreed || purchasing}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                        allAgreed && !purchasing
                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {purchasing ? '처리중...' : '구매 확정하기'}
                </button>

                {/* 약관 모달 */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {agreementContents[showModal as keyof typeof agreementContents].title}
                                </h2>
                            </div>
                            <div
                                className="p-6 overflow-y-auto flex-1 text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: agreementContents[showModal as keyof typeof agreementContents].content
                                }}
                            />
                            <div className="p-6 border-t border-gray-200">
                                <button
                                    onClick={closeModal}
                                    className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchasePage;