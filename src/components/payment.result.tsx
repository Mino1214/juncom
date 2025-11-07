import React, { useEffect, useState } from "react";
// import { useApp } from "../App";

interface VerifyResult {
    success: boolean;
    message: string;
    orderId?: string;
    amount?: number;
}

interface Props {
    navigate: (path: string) => void;
}

const PaymentResultPage: React.FC<Props> = ({ navigate }) => {
    // const { user } = useApp();
    const [result, setResult] = useState<VerifyResult | null>(null);
    const [loading, setLoading] = useState(false); // false로 변경


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
        // tid가 있으면 성공으로 판단 (resultCode 대신)
        if (tid || success === 'true') {
            // 결제 성공 처리
            console.log('결제 성공:', { tid, orderId });
        } else {
            // 결제 실패 처리
            console.log('결제 실패 또는 취소');
        }
        // 결제 성공 여부 확인
        if (resultCode === '0000' && tid) {
            // 결제 승인 API 호출
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
                        amount: amount ? parseInt(amount) : undefined
                    });
                })
                .catch(() => {
                    setResult({
                        success: false,
                        message: '결제 승인 중 오류가 발생했습니다'
                    });
                })
                .finally(() => setLoading(false));
        } else {
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
                        <h1 className="text-2xl font-bold text-green-600 mb-2">결제 성공</h1>
                        <p className="text-gray-600 mb-4">{result.message}</p>
                        <p className="text-gray-700">주문번호: {result.orderId}</p>
                        <p className="text-gray-700">금액: {result.amount?.toLocaleString()}원</p>

                        <button
                            onClick={() => navigate("/home")}
                            className="mt-6 w-full py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition"
                        >
                            홈으로 돌아가기
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-red-600 mb-2">결제 실패</h1>
                        <p className="text-gray-600">{result.message}</p>

                        <button
                            onClick={() => navigate("/purchase")}
                            className="mt-6 w-full py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
                        >
                            다시 구매하기
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentResultPage;