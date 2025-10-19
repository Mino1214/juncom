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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ✅ 해시 라우터에서 쿼리 파라미터 읽기
        const hash = window.location.hash;
        const queryString = hash.split("?")[1];
        const params = new URLSearchParams(queryString);

        const token = params.get("token");
        const mobileCd = params.get("mobileCd");

        if (!token) {
            setResult({ success: false, message: "잘못된 접근입니다." });
            setLoading(false);
            return;
        }

        const verifyPayment = async () => {
            try {
                const res = await fetch(
                    `https://jimo.world/api/payment/result?token=${token}&mobileCd=${mobileCd}`,
                    { method: "GET" }
                );
                const data = await res.json();
                setResult(data);
            } catch (e) {
                console.error(e);
                setResult({ success: false, message: "결제 검증 중 오류가 발생했습니다." });
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md text-center">
                {result.success ? (
                    <>
                        <h1 className="text-2xl font-bold text-green-600 mb-2">결제 성공</h1>
                        <p className="text-gray-600 mb-4">{result.message}</p>
                        <p className="text-gray-700">주문번호: {result.orderId}</p>
                        <p className="text-gray-700">금액: {result.amount?.toLocaleString()}원</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-red-600 mb-2">결제 실패</h1>
                        <p className="text-gray-600">{result.message}</p>
                    </>
                )}

                <button
                    onClick={() => navigate("/home")}
                    className="mt-6 w-full py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition"
                >
                    홈으로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default PaymentResultPage;