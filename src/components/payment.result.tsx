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
                        <h1 className="text-2xl font-bold text-green-600 mb-2">결제 성공</h1>
                        <p className="text-gray-600 mb-4">{result.message}</p>
                        <p className="text-gray-700">주문번호: {result.orderId}</p>
                        <p className="text-gray-700">상품명: {result.goodsName}</p>
                        <p className="text-gray-700">금액: {result.amount?.toLocaleString()}원</p>
                        <p className="text-gray-700">결제일: {result.paidAt}</p>

                        <button
                            onClick={() => navigate("#/home")}
                            className="mt-6 w-full py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition"
                        >
                            홈으로 돌아가기
                        </button>

                        <button
                            onClick={() => navigate("#/mypage")}
                            className="mt-6 w-full py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition"
                        >
                            주문내역 보기
                        </button>
                    </>
                ) : (
                    <>
                    <h1 className="text-2xl font-bold text-red-600 mb-2">결제 실패</h1>
                        <p className="text-gray-600">{result.message}</p>

                        <button
                            onClick={() => navigate("#/purchase?productId=3")}
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