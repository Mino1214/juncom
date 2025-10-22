import { useState, useEffect } from "react";
import { type NavigateProps } from "../App.tsx";

const ResetPasswordPage = ({ navigate }: NavigateProps) => {
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [timer, setTimer] = useState(0);
    const [verificationToken, setVerificationToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 이메일 유효성 (회사 이메일만)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@kr\.kpmg\.com$/;

    // 타이머
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // 인증번호 발송
    const handleSendCode = async () => {
        if (!emailPattern.test(email)) {
            alert("이메일은 @kr.kpmg.com 형식만 가능합니다.");
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch("https://jimo.world/api/send-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                alert("인증번호가 이메일로 발송되었습니다.");
                setIsCodeSent(true);
                setTimer(300);
            } else {
                alert(data.message || "인증번호 발송 실패");
            }
        } catch (err) {
            console.error(err);
            alert("인증번호 발송 중 오류가 발생했습니다.");
        } finally {
            setIsSending(false);
        }
    };

    // 인증번호 확인
    const handleVerifyCode = async () => {
        if (!verificationCode) {
            alert("인증번호를 입력해주세요.");
            return;
        }

        setIsVerifying(true);
        try {
            const response = await fetch("https://jimo.world/api/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: verificationCode })
            });
            const data = await response.json();
            if (response.ok) {
                alert("이메일 인증이 완료되었습니다!");
                setIsVerified(true);
                setVerificationToken(data.verificationToken);
                setTimer(0);
            } else {
                alert(data.message || "인증번호가 일치하지 않습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("인증 확인 중 오류가 발생했습니다.");
        } finally {
            setIsVerifying(false);
        }
    };

    // 비밀번호 재설정
    const handleResetPassword = async () => {
        if (newPassword.length < 8) {
            alert("비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("https://jimo.world/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    newPassword,
                    verificationToken
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert("비밀번호가 성공적으로 변경되었습니다!");
                navigate("/login");
            } else {
                alert(data.message || "비밀번호 변경 실패");
            }
        } catch (err) {
            console.error(err);
            alert("비밀번호 변경 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-md transition-all duration-500">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">비밀번호 재설정</h1>

                {/* ✅ STEP 1: 이메일 인증 */}
                {!isVerified && (
                    <div className="space-y-5 transition-all duration-500">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">회사 이메일 *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@kr.kpmg.com"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                            />
                        </div>

                        <button
                            onClick={handleSendCode}
                            disabled={isSending || !email}
                            className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition disabled:bg-gray-300"
                        >
                            {isSending ? "발송 중..." : isCodeSent ? "인증번호 재발송" : "인증번호 발송"}
                        </button>

                        {isCodeSent && (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="인증번호 6자리"
                                        maxLength={6}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                                    />
                                    <button
                                        onClick={handleVerifyCode}
                                        disabled={isVerifying}
                                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
                                    >
                                        {isVerifying ? "확인 중..." : "인증"}
                                    </button>
                                </div>
                                {timer > 0 && (
                                    <p className="text-sm text-red-600 text-center">
                                        남은 시간: {formatTimer(timer)}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ✅ STEP 2: 새 비밀번호 입력 (인증 완료 후) */}
                {isVerified && (
                    <div className="space-y-5 animate-fade-in transition-all duration-700">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                새 비밀번호 *
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="8자 이상 입력"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                새 비밀번호 확인 *
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="비밀번호를 다시 입력하세요"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                            />
                        </div>

                        <button
                            onClick={handleResetPassword}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition disabled:bg-gray-300"
                        >
                            {isSubmitting ? "변경 중..." : "비밀번호 변경"}
                        </button>
                    </div>
                )}

                <button
                    onClick={() => navigate("/login")}
                    className="mt-8 w-full text-gray-500 hover:text-gray-700 text-sm underline"
                >
                    로그인 페이지로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default ResetPasswordPage;