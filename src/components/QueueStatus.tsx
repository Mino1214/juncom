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
            alert("대기열 등록 실패");
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

    return (
        <div className="mt-4">
            {status === "idle" && (
                <button
                    onClick={joinQueue}
                    className="w-full py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand/90 transition"
                >
                    구매 대기열 등록
                </button>
            )}
            {status === "waiting" && (
                <div className="w-full py-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                    <p className="text-gray-800 font-medium">현재 {position ?? "-"}번째 대기 중...</p>
                    <p className="text-gray-500 text-sm">잠시만 기다려주세요</p>
                </div>
            )}
            {status === "done" && (
                <div className="w-full py-4 bg-green-50 border border-green-300 rounded-xl text-green-700 font-semibold text-center">
                    ✅ 순서가 도착했습니다! 결제 진행 가능
                </div>
            )}
            {status === "failed" && (
                <div className="w-full py-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium text-center">
                    ❌ 대기열 처리 중 오류가 발생했습니다.
                </div>
            )}
        </div>
    );
}