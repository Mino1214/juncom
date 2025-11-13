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
    // const [step, setStep] = useState(0);

    // const actualWaitingNumber = position ? Math.max(0, position - 500) : null;

    useEffect(() => {
        if (joinedRef.current) return;
        joinedRef.current = true;

        const init = async () => {
            try {
                if (!user?.email) {
                    throw new Error("로그인 정보가 없습니다.");
                }

                // 1) 기존 주문 여부 확인
                const chk = await fetch(`/api/payment/order/check/${user.email}`);
                const chkJson = await chk.json();

                if (chkJson.hasActiveOrder) {
                    setStatus("blocked");
                    setErrorMessage("이미 진행 중인 주문이 있습니다.");
                    return;
                }

                // 2) 재고 확인
                const stockRes = await fetch(`/api/payment/product/${productId}/stock`);
                const stockData = await stockRes.json();

                // 3) 재고 있음 → 바로 주문 생성 (queue X)
                if (stockData.stock > 0) {
                    const buyRes = await fetch(`/api/payment/product/${productId}/quick-purchase`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userName: user.name || "미입력",
                            userEmail: user.email,
                        }),
                    });

                    const buyJson = await buyRes.json();

                    if (!buyJson.success) {
                        throw new Error(buyJson.message || "주문 생성 실패");
                    }

                    setStatus("done");
                    onReady(buyJson.orderId);
                    return;
                }

                // 4) 재고 없음 → queue 등록
                const qRes = await fetch(`/api/payment/queue/init`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId,
                        userName: user.name || "미입력",
                        userEmail: user.email,
                    }),
                });

                const qJson = await qRes.json();
                if (!qJson.success) throw new Error(qJson.message);

                setJobId(qJson.jobId);
                setPosition(qJson.position);
                setStatus("waiting");

            } catch (err) {
                setStatus("failed");
                setErrorMessage(err instanceof Error ? err.message : "오류 발생");
            }
        };

        init();
    }, [productId, user, onReady]);

    // 폴링 (대기열일 때만)
    useEffect(() => {
        if (!jobId || status !== "waiting") return;

        console.log("🔁 큐 폴링 시작", { jobId, status });

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/payment/queue/status/${jobId}`);
                const data = await res.json();

                console.log("📡 queue/status 응답:", data);

                // 대기 상태 → 번호만 업데이트
                if (data.status === "waiting") {
                    setPosition(data.position);
                    return;
                }

                // ✅ ready 또는 completed 면 자동 구매 시도
                if (data.status === "ready" || data.status === "completed") {
                    console.log("✅ 차례 도착, 자동 구매 시도");

                    clearInterval(interval);

                    try {
                        const buyRes = await fetch(`/api/payment/product/${productId}/quick-purchase`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                userName: user?.name || "미입력",
                                userEmail: user?.email,
                            }),
                        });

                        const buyJson = await buyRes.json();
                        console.log("🧾 quick-purchase 응답:", buyJson);

                        if (!buyJson.success) {
                            throw new Error(buyJson.message || "구매 실패");
                        }

                        setStatus("done");
                        onReady(buyJson.orderId);
                    } catch (err) {
                        console.error("💥 자동 구매 실패:", err);
                        setStatus("failed");
                        setErrorMessage("자동 구매 실패");
                    }

                    return;
                }

                // 실패 상태 처리
                if (data.status === "failed") {
                    console.error("⚠️ queue 실패:", data);
                    clearInterval(interval);
                    setStatus("failed");
                    setErrorMessage(data.error || "오류 발생");
                    return;
                }

                // 정의 안 된 status 디버깅
                console.warn("🤔 알 수 없는 status:", data.status);
            } catch (err) {
                console.error("💥 상태 조회 오류:", err);
                clearInterval(interval);
                setStatus("failed");
                setErrorMessage("상태 조회 오류");
            }
        }, 2000);

        pollIntervalRef.current = interval as unknown as number;

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [jobId, status, onReady, productId, user]);

    // UI
    const handleClose = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md text-center shadow-lg">

                {/* 로딩 */}
                {status === "loading" && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">재고 확인 중...</p>
                    </>
                )}

                {/* 대기열 */}
                {status === "waiting" && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>

                        <div className="mb-4">
                            <p className="text-gray-600 text-base mb-2">현재 대기 번호</p>
                            <p className="text-blue-600 text-3xl font-bold">
                                {position !== null ? position : "-"}번
                            </p>
                        </div>

                        <div className="text-gray-600 text-sm space-y-2 mb-4">
                            <p>순서가 되면 자동으로 구매 화면으로 이동합니다.</p>
                            <p>재고 소진 시 즉시 종료됩니다.</p>
                            <p className="text-red-500 font-semibold mt-3">⚠️ 새로고침하면 대기열 초기화</p>
                        </div>

                        <button
                            onClick={handleClose}
                            className="mt-2 w-full bg-gray-200 text-gray-700 py-2 rounded-xl"
                        >
                            취소
                        </button>
                    </>
                )}

                {/* 완료 */}
                {status === "done" && (
                    <>
                        <div className="text-green-500 text-5xl mb-4">✅</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">주문 생성 완료!</h3>
                        <p className="text-gray-600 text-sm">구매 화면으로 이동합니다...</p>
                    </>
                )}

                {/* 오류 */}
                {status === "failed" && (
                    <>
                        <div className="text-red-500 text-5xl mb-4">❌</div>
                        <h3 className="text-lg font-semibold text-red-600 mb-2">오류 발생</h3>
                        <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
                        <button
                            onClick={handleClose}
                            className="w-full bg-red-500 text-white py-2 rounded-xl"
                        >
                            닫기
                        </button>
                    </>
                )}

                {/* 차단됨 */}
                {status === "blocked" && (
                    <>
                        <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-yellow-600 mb-2">진행 중인 주문이 있습니다</h3>
                        <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
                        <button
                            onClick={handleClose}
                            className="w-full bg-yellow-500 text-white py-2 rounded-xl"
                        >
                            확인
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}