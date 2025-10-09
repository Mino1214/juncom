import {useEffect, useState} from "react";
import {AlertCircle, Check} from "lucide-react";
import {type NavigateProps, useApp} from "../App.tsx";

// Daum 주소 검색 타입 정의
declare global {
    interface Window {
        daum: any;
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
    const [success, setSuccess] = useState<boolean>(false);
    const [deliveryInfo, setDeliveryInfo] = useState({
        address: '서울특별시 강남구 테헤란로 123',
        detailAddress: '스타트업 캠퍼스 5층',
        phone: '010-1234-5678',
        requestMessage: '부재 시 경비실에 맡겨주세요'
    });
    const [showModal, setShowModal] = useState<string | null>(null);

    useEffect(() => {
        // Daum 우편번호 서비스 스크립트 로드
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const allAgreed = agreements.terms && agreements.privacy && agreements.refund;

    // 카카오 주소 검색
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function(data: any) {
                // 도로명 주소 우선, 없으면 지번 주소
                const fullAddress = data.roadAddress || data.jibunAddress;
                setDeliveryInfo(prev => ({ ...prev, address: fullAddress }));
            }
        }).open();
    };

    const handlePurchase = async (): Promise<void> => {
        setPurchasing(true);
        // TODO: API 연동

        setTimeout(() => {
            setPurchasing(false);
            setSuccess(true);
        }, 1500);
    };

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
                <p class="mb-4">배송 완료 후 3개월까지 보관하며, 전자상거래 등에서의 소비자보호에 관한 법률에 따라 5년간 보관됩니다.</p>

                <h3 class="font-bold text-lg mb-4 mt-6">거부권 및 불이익</h3>
                <p class="mb-4">귀하는 개인정보 제3자 제공에 대한 동의를 거부할 권리가 있습니다. 단, 동의를 거부할 경우 상품 구매 및 배송이 불가능합니다.</p>
            `
        },
        refund: {
            title: '결제 취소 및 환불 규정',
            content: `
                <h3 class="font-bold text-lg mb-4">제1조 (취소 및 환불 정책)</h3>
                <p class="mb-4">본 상품은 회사 복리후생 제도를 통한 특별 할인 상품으로, 구매 확정 후에는 취소 및 환불이 불가능합니다.</p>
                
                <h3 class="font-bold text-lg mb-4 mt-6">제2조 (예외 사항)</h3>
                <p class="mb-2">다음의 경우에는 환불 또는 교환이 가능합니다:</p>
                <p class="mb-2">1. 상품에 하자가 있거나 주문한 상품과 다른 상품이 배송된 경우</p>
                <p class="mb-2">2. 배송 과정에서 상품이 파손된 경우</p>
                <p class="mb-4">3. 회사의 귀책사유로 정상적인 배송이 불가능한 경우</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제3조 (환불 절차)</h3>
                <p class="mb-2">1. 환불 사유 발생 시 고객센터(1588-XXXX)로 연락</p>
                <p class="mb-2">2. 상품 반송 (택배비 회사 부담)</p>
                <p class="mb-2">3. 상품 확인 후 3영업일 이내 환불 처리</p>
                <p class="mb-4">4. 결제 수단에 따라 환불 완료까지 3-7영업일 소요</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제4조 (유의사항)</h3>
                <p class="mb-2">- 본 상품은 1인 1회 한정 구매 가능한 복리후생 혜택 상품입니다.</p>
                <p class="mb-2">- 단순 변심에 의한 취소/환불은 불가합니다.</p>
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
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">예상 수령일</span>
                                    <span className="font-semibold">2024년 10월 10일</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/home')}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
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
                        <div className="text-5xl">💻</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">MacBook Pro 14" M3</h3>
                            <p className="text-sm text-gray-500 mt-1">M3 칩 • 16GB • 512GB</p>
                        </div>
                        <div className="text-xl font-bold text-gray-900">1,200,000원</div>
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
                        <div className="flex justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">사번</span>
                            <span className="font-semibold">{user?.employeeId}</span>
                        </div>
                        <div className="flex justify-between py-3">
                            <span className="text-gray-600">이메일</span>
                            <span className="font-semibold text-sm">{user?.employeeId}@company.com</span>
                        </div>
                    </div>
                </div>

                {/* 배송 정보 */}
                <div className="bg-white rounded-2xl p-6 mb-4">
                    <h2 className="font-semibold text-gray-900 mb-4">배송 정보</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-600 block mb-2">배송지 주소</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={deliveryInfo.address}
                                    readOnly
                                    placeholder="주소 검색 버튼을 클릭하세요"
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddressSearch}
                                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap"
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
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-2">연락처</label>
                            <input
                                type="tel"
                                value={deliveryInfo.phone}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-2">배송 요청사항</label>
                            <textarea
                                value={deliveryInfo.requestMessage}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, requestMessage: e.target.value})}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="예) 부재 시 경비실에 맡겨주세요"
                            />
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">예상 수령일:</span> 2024년 10월 10일 (목)
                            </p>
                        </div>
                    </div>
                </div>

                {/* 결제 정보 */}
                <div className="bg-white rounded-2xl p-6 mb-4">
                    <h2 className="font-semibold text-gray-900 mb-4">결제 정보</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">상품 금액</span>
                            <span className="font-semibold">1,200,000원</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">배송비</span>
                            <span className="font-semibold text-green-600">무료</span>
                        </div>
                        {/*<div className="flex justify-between py-2">*/}
                        {/*    <span className="text-gray-600">복리후생 할인</span>*/}
                        {/*    <span className="font-semibold text-red-600">-200,000원</span>*/}
                        {/*</div>*/}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">최종 결제금액</span>
                                <span className="text-2xl font-bold text-blue-600">1,200,000원</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 주의사항 */}
                <div className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-100">
                    <div className="flex gap-3">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">구매 전 확인사항</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• 1인 1대 한정 구매 가능합니다</li>
                                <li>• 구매 후 취소/환불이 불가능합니다</li>
                                <li>• 수령은 구매일로부터 7일 이내 가능합니다</li>
                            </ul>
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
                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <span className="text-gray-700">전자금융거래 이용약관에 동의합니다. (필수)</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openModal('terms');
                                    }}
                                    className="ml-2 text-sm text-blue-600 hover:text-blue-700 underline"
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
                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <span className="text-gray-700">개인정보 제3자 제공에 동의합니다. (필수)</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openModal('privacy');
                                    }}
                                    className="ml-2 text-sm text-blue-600 hover:text-blue-700 underline"
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
                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <span className="text-gray-700">결제 취소 및 환불 규정에 동의합니다. (필수)</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openModal('refund');
                                    }}
                                    className="ml-2 text-sm text-blue-600 hover:text-blue-700 underline"
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
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
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
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
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