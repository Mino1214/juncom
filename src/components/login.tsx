// 로그인 페이지
import {type NavigateProps, useApp} from "../App.tsx";
import {useState, useEffect} from "react";

// 카카오 SDK 타입 선언
declare global {
    interface Window {
        Kakao: any;
    }
}

const LoginPage = ({ navigate }: NavigateProps) => {
    const { setUser } = useApp();
    const [employeeId, setEmployeeId] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // 카카오 SDK 초기화
    useEffect(() => {
        // 카카오 SDK 스크립트 로드
        const script = document.createElement('script');
        script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            // TODO: 여기에 실제 카카오 JavaScript 키를 입력하세요
            const KAKAO_JS_KEY = '6500db13ddeff4065e25bd241021526d';

            if (window.Kakao && !window.Kakao.isInitialized()) {
                window.Kakao.init(KAKAO_JS_KEY);
                console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
            }
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleLogin = async (): Promise<void> => {
        setError('');
        setLoading(true);

        try {
            // TODO: 실제 API 엔드포인트로 변경
            const response = await fetch('https://jimo.world/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // 로그인 성공 - 회원인 경우
                setUser({
                    name: data.name,
                    employeeId: data.employeeId
                });
                navigate('/home');
            } else if (response.status === 404) {
                // 회원이 아닌 경우 - 가입 페이지로
                setError('등록되지 않은 사번입니다. 회원가입을 진행해주세요.');
                setTimeout(() => {
                    navigate(`/signup?employeeId=${employeeId}`);
                }, 1500);
            } else {
                // 비밀번호 오류 등
                setError(data.message || '로그인에 실패했습니다.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLogin = async (): Promise<void> => {
        if (!window.Kakao || !window.Kakao.isInitialized()) {
            setError('카카오 SDK가 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 카카오 로그인 실행
            // 모바일: 카카오톡 앱으로 전환
            // PC: 카카오 로그인 팝업
            window.Kakao.Auth.login({
                success: async (authObj: any) => {
                    console.log('카카오 로그인 성공:', authObj);

                    // 사용자 정보 가져오기
                    window.Kakao.API.request({
                        url: '/v2/user/me',
                        success: async (response: any) => {
                            console.log('사용자 정보:', response);

                            const kakaoId = response.id;
                            const kakaoName = response.kakao_account?.profile?.nickname || '';
                            const kakaoEmail = response.kakao_account?.email || '';

                            // 백엔드로 카카오 정보 전송하여 회원 확인
                            try {
                                const apiResponse = await fetch('https://jimo.world/api/auth/kakao', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        kakaoId: kakaoId.toString(),
                                        accessToken: authObj.access_token,
                                        name: kakaoName,
                                        email: kakaoEmail
                                    })
                                });

                                const data = await apiResponse.json();

                                if (apiResponse.ok && data.isRegistered) {
                                    // 기존 회원 - 바로 로그인
                                    setUser({
                                        name: data.name,
                                        employeeId: data.employeeId
                                    });
                                    navigate('/home');
                                } else if (apiResponse.ok && !data.isRegistered) {
                                    // 신규 회원 - 가입 페이지로 이동
                                    navigate(`/signup?kakaoId=${kakaoId}&name=${encodeURIComponent(kakaoName)}&email=${encodeURIComponent(kakaoEmail)}`);
                                } else {
                                    setError('카카오 로그인에 실패했습니다.');
                                    setLoading(false);
                                }
                            } catch (err) {
                                console.error('Backend API error:', err);
                                setError('서버 연결에 실패했습니다.');
                                setLoading(false);
                            }
                        },
                        fail: (error: any) => {
                            console.error('사용자 정보 가져오기 실패:', error);
                            setError('사용자 정보를 가져오는데 실패했습니다.');
                            setLoading(false);
                        }
                    });
                },
                fail: (err: any) => {
                    console.error('카카오 로그인 실패:', err);
                    setError('카카오 로그인을 취소하셨거나 실패했습니다.');
                    setLoading(false);
                }
            });
        } catch (err) {
            console.error('Kakao login error:', err);
            setError('카카오 로그인 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img
                        src="/KPMG_logo.png"
                        alt="KPMG Logo"
                        className="w-32 mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">임직원 복지몰</h1>
                    <p className="text-gray-600">사번으로 로그인해주세요</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="사번"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
                                disabled={loading}
                                className="w-full px-4 py-4 bg-gray-50 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
                                disabled={loading}
                                className="w-full px-4 py-4 bg-gray-50 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            disabled={!employeeId || !password || loading}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-base disabled:bg-gray-200 disabled:text-gray-400 transition hover:bg-blue-700"
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </div>

                    {/* 구분선 */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">또는</span>
                        </div>
                    </div>

                    {/* 카카오 로그인 버튼 */}
                    <button
                        onClick={handleKakaoLogin}
                        disabled={loading}
                        className="w-full py-4 bg-[#FEE500] text-gray-900 rounded-xl font-semibold text-base transition hover:bg-[#fddc00] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.442 1.443 4.615 3.686 6.09-.192.786-.75 3.09-.793 3.276-.054.235.086.232.18.169.072-.048 2.465-1.683 3.427-2.331.78.16 1.588.246 2.5.246 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
                        </svg>
                        {loading ? '로그인 중...' : '카카오 로그인'}
                    </button>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/signup')}
                            disabled={loading}
                            className="text-gray-600 text-sm hover:text-gray-900 disabled:opacity-50"
                        >
                            처음이신가요? <span className="font-semibold text-blue-600">회원가입</span>
                        </button>
                    </div>
                </div>

                {/* 개발자 안내 */}
                {/*<div className="mt-4 p-4 bg-blue-50 rounded-lg text-xs text-blue-600">*/}
                {/*    <p className="font-semibold mb-1">🔧 개발자 설정 필요:</p>*/}
                {/*    <p>1. 카카오 개발자 센터에서 앱 등록</p>*/}
                {/*    <p>2. JavaScript 키 발급</p>*/}
                {/*    <p>3. 플랫폼 설정 (Web, Android, iOS)</p>*/}
                {/*    <p>4. 코드의 KAKAO_JS_KEY 변경</p>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};
export default LoginPage;