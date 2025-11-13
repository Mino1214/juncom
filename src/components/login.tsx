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
    const [email, setEmail] = useState('');
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
                // console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
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
            const response = await fetch('https://jimo.world/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json(); // ✅ 딱 한 번만 호출

            if (response.ok) {
                // console.log("✅ 서버 응답:", data);
                const { token, user } = data;

                if (!token || !user) {
                    throw new Error("서버 응답 형식이 올바르지 않습니다.");
                }

                // ✅ 토큰 및 사용자 정보 로컬에 저장
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                // ✅ 전역 상태(AppContext)에 반영
                setUser({
                    name: user.name,
                    email: user.email,
                    employeeId: user.employeeId
                });

                // ✅ 로그인 후 홈으로 이동
                navigate('/home');
            }
            else if (response.status === 404) {
                setError('등록되지 않은 이메일입니다. 회원가입을 진행해주세요.');
                setTimeout(() => {
                    navigate(`/signup?email=${encodeURIComponent(email)}`);
                }, 1500);
            }
            else {
                setError(data.message || '로그인에 실패했습니다.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // const handleKakaoLogin = async (): Promise<void> => {
    //     if (!window.Kakao || !window.Kakao.isInitialized()) {
    //         setError('카카오 SDK가 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.');
    //         return;
    //     }
    //
    //     setLoading(true);
    //     setError('');
    //
    //     try {
    //         // 카카오 로그인 실행
    //         // 모바일: 카카오톡 앱으로 전환
    //         // PC: 카카오 로그인 팝업
    //         window.Kakao.Auth.login({
    //             success: async (authObj: any) => {
    //                 console.log('카카오 로그인 성공:', authObj);
    //
    //                 // 사용자 정보 가져오기
    //                 window.Kakao.API.request({
    //                     url: '/v2/user/me',
    //                     success: async (response: any) => {
    //                         console.log('사용자 정보:', response);
    //
    //                         const kakaoId = response.id;
    //                         const kakaoName = response.kakao_account?.profile?.nickname || '';
    //                         const kakaoEmail = response.kakao_account?.email || '';
    //
    //                         // 백엔드로 카카오 정보 전송하여 회원 확인
    //                         try {
    //                             const apiResponse = await fetch('https://jimo.world/api/auth/kakao', {
    //                                 method: 'POST',
    //                                 headers: {
    //                                     'Content-Type': 'application/json',
    //                                 },
    //                                 body: JSON.stringify({
    //                                     kakaoId: kakaoId.toString(),
    //                                     accessToken: authObj.access_token,
    //                                     name: kakaoName,
    //                                     email: kakaoEmail
    //                                 })
    //                             });
    //
    //                             const data = await apiResponse.json();
    //
    //                             // ✅ 기존 회원 - 토큰/유저 정보 저장
    //                             const { token, user } = data;
    //                             if (token && user) {
    //                                 localStorage.setItem("token", token);
    //                                 localStorage.setItem("user", JSON.stringify(user));
    //                                 setUser({
    //                                     name: user.name,
    //                                     employeeId: user.employeeId
    //                                 });
    //                                 navigate("/home");
    //                             } else if (apiResponse.ok && !data.isRegistered) {
    //                                 // 신규 회원 - 가입 페이지로 이동
    //                                 navigate(`/signup?kakaoId=${kakaoId}&name=${encodeURIComponent(kakaoName)}&email=${encodeURIComponent(kakaoEmail)}`);
    //                             } else {
    //                                 setError('카카오 로그인에 실패했습니다.');
    //                                 setLoading(false);
    //                             }
    //                         } catch (err) {
    //                             console.error('Backend API error:', err);
    //                             setError('서버 연결에 실패했습니다.');
    //                             setLoading(false);
    //                         }
    //                     },
    //                     fail: (error: any) => {
    //                         console.error('사용자 정보 가져오기 실패:', error);
    //                         setError('사용자 정보를 가져오는데 실패했습니다.');
    //                         setLoading(false);
    //                     }
    //                 });
    //             },
    //             fail: (err: any) => {
    //                 console.error('카카오 로그인 실패:', err);
    //                 setError('카카오 로그인을 취소하셨거나 실패했습니다.');
    //                 setLoading(false);
    //             }
    //         });
    //     } catch (err) {
    //         console.error('Kakao login error:', err);
    //         setError('카카오 로그인 중 오류가 발생했습니다.');
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img
                        src="/KPMG_logo.png"
                        alt="KPMG Logo"
                        className="w-32 mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">임직원 전용 판매 페이지</h1>
                    <p className="text-gray-600">이메일로 로그인해주세요</p>
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
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
                                disabled={loading}
                                className="w-full px-4 py-4 bg-gray-50 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition disabled:opacity-50"
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
                                className="w-full px-4 py-4 bg-gray-50 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition disabled:opacity-50"
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            disabled={!email || !password || loading}
                            className="w-full py-4 bg-brand-600 text-white rounded-xl font-semibold text-base disabled:bg-gray-200 disabled:text-gray-400 transition hover:bg-brand-700"
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
                    {/*<button*/}
                    {/*    onClick={handleKakaoLogin}*/}
                    {/*    disabled={loading}*/}
                    {/*    className="w-full py-4 bg-[#FEE500] text-gray-900 rounded-xl font-semibold text-base transition hover:bg-[#fddc00] flex items-center justify-center gap-2 disabled:opacity-50"*/}
                    {/*>*/}
                    {/*    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">*/}
                    {/*        <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.442 1.443 4.615 3.686 6.09-.192.786-.75 3.09-.793 3.276-.054.235.086.232.18.169.072-.048 2.465-1.683 3.427-2.331.78.16 1.588.246 2.5.246 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>*/}
                    {/*    </svg>*/}
                    {/*    {loading ? '로그인 중...' : '카카오 로그인'}*/}
                    {/*</button>*/}

                    <div className="mt-6 text-center flex items-center justify-center gap-4">
                        {/* 회원가입 버튼 */}
                        <button
                            onClick={() => navigate('/signup')}
                            disabled={loading}
                            className="text-gray-600 text-sm hover:text-gray-900 disabled:opacity-50"
                        >
                            처음이신가요?{" "}
                            <span className="font-semibold text-brand-600">회원가입</span>
                        </button>

                        {/* 구분선 */}
                        <span className="text-gray-300">|</span>

                        {/* 비밀번호 찾기 버튼 */}
                        <button
                            onClick={() => navigate('#/reset-password')}
                            disabled={loading}
                            className="text-gray-600 text-sm hover:text-gray-900 disabled:opacity-50"
                        >
                            비밀번호 찾기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LoginPage;