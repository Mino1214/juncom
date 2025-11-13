import { useEffect, useState, useRef } from "react";
import { useApp } from "../App";

interface QueueModalProps {
    productId: number;
    onReady: (orderId: string) => void;
    onClose: () => void;
}

export default function QueueModal({ productId, onReady, onClose }: QueueModalProps) {
    const { user } = useApp();
    const [status, setStatus] = useState<"loading" | "waiting" | "done" | "failed" | "blocked">("loading");
    const [position, setPosition] = useState<number | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const joinedRef = useRef(false);
    const pollIntervalRef = useRef<number | null>(null);

    // 단계 애니메이션
    const [step, setStep] = useState(0);

    // 실제 대기 번호 계산 (position - 500)
    const actualWaitingNumber = position ? Math.max(0, position - 500) : null;

    useEffect(() => {
        if (joinedRef.current) return;
        joinedRef.current = true;

        const initQueueProcess = async () => {
            try {
                if (!user?.email) {
                    throw new Error("로그인 정보가 없습니다.");
                }

                console.log("👤 사용자 정보:", user);

                // 1) 기존 주문 여부 확인
                const checkRes = await fetch(`https://jimo.world/api/payment/order/check/${user.email}`);

                if (!checkRes.ok) {
                    throw new Error("주문 확인 중 오류가 발생했습니다.");
                }

                const checkData = await checkRes.json();

                if (checkData.hasActiveOrder) {
                    setStatus("blocked");
                    setErrorMessage("이미 진행 중인 주문이 있습니다.");
                    return;
                }

                // 2) 재고 확인
                const stockRes = await fetch(`https://jimo.world/api/payment/product/${productId}/stock`);

                if (!stockRes.ok) {
                    throw new Error("재고 확인 중 오류가 발생했습니다.");
                }

                const stockData = await stockRes.json();

                console.log("📦 재고 상태:", stockData);

                // 3) 재고 있으면 바로 주문 생성
                if (stockData.stock > 0) {
                    console.log("✅ 재고 있음 → 바로 주문 생성");

                    const orderRes = await fetch("https://jimo.world/api/payment/order/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            productId,
                            userName: user.name || "미입력",
                            userEmail: user.email,
                        }),
                    });

                    if (!orderRes.ok) {
                        throw new Error("주문 생성 실패");
                    }

                    const orderData = await orderRes.json();

                    if (!orderData.success || !orderData.orderId) {
                        throw new Error(orderData.message || "주문 생성 실패");
                    }

                    setStatus("done");
                    onReady(orderData.orderId);
                    return;
                }

                // 4) 재고 없으면 대기열 등록
                console.log("⏳ 재고 없음 → 대기열 등록");

                const res = await fetch("https://jimo.world/api/payment/queue/init", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId,
                        userName: user.name || "미입력",
                        userEmail: user.email,
                    }),
                });

                if (!res.ok) {
                    throw new Error("대기열 등록 요청 실패");
                }

                const data = await res.json();

                if (!data.success) {
                    throw new Error(data.message || "대기열 등록 실패");
                }

                console.log("✅ 대기열 등록 성공:", data);

                setJobId(data.jobId);
                setPosition(data.position);
                setStatus("waiting");
            } catch (err) {
                console.error("❌ 큐 등록 실패:", err);
                setStatus("failed");
                setErrorMessage(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
            }
        };

        initQueueProcess();
    }, [productId, user, onReady]);

    // 폴링 함수
    useEffect(() => {
        if (!jobId || status !== "waiting") return;

        console.log("🔄 폴링 시작:", jobId);

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`https://jimo.world/api/payment/queue/status/${jobId}`);

                if (!res.ok) {
                    throw new Error("상태 조회 실패");
                }

                const data = await res.json();

                console.log("📊 폴링 응답:", data);

                if (data.status === "waiting") {
                    setPosition(data.position);
                } else if (data.status === "completed") {
                    clearInterval(interval);
                    setStatus("done");

                    if (data.result?.orderId) {
                        console.log("✅ 주문 생성 완료:", data.result.orderId);
                        onReady(data.result.orderId);
                    } else {
                        throw new Error("주문 ID를 받지 못했습니다.");
                    }
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    setStatus("failed");
                    setErrorMessage(data.error || "주문 생성에 실패했습니다.");
                }
            } catch (err) {
                console.error("❌ 폴링 오류:", err);
                clearInterval(interval);
                setStatus("failed");
                setErrorMessage(err instanceof Error ? err.message : "상태 조회 중 오류가 발생했습니다.");
            }
        }, 2500);

        pollIntervalRef.current = interval;

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [jobId, status, onReady]);

    // 단계별 텍스트 애니메이션
    useEffect(() => {
        if (status !== "waiting") {
            setStep(0);
            return;
        }

        const timeouts = [
            setTimeout(() => setStep(1), 0),
            setTimeout(() => setStep(2), 400),
            setTimeout(() => setStep(3), 800),
            setTimeout(() => setStep(4), 1200),
        ];

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [status]);

    const handleClose = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md text-center shadow-lg">

                {status === "loading" && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">재고 확인 중...</p>
                    </>
                )}

                {status === "waiting" && (
                    <>
                        {step >= 1 && (
                            <>
                                <div className="animate-pulse rounded-full h-12 w-12 bg-blue-100 mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-2xl">⏳</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    대기 중...
                                </h3>
                            </>
                        )}

                        {step >= 2 && (
                            <p className="text-gray-700 mb-2">
                                현재 대기 번호: <strong className="text-blue-600 text-xl">
                                {actualWaitingNumber !== null ? actualWaitingNumber+1 : "-"}번
                            </strong>
                            </p>
                        )}

                        {step >= 3 && (
                            <div className="text-gray-600 text-sm mb-4">
                                <p className="mb-2">
                                    순서가 되면 자동으로 결제 화면으로 이동합니다.
                                </p>
                                <p className="text-gray-600 mt-1">
                                    제품은 선착순으로 판매되며, 재고 소진 시 즉시 판매가 종료됩니다.
                                </p>
                                <p className="text-red-500 font-semibold">
                                    ⚠️ 페이지를 새로고침하면 대기열이 초기화되니 주의해 주세요.
                                </p>
                            </div>
                        )}

                        {step >= 4 && (
                            <button
                                onClick={handleClose}
                                className="mt-2 w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition-colors"
                            >
                                취소
                            </button>
                        )}
                    </>
                )}

                {status === "done" && (
                    <>
                        <div className="text-green-500 text-5xl mb-4">✅</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            주문 생성 완료!
                        </h3>
                        <p className="text-gray-600 text-sm">
                            결제 화면으로 이동합니다...
                        </p>
                    </>
                )}

                {status === "failed" && (
                    <>
                        <div className="text-red-500 text-5xl mb-4">❌</div>
                        <h3 className="text-lg font-semibold text-red-600 mb-2">
                            오류 발생
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            {errorMessage || "알 수 없는 오류가 발생했습니다."}
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition-colors"
                        >
                            닫기
                        </button>
                    </>
                )}

                {status === "blocked" && (
                    <>
                        <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-yellow-600 mb-2">
                            진행 중인 주문이 있습니다
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            {errorMessage || "기존 주문을 완료하거나 취소한 후 다시 시도해주세요."}
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full bg-yellow-500 text-white py-2 rounded-xl hover:bg-yellow-600 transition-colors"
                        >
                            확인
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}