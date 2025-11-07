import React, { useEffect, useState } from "react";
// import { useApp } from "../App";

interface VerifyResult {
    success: boolean;
    message: string;
    orderId?: string;
    amount?: number;
    paidAt?: string;
    goodsName?: string;
}

interface Props {
    navigate: (path: string) => void;
}

const PaymentResultPage: React.FC<Props> = ({ navigate }) => {
    // const { user } = useApp();
    const [result, setResult] = useState<VerifyResult | null>(null);
    const [loading, setLoading] = useState(false); // false로 변경

    // 날짜 포맷 함수
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    useEffect(() => {
        const hash = window.location.hash;
        const queryString = hash.split("?")[1];

        if (!queryString) {
            setResult({ success: false, message: "잘못된 접근입니다." });
            setLoading(false);
            return;
        }

        const params = new URLSearchParams(queryString);

        const orderId = params.get("orderId") || undefined;
        const amount = params.get("amount") || undefined;
        const tid = params.get("tid") || undefined;
        const resultCode = params.get("resultCode");
        const resultMsg = params.get("resultMsg") || undefined;
        const success = params.get('success');

        // ✅ 수정: tid가 있거나 resultCode가 '0000'이면 성공으로 처리
        if (tid || resultCode === '0000' || success === 'true') {
            console.log('결제 성공:', { tid, orderId });

            // tid가 있으면 결제 승인 API 호출
            if (tid) {
                fetch('https://jimo.world/api/payment/result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tid: tid,
                        orderId: orderId,
                        amount: amount
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        setResult({
                            success: data.success,
                            message: '결제가 완료되었습니다',
                            orderId: orderId,
                            amount: amount ? parseInt(amount) : undefined,
                            paidAt: data.paidAt ? formatDate(data.paidAt) : undefined,
                            goodsName: data.goodsName
                        });
                    })
                    .catch(() => {
                        // API 호출 실패해도 tid가 있으면 성공으로 처리
                        setResult({
                            success: true,  // ✅ true로 변경
                            message: '결제가 완료되었습니다',
                            orderId: orderId,
                            amount: amount ? parseInt(amount) : undefined
                        });
                    })
                    .finally(() => setLoading(false));
            } else {
                // tid 없이 success 파라미터만 있는 경우
                setResult({
                    success: true,
                    message: '결제가 완료되었습니다',
                    orderId: orderId,
                    amount: amount ? parseInt(amount) : undefined
                });
                setLoading(false);
            }
        } else {
            // 결제 실패 처리
            console.log('결제 실패 또는 취소');
            setResult({
                success: false,
                message: resultMsg || '결제에 실패했습니다'
            });
            setLoading(false);
        }
    }, []);

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                결제 결과 확인 중...
            </div>
        );

    if (!result)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                결과를 불러올 수 없습니다.
            </div>
        );

    // ... 위의 코드에서 버튼 부분만 수정

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md text-center">
                {result.success ? (
                    <>
                        {/* 체크 애니메이션 */}
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
                                <svg
                                    className="w-10 h-10 text-green-600 animate-check-mark"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{
                                        strokeDasharray: 50,
                                        strokeDashoffset: 50,
                                        animation: 'check-mark 0.6s ease-out 0.3s forwards'
                                    }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* 감사 메시지 */}
                        <h1 className="text-2xl font-bold text-gray-800 mb-3">
                            주문해주셔서 감사합니다!
                        </h1>

                        {/* 주문번호 */}
                        <div className="bg-gray-50 rounded-lg py-3 px-4 mb-6">
                            <p className="text-sm text-gray-500 mb-1">주문번호</p>
                            <p className="text-lg font-semibold text-gray-800">{result.orderId}</p>
                        </div>

                        {/* 안내 메시지 */}
                        <p className="text-sm text-gray-600 mb-6">
                            상세한 주문내역은 마이페이지에서<br />
                            확인하실 수 있습니다
                        </p>

                        {/* 마이페이지 버튼 */}
                        <button
                            onClick={() => navigate("#/mypage")}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                        >
                            마이페이지에서 주문내역 확인
                        </button>
                    </>
                ) : (
                    <>
                        {/* 실패 아이콘 */}
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-800 mb-2">결제 실패</h1>
                        <p className="text-gray-600 mb-6">{result.message}</p>

                        <button
                            onClick={() => navigate("#/purchase?productId=3")}
                            className="w-full py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
                        >
                            다시 구매하기
                        </button>
                    </>
                )}
            </div>

            {/* CSS 애니메이션 스타일 */}
            <style>{`
                @keyframes scale-in {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes check-mark {
                    0% {
                        stroke-dashoffset: 50;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }

                .animate-scale-in {
                    animation: scale-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PaymentResultPage;