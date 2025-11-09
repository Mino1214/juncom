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
    const [, setJobId] = useState<string | null>(null);
    const joinedRef = useRef(false);

    useEffect(() => {
        if (joinedRef.current) return;
        joinedRef.current = true;

        const initQueueProcess = async () => {
            try {
                if (!user?.employeeId) throw new Error("로그인 정보가 없습니다.");

                // ✅ 1️⃣ 주문 여부 사전 확인
                const checkRes = await fetch(`https://jimo.world/api/payment/order/check/${user.employeeId}`);
                const checkData = await checkRes.json();

                if (checkData.hasActiveOrder) {
                    // 이미 주문 있음 (취소 제외)
                    setStatus("blocked");
                    return;
                }

                // ✅ 2️⃣ 대기열 등록
                const res = await fetch("https://jimo.world/api/payment/queue/init", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId,
                        employeeId: user.employeeId,
                    }),
                });

                const data = await res.json();
                if (!data.success) throw new Error(data.message || "대기열 등록 실패");

                setJobId(data.jobId);
                setPosition(data.position);
                setStatus("waiting");

                pollStatus(data.jobId);
            } catch (err) {
                console.error("❌ 큐 등록 실패:", err);
                setStatus("failed");
            }
        };

        initQueueProcess();
    }, [productId, user]);

    // ✅ 상태 폴링
    const pollStatus = (jobId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`https://jimo.world/api/payment/queue/status/${jobId}`);
                const data = await res.json();

                if (data.status === "waiting") {
                    setPosition(data.position);
                } else if (data.status === "done") {
                    clearInterval(interval);
                    setStatus("done");
                    if (onReady && data.result?.orderId) onReady(data.result.orderId);
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    setStatus("failed");
                }
            } catch {
                clearInterval(interval);
                setStatus("failed");
            }
        }, 2500);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md text-center shadow-lg">
                {status === "loading" && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">대기열 등록 중...</h3>
                        <p className="text-gray-500">잠시만 기다려주세요</p>
                    </>
                )}
                {status === "waiting" && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">⏳ 대기 중...</h3>
                        <p className="text-gray-700 mb-2">
                            현재 <strong>{position ?? "-"}</strong>번째 순서입니다.
                        </p>
                        <p className="text-gray-500 text-sm mb-4">순서가 되면 자동으로 이동합니다.</p>
                        <button
                            onClick={onClose}
                            className="mt-2 w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300"
                        >
                            취소
                        </button>
                    </>
                )}
                {status === "blocked" && (
                    <>
                        <h3 className="text-lg font-semibold text-red-600 mb-2">⚠️ 주문 제한</h3>
                        <p className="text-gray-600 mb-4">이미 주문 내역이 있습니다. 한 번만 주문 가능합니다.</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300"
                        >
                            닫기
                        </button>
                    </>
                )}
                {status === "done" && (
                    <>
                        <h3 className="text-lg font-semibold text-green-600 mb-2">✅ 순서 도착!</h3>
                        <p className="text-gray-600">결제 페이지로 이동 중입니다...</p>
                    </>
                )}
                {status === "failed" && (
                    <>
                        <h3 className="text-lg font-semibold text-red-600 mb-2">❌ 오류 발생</h3>
                        <p className="text-gray-500 mb-4">대기열 등록에 실패했습니다.</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300"
                        >
                            닫기
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}