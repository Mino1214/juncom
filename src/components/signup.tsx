import {useState} from "react";
import {type NavigateProps} from "../App.tsx";

interface FormData {
    name: string;
    employeeId: string;
    email: string;
    password: string;
    passwordConfirm: string;
    address: string;
    detailAddress: string;
    phone: string;
}

interface Agreements {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
}

const SignupPage = ({navigate}: NavigateProps) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        employeeId: '',
        email: '',
        password: '',
        passwordConfirm: '',
        address: '',
        detailAddress: '',
        phone: ''
    });

    const [agreements, setAgreements] = useState<Agreements>({
        terms: false,
        privacy: false,
        marketing: false
    });

    const [showModal, setShowModal] = useState<string | null>(null);

    const allRequiredAgreed = agreements.terms && agreements.privacy;
    const allFieldsFilled = formData.name && formData.employeeId && formData.email &&
        formData.password && formData.passwordConfirm &&
        formData.address && formData.phone;
    const passwordMatch = formData.password === formData.passwordConfirm;

    const agreementContents = {
        terms: {
            title: '이용약관',
            content: `
                <h3 class="font-bold text-lg mb-4">제1조 (목적)</h3>
                <p class="mb-4">본 약관은 회사가 운영하는 임직원 복리후생 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                
                <h3 class="font-bold text-lg mb-4 mt-6">제2조 (정의)</h3>
                <p class="mb-2">1. "서비스"란 회사가 임직원에게 제공하는 복리후생 혜택 플랫폼을 의미합니다.</p>
                <p class="mb-2">2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 임직원을 말합니다.</p>
                <p class="mb-4">3. "계정"이란 이용자의 식별과 서비스 이용을 위해 이용자가 설정하고 회사가 승인한 이메일 주소와 비밀번호의 조합을 의미합니다.</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제3조 (서비스의 제공)</h3>
                <p class="mb-2">1. 회사는 이용자에게 다음과 같은 서비스를 제공합니다:</p>
                <p class="mb-2">- 복리후생 상품 구매 서비스</p>
                <p class="mb-2">- 임직원 전용 할인 혜택</p>
                <p class="mb-4">- 기타 회사가 정하는 복리후생 관련 서비스</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제4조 (이용자의 의무)</h3>
                <p class="mb-2">1. 이용자는 본인의 계정 정보를 타인에게 양도하거나 대여할 수 없습니다.</p>
                <p class="mb-2">2. 이용자는 서비스 이용 시 관련 법령 및 본 약관을 준수해야 합니다.</p>
                <p class="mb-4">3. 이용자는 계정 정보의 변경사항이 있을 경우 즉시 회사에 통지해야 합니다.</p>

                <h3 class="font-bold text-lg mb-4 mt-6">제5조 (서비스 이용의 제한)</h3>
                <p class="mb-4">회사는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스 이용을 제한하거나 계정을 정지 또는 해지할 수 있습니다.</p>
            `
        },
        privacy: {
            title: '개인정보 수집 및 이용 동의',
            content: `
                <h3 class="font-bold text-lg mb-4">수집하는 개인정보 항목</h3>
                <p class="mb-2"><strong>필수 항목:</strong></p>
                <p class="mb-2">- 성명, 사번, 이메일, 비밀번호</p>
                <p class="mb-2">- 배송지 주소, 연락처</p>
                <p class="mb-4">- 서비스 이용 기록, 접속 로그, 쿠키</p>

                <p class="mb-2 mt-4"><strong>선택 항목:</strong></p>
                <p class="mb-4">- 마케팅 수신 동의 정보</p>
                
                <h3 class="font-bold text-lg mb-4 mt-6">개인정보의 수집 및 이용 목적</h3>
                <p class="mb-2">1. 회원 관리</p>
                <p class="mb-2">- 회원제 서비스 제공, 개인 식별, 부정 이용 방지</p>
                <p class="mb-2">- 서비스 이용에 따른 본인확인, 연령확인</p>
                <p class="mb-4">- 불량회원의 부정 이용 방지와 비인가 사용 방지</p>

                <p class="mb-2">2. 서비스 제공</p>
                <p class="mb-2">- 상품 구매 및 배송 서비스 제공</p>
                <p class="mb-2">- 청구서 발송, 본인인증, 요금 결제 및 정산</p>
                <p class="mb-4">- 고객 문의 대응 및 A/S 처리</p>

                <p class="mb-2">3. 마케팅 및 광고 활용 (선택)</p>
                <p class="mb-4">- 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공</p>

                <h3 class="font-bold text-lg mb-4 mt-6">개인정보의 보유 및 이용기간</h3>
                <p class="mb-2">- 회원 탈퇴 시까지 (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관)</p>
                <p class="mb-4">- 전자상거래법: 계약 또는 청약철회 등에 관한 기록 (5년)</p>

                <h3 class="font-bold text-lg mb-4 mt-6">동의를 거부할 권리 및 불이익</h3>
                <p class="mb-4">귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수 항목 동의를 거부하실 경우 회원가입 및 서비스 이용이 제한될 수 있습니다.</p>
            `
        },
        marketing: {
            title: '마케팅 정보 수신 동의 (선택)',
            content: `
                <h3 class="font-bold text-lg mb-4">수신 목적</h3>
                <p class="mb-4">회사의 신규 서비스, 이벤트, 프로모션, 특별 혜택 등의 마케팅 정보를 제공하기 위함입니다.</p>
                
                <h3 class="font-bold text-lg mb-4 mt-6">수신 방법</h3>
                <p class="mb-2">- 이메일</p>
                <p class="mb-2">- SMS/MMS</p>
                <p class="mb-4">- 앱 푸시 알림</p>

                <h3 class="font-bold text-lg mb-4 mt-6">수신 거부</h3>
                <p class="mb-4">마케팅 정보 수신에 동의하지 않으셔도 서비스 이용에는 제한이 없으며, 언제든지 수신을 거부하거나 동의를 철회하실 수 있습니다. 수신 거부는 마이페이지 또는 고객센터를 통해 가능합니다.</p>

                <h3 class="font-bold text-lg mb-4 mt-6">주의사항</h3>
                <p class="mb-4">마케팅 정보 수신 동의를 철회하시더라도, 서비스 제공을 위한 필수 공지사항(주문/배송 정보, 서비스 변경사항 등)은 발송됩니다.</p>
            `
        }
    };

    const handleSignup = async (): Promise<void> => {
        if (!passwordMatch) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!allRequiredAgreed) {
            alert('필수 약관에 동의해주세요.');
            return;
        }

        // TODO: API 연동
        alert('회원가입이 완료되었습니다!');
        navigate('#/login');
    };

    const openModal = (type: string) => {
        setShowModal(type);
    };

    const closeModal = () => {
        setShowModal(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto p-4 py-8">
                <button
                    onClick={() => navigate('#/login')}
                    className="mb-6 text-gray-600 flex items-center gap-1 hover:text-gray-900"
                >
                    ← 뒤로
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
                <p className="text-gray-600 mb-8">임직원 정보를 입력해주세요</p>

                <div className="space-y-6">
                    {/* 기본 정보 */}
                    <div className="bg-white rounded-2xl p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">기본 정보</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">이름 *</label>
                                <input
                                    type="text"
                                    placeholder="홍길동"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">사번 *</label>
                                <input
                                    type="text"
                                    placeholder="EMP2024001"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 *</label>
                                <input
                                    type="email"
                                    placeholder="hong@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 *</label>
                                <input
                                    type="password"
                                    placeholder="8자 이상"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인 *</label>
                                <input
                                    type="password"
                                    placeholder="비밀번호를 다시 입력하세요"
                                    value={formData.passwordConfirm}
                                    onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl text-base focus:outline-none focus:ring-2 transition ${
                                        formData.passwordConfirm && !passwordMatch
                                            ? 'border-red-300 focus:ring-red-500'
                                            : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                                />
                                {formData.passwordConfirm && !passwordMatch && (
                                    <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 배송 정보 */}
                    <div className="bg-white rounded-2xl p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">배송 정보</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">연락처 *</label>
                                <input
                                    type="tel"
                                    placeholder="010-1234-5678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">주소 *</label>
                                <input
                                    type="text"
                                    placeholder="서울특별시 강남구 테헤란로 123"
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">상세 주소</label>
                                <input
                                    type="text"
                                    placeholder="스타트업 캠퍼스 5층"
                                    value={formData.detailAddress}
                                    onChange={(e) => setFormData({...formData, detailAddress: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 약관 동의 */}
                    <div className="bg-white rounded-2xl p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">약관 동의</h2>

                        <div className="space-y-4">
                            {/* 이용약관 */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreements.terms}
                                    onChange={(e) => setAgreements({...agreements, terms: e.target.checked})}
                                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <span className="text-gray-700">이용약관에 동의합니다. <span className="text-red-500">*</span></span>
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

                            {/* 개인정보 수집 및 이용 */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreements.privacy}
                                    onChange={(e) => setAgreements({...agreements, privacy: e.target.checked})}
                                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <span className="text-gray-700">개인정보 수집 및 이용에 동의합니다. <span className="text-red-500">*</span></span>
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

                            {/* 마케팅 정보 수신 (선택) */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreements.marketing}
                                    onChange={(e) => setAgreements({...agreements, marketing: e.target.checked})}
                                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <span className="text-gray-700">마케팅 정보 수신에 동의합니다. (선택)</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            openModal('marketing');
                                        }}
                                        className="ml-2 text-sm text-blue-600 hover:text-blue-700 underline"
                                    >
                                        상세보기
                                    </button>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handleSignup}
                        disabled={!allFieldsFilled || !allRequiredAgreed || !passwordMatch}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        가입하기
                    </button>
                </div>

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

export default SignupPage;