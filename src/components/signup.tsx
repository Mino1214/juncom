import {useEffect, useState} from "react";
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

// Daum 주소 검색 타입 정의
declare global {
    interface Window {
        daum: any;
    }
}

const SignupPage = ({navigate}: NavigateProps) => {
    // URL 파라미터 파싱
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const kakaoId = urlParams.get('kakaoId') || '';
    const kakaoName = urlParams.get('name') || '';
    const kakaoEmail = urlParams.get('email') || '';
    const isKakaoSignup = !!kakaoId;

    const [formData, setFormData] = useState<FormData>({
        name: kakaoName,
        employeeId: '',
        email: kakaoEmail,
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

    // 블랙리스트 검증 관련 state
    const [isBlacklistChecked, setIsBlacklistChecked] = useState(false);
    const [isCheckingBlacklist, setIsCheckingBlacklist] = useState(false);

    // 이메일 인증 관련 state
    const [verificationCode, setVerificationCode] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [timer, setTimer] = useState(0);
    const [verificationToken, setVerificationToken] = useState('');

    const [showModal, setShowModal] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // Daum 우편번호 서비스 스크립트 로드
        const script = document.createElement('script');
        script.src = "/lib/postcode.v2.js"; // ← 로컬 경로로 교체
        script.async = true;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // 타이머 카운트다운
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const allRequiredAgreed = agreements.terms && agreements.privacy;

    // 카카오 회원가입은 비밀번호 불필요, 이메일 인증 필수
    const allFieldsFilled = isKakaoSignup
        ? formData.name && formData.employeeId && formData.email && formData.address && formData.phone && isEmailVerified && isBlacklistChecked
        : formData.name && formData.employeeId && formData.email &&
        formData.password && formData.passwordConfirm &&
        formData.address && formData.phone && isEmailVerified && isBlacklistChecked;

    const passwordMatch = isKakaoSignup || formData.password === formData.passwordConfirm;

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
                <p class="mb-2">- 사번, 이메일, 비밀번호</p>
                <p class="mb-2">- 배송지 주소, 연락처, 수령자</p>
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

    // 블랙리스트 체크
    const handleCheckBlacklist = async () => {
        if (!formData.employeeId || !formData.email) {
            alert('사번과 이메일을 먼저 입력해주세요.');
            return;
        }

        // ✅ 이메일 형식 유효성 검사 추가
        // const emailPattern = /^[a-zA-Z0-9._%+-]+@kr\.kpmg\.com$/;
        // if (!emailPattern.test(formData.email)) {
        //     alert('이메일은 반드시 @kr.kpmg.com 형식이어야 합니다.');
        //     return;
        // }

        setIsCheckingBlacklist(true);

        try {
            const response = await fetch(`https://jimo.world/api/employee/status/check?employee_id=${formData.employeeId}&email=${formData.email}`);
            const data = await response.json();

            if (response.ok) {
                if (data.is_blacklisted) {
                    alert('회원가입이 제한된 사용자입니다.\n자세한 내용은 관리자에게 문의해주세요.');
                    setIsBlacklistChecked(false);
                } else {
                    alert('확인 완료! 이메일 인증을 진행해주세요.');
                    setIsBlacklistChecked(true);
                }
            } else {
                alert(data.message || '확인 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Blacklist check error:', error);
            alert('확인 중 오류가 발생했습니다.');
        } finally {
            setIsCheckingBlacklist(false);
        }
    };

    // 인증번호 발송
    const handleSendVerificationCode = async () => {
        if (!isBlacklistChecked) {
            alert('먼저 사번과 이메일을 확인해주세요.');
            return;
        }

        if (!formData.employeeId || !formData.email) {
            alert('사번과 이메일을 먼저 입력해주세요.');
            return;
        }

        setIsSendingCode(true);

        try {
            const response = await fetch('https://jimo.world/api/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: formData.employeeId,
                    email: formData.email
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('인증번호가 이메일로 발송되었습니다.');
                setIsCodeSent(true);
                setTimer(300); // 5분
                setVerificationCode('');
                setIsEmailVerified(false);
            } else {
                alert(data.message || '인증번호 발송에 실패했습니다.');
            }
        } catch (error) {
            console.error('Send verification error:', error);
            alert('인증번호 발송 중 오류가 발생했습니다.');
        } finally {
            setIsSendingCode(false);
        }
    };

    // 인증번호 확인
    const handleVerifyCode = async () => {
        if (!verificationCode) {
            alert('인증번호를 입력해주세요.');
            return;
        }

        setIsVerifyingCode(true);

        try {
            const response = await fetch('https://jimo.world/api/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email : formData.email,
                    code: verificationCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('이메일 인증이 완료되었습니다!');
                setIsEmailVerified(true);
                setVerificationToken(data.verificationToken);
                setTimer(0);
            } else {
                alert(data.message || '인증번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('Verify code error:', error);
            alert('인증번호 확인 중 오류가 발생했습니다.');
        } finally {
            setIsVerifyingCode(false);
        }
    };

    // 카카오 주소 검색
    // const handleAddressSearch = () => {
    //     const element_layer = document.getElementById('postcode-layer');
    //     if (!element_layer) return;
    //
    //     // 레이어 표시
    //     element_layer.style.display = 'block';
    //
    //     const postcode = new window.daum.Postcode({
    //         oncomplete: function (data: any) {
    //             const fullAddress = data.roadAddress || data.jibunAddress;
    //             setFormData(prev => ({ ...prev, address: fullAddress }));
    //
    //             // 완료 시 레이어 닫기
    //             element_layer.style.display = 'none';
    //         },
    //         width: '100%',
    //         height: '100%',
    //     });
    //
    //     // 페이지 내에 바로 삽입 (팝업X)
    //     postcode.embed(element_layer);
    // };

    const handleSignup = async (): Promise<void> => {
        if (!isKakaoSignup && !passwordMatch) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!allRequiredAgreed) {
            alert('필수 약관에 동의해주세요.');
            return;
        }

        if (!isBlacklistChecked) {
            alert('사번과 이메일 확인을 완료해주세요.');
            return;
        }

        if (!isEmailVerified) {
            alert('이메일 인증을 완료해주세요.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://jimo.world/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: formData.employeeId,
                    password: isKakaoSignup ? undefined : formData.password,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address + (formData.detailAddress ? ' ' + formData.detailAddress : ''),
                    kakaoId: kakaoId || undefined,
                    marketingAgreed: agreements.marketing,
                    verificationToken: verificationToken
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('회원가입이 완료되었습니다!');
                navigate('/login');
            } else {
                alert(data.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type: string) => {
        setShowModal(type);
    };

    const closeModal = () => {
        setShowModal(null);
    };

    // 타이머 포맷 (MM:SS)
    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

    const selectAddress = (address: any) => {
        const fullAddress = address.road_address?.address_name || address.address.address_name;
        setFormData(prev => ({ ...prev, address: fullAddress }));
        setShowAddressModal(false);
        setAddressKeyword('');
        setAddressResults([]);
    };


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto p-4 py-8">
                <button
                    onClick={() => navigate('/login')}
                    className="mb-6 text-gray-600 flex items-center gap-1 hover:text-gray-900"
                >
                    ← 뒤로
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isKakaoSignup ? '카카오 회원가입' : '회원가입'}
                </h1>
                <p className="text-gray-600 mb-8">
                    {isKakaoSignup ? '추가 정보를 입력해주세요' : '임직원 정보를 입력해주세요'}
                </p>

                {isKakaoSignup && (
                    <div className="mb-6 p-4 bg-brand-50 border border-brand-200 rounded-xl">
                        <p className="text-sm text-brand-800">
                            🎉 카카오 계정으로 간편하게 가입하실 수 있습니다!
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* 기본 정보 */}
                    <div className="bg-white rounded-2xl p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">기본 정보</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">사번 *</label>
                                <input
                                    type="text"
                                    placeholder="82019999"
                                    value={formData.employeeId}
                                    onChange={(e) => {
                                        setFormData({...formData, employeeId: e.target.value});
                                        setIsBlacklistChecked(false);
                                        setIsEmailVerified(false);
                                    }}
                                    disabled={isBlacklistChecked}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 *</label>
                                <input
                                    type="email"
                                    placeholder="hong@kr.kpmg.com"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({...formData, email: e.target.value});
                                        setIsBlacklistChecked(false);
                                        setIsEmailVerified(false);
                                    }}
                                    disabled={(isKakaoSignup && !!kakaoEmail) || isBlacklistChecked}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            {/* 블랙리스트 체크 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">사번 및 이메일 확인 *</label>
                                <button
                                    type="button"
                                    onClick={handleCheckBlacklist}
                                    disabled={isCheckingBlacklist || isBlacklistChecked || !formData.employeeId || !formData.email}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {isCheckingBlacklist ? '확인 중...' : isBlacklistChecked ? '확인 완료' : '사번/이메일 확인'}
                                </button>
                                {isBlacklistChecked && (
                                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                        확인이 완료되었습니다. 이메일 인증을 진행해주세요.
                                    </p>
                                )}
                            </div>

                            {/* 이메일 인증 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 인증 *</label>
                                <div className="flex gap-2 mb-2">
                                    <button
                                        type="button"
                                        onClick={handleSendVerificationCode}
                                        disabled={isSendingCode || isEmailVerified || !isBlacklistChecked}
                                        className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isSendingCode ? '발송 중...' : isEmailVerified ? '인증 완료' : isCodeSent ? '재발송' : '인증번호 발송'}
                                    </button>
                                </div>

                                {!isBlacklistChecked && (
                                    <p className="text-sm text-gray-500">
                                        ℹ️ 먼저 사번과 이메일 확인을 완료해주세요.
                                    </p>
                                )}

                                {isCodeSent && !isEmailVerified && (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="인증번호 6자리"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                maxLength={6}
                                                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyCode}
                                                disabled={isVerifyingCode || !verificationCode}
                                                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                                            >
                                                {isVerifyingCode ? '요청중' : '인증'}
                                            </button>
                                        </div>
                                        {timer > 0 && (
                                            <p className="text-sm text-red-600">
                                                남은 시간: {formatTimer(timer)}
                                            </p>
                                        )}
                                        {timer === 0 && (
                                            <p className="text-sm text-red-600">
                                                인증번호가 만료되었습니다. 재발송해주세요.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {isEmailVerified && (
                                    <p className="text-sm text-green-600 flex items-center gap-1">
                                        이메일 인증이 완료되었습니다.
                                    </p>
                                )}
                            </div>

                            {/* 비밀번호는 일반 회원가입시만 표시 */}
                            {!isKakaoSignup && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 *</label>
                                        <input
                                            type="password"
                                            placeholder="8자 이상"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
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
                                                    : 'border-gray-200 focus:ring-brand-500'
                                            }`}
                                        />
                                        {formData.passwordConfirm && !passwordMatch && (
                                            <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 배송 정보 */}
                    <div className="bg-white rounded-2xl p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">배송 정보</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">이름 *</label>
                                <input
                                    type="text"
                                    placeholder="홍길동"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    disabled={isKakaoSignup && !!kakaoName}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">연락처 *</label>
                                <input
                                    type="tel"
                                    placeholder="-없이 입력"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">주소 *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="선택된 주소"
                                        value={formData.address}
                                        readOnly
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAddressModal(true)}
                                        className="px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium whitespace-nowrap"
                                    >
                                        주소 검색
                                    </button>
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
                                                    {addressResults.map((addr, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => selectAddress(addr)}
                                                            className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition"
                                                        >
                                                            <div className="font-medium text-gray-900">
                                                                {addr.road_address?.address_name || addr.address.address_name}
                                                            </div>
                                                            {addr.road_address && (
                                                                <div className="text-sm text-gray-500 mt-1">
                                                                    지번: {addr.address.address_name}
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
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

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">상세 주소</label>
                                <input
                                    type="text"
                                    placeholder="상세주소"
                                    value={formData.detailAddress}
                                    onChange={(e) => setFormData({...formData, detailAddress: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
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
                                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                />
                                <div className="flex-1">
                                    <span className="text-gray-700">이용약관에 동의합니다. <span className="text-red-500">*</span></span>
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

                            {/* 개인정보 수집 및 이용 */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreements.privacy}
                                    onChange={(e) => setAgreements({...agreements, privacy: e.target.checked})}
                                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                />
                                <div className="flex-1">
                                    <span className="text-gray-700">개인정보 수집 및 이용에 동의합니다. <span className="text-red-500">*</span></span>
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

                            {/* 마케팅 정보 수신 (선택) */}
                            {/*<label className="flex items-start gap-3 cursor-pointer group">*/}
                            {/*    <input*/}
                            {/*        type="checkbox"*/}
                            {/*        checked={agreements.marketing}*/}
                            {/*        onChange={(e) => setAgreements({...agreements, marketing: e.target.checked})}*/}
                            {/*        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"*/}
                            {/*    />*/}
                            {/*    <div className="flex-1">*/}
                            {/*        <span className="text-gray-700">마케팅 정보 수신에 동의합니다. (선택)</span>*/}
                            {/*        <button*/}
                            {/*            type="button"*/}
                            {/*            onClick={(e) => {*/}
                            {/*                e.preventDefault();*/}
                            {/*                openModal('marketing');*/}
                            {/*            }}*/}
                            {/*            className="ml-2 text-sm text-brand-600 hover:text-brand-700 underline"*/}
                            {/*        >*/}
                            {/*            상세보기*/}
                            {/*        </button>*/}
                            {/*    </div>*/}
                            {/*</label>*/}
                        </div>
                    </div>

                    <button
                        onClick={handleSignup}
                        disabled={!allFieldsFilled || !allRequiredAgreed || !passwordMatch || loading}
                        className="w-full py-4 bg-brand-600 text-white rounded-xl font-semibold text-base hover:bg-brand-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? '가입 중...' : '가입하기'}
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

export default SignupPage;