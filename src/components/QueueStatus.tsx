import { useState } from "react";

interface QueueStatusProps {
    productId: number;
    onReady?: (orderId: string) => void;
}

export default function QueueStatus({ productId, onReady }: QueueStatusProps) {
    const [status, setStatus] = useState<"idle" | "waiting" | "done" | "failed">("idle");
    const [position, setPosition] = useState<number | null>(null);
    const [, setJobId] = useState<string | null>(null);

    const joinQueue = async () => {
        try {
            setStatus("waiting");
            const res = await fetch("https://jimo.world/api/payment/queue/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            setJobId(data.jobId);
            setPosition(data.position);
            pollStatus(data.jobId);
        } catch (err) {
            console.error(err);
            setStatus("failed");
            alert("대기열 등록에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const pollStatus = async (jobId: string) => {
        const interval = setInterval(async () => {
            const res = await fetch(`https://jimo.world/api/payment/queue/status/${jobId}`);
            const data = await res.json();

            if (data.status === "waiting") {
                setPosition(data.position);
            } else if (data.status === "done") {
                clearInterval(interval);
                setStatus("done");
                if (onReady && data.orderId) onReady(data.orderId);
            } else if (data.status === "failed") {
                clearInterval(interval);
                setStatus("failed");
            }
        }, 2500);
    };

    // 실제 대기 인원 계산 (position - 500)
    const actualWaitingNumber = position ? Math.max(0, position - 500) : null;

    return (
        <div className="mt-4">
            {status === "idle" && (
                <button
                    onClick={joinQueue}
                    className="w-full py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand/90 transition"
                >
                    구매하기
                </button>
            )}
            {status === "waiting" && (
                <div className="w-full py-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                            현재 대기 번호: {actualWaitingNumber ?? "-"}번
                        </p>
                        <p className="text-gray-700 font-medium mb-3">
                            순서가 되면 자동으로 결제 화면으로 이동합니다
                        </p>
                        <div className="px-4">
                            <p className="text-sm text-red-600 font-medium mb-1">
                                ⚠️ 페이지를 새로고침하면 대기열이 초기화되니 주의해 주세요
                            </p>
                            <p className="text-sm text-gray-600">
                                제품은 선착순으로 판매되며, 재고 소진 시 즉시 판매가 종료됩니다
                            </p>
                        </div>
                        <div className="mt-3">
                            <div className="inline-flex items-center gap-1">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {status === "done" && (
                <div className="w-full py-4 bg-green-50 border border-green-300 rounded-xl">
                    <div className="text-center">
                        <p className="text-lg font-bold text-green-700 mb-1">
                            ✅ 대기가 완료되었습니다!
                        </p>
                        <p className="text-sm text-green-600">
                            지금 바로 결제를 진행해주세요
                        </p>
                    </div>
                </div>
            )}
            {status === "failed" && (
                <div className="w-full py-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-center">
                        <p className="text-lg font-bold text-red-600 mb-1">
                            ❌ 오류가 발생했습니다
                        </p>
                        <p className="text-sm text-red-500">
                            대기열 처리 중 문제가 발생했습니다. 다시 시도해주세요.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}