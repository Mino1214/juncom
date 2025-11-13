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
    const [jobId, setJobId] = useState<string | null>(null);   // ⭐ 수정: jobId 변수 되살림
    const joinedRef = useRef(false);

    // 단계 애니메이션
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (joinedRef.current) return;
        joinedRef.current = true;

        const initQueueProcess = async () => {
            try {
                if (!user?.employeeId) throw new Error("로그인 정보가 없습니다.");

                // 1) 기존 주문 여부 확인
                const checkRes = await fetch(`https://jimo.world/api/payment/order/check/${user.email}`);
                const checkData = await checkRes.json();

                if (checkData.hasActiveOrder) {
                    setStatus("blocked");
                    return;
                }

                // 2) 대기열 등록
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

                setJobId(data.jobId);      // ⭐ jobId 저장됨
                setPosition(data.position);
                setStatus("waiting");
            } catch (err) {
                console.error("❌ 큐 등록 실패:", err);
                setStatus("failed");
            }
        };

        initQueueProcess();
    }, [productId, user]);

    // 폴링 함수
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

    // ⭐ jobId 변화 감지 → 폴링 시작
    useEffect(() => {
        if (!jobId) return;
        pollStatus(jobId);
    }, [jobId]);

    // 단계별 텍스트 애니메이션
    useEffect(() => {
        if (status !== "waiting") {
            setStep(0);
            return;
        }

        setStep(0);
        const t1 = setTimeout(() => setStep(1), 0);
        const t2 = setTimeout(() => setStep(2), 400);
        const t3 = setTimeout(() => setStep(3), 800);
        const t4 = setTimeout(() => setStep(4), 1200);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [status]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md text-center shadow-lg">

                {status === "waiting" && (
                    <>
                        {step >= 1 && (
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                대기 중...
                            </h3>
                        )}

                        {step >= 2 && (
                            <p className="text-gray-700 mb-2">
                                현재 <strong>{position ?? "-"}</strong>번째입니다.
                            </p>
                        )}

                        {step >= 3 && (
                            <p className="text-gray-500 text-sm mb-4">
                                화면을 켜두면 순서가 될 때 자동으로 결제 화면으로 이동합니다.
                            </p>
                        )}

                        {step >= 4 && (
                            <button
                                onClick={onClose}
                                className="mt-2 w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300"
                            >
                                취소
                            </button>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}
