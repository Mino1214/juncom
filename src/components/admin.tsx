import React, { useEffect, useState } from "react";
import type { NavigateProps } from "../App.tsx";

export interface AdminProduct {
    id: number;
    name: string;
    price: number;
    stock: number;
    emoji?: string;
    description?: string;
    image_url?: string;
    status?: string;
    release_date?: string;
    is_visible?: boolean;
}

const AdminPage: React.FC<NavigateProps> = ({ navigate }) => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<AdminProduct>>({});
    const [newImage, setNewImage] = useState<File | null>(null);

    const token = localStorage.getItem("token");

    const fetchProducts = async () => {
        try {
            const response = await fetch("https://jimo.world/api/admin/products", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(`서버 오류: ${response.status}`);
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
            setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ✅ 상품 수정 저장 (파일 포함)
    const handleSaveEdit = async (id: number) => {
        const formData = new FormData();
        formData.append("name", editData.name || "");
        formData.append("price", String(editData.price || 0));
        formData.append("stock", String(editData.stock || 0));
        formData.append("description", editData.description || "");
        formData.append("release_date", editData.release_date || "");
        formData.append("is_visible", String(editData.is_visible || false));
        if (newImage) formData.append("image", newImage);

        try {
            const res = await fetch(`https://jimo.world/api/admin/products/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error("상품 수정 실패");
            alert("상품이 수정되었습니다!");
            setEditingId(null);
            setEditData({});
            setNewImage(null);
            fetchProducts();
        } catch (e) {
            console.error(e);
            alert("상품 수정 중 오류 발생");
        }
    };

    if (loading) return <div className="p-4">로딩 중...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold mb-4">🛠 관리자 리모컨</h1>

            {/* 모바일: 카드 뷰 / 데스크톱: 테이블 */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">이미지</th>
                        <th className="p-2 border">이름</th>
                        <th className="p-2 border">가격</th>
                        <th className="p-2 border">재고</th>
                        <th className="p-2 border">설명</th>
                        <th className="p-2 border">출시일</th>
                        <th className="p-2 border">홈노출</th>
                        <th className="p-2 border">관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td className="p-2 border text-center">{p.id}</td>
                            <td className="p-2 border text-center">
                                {editingId === p.id ? (
                                    <div className="flex flex-col items-center">
                                        {newImage ? (
                                            <img src={URL.createObjectURL(newImage)} alt="preview" className="w-16 h-16 object-cover rounded mb-1"/>
                                        ) : p.image_url ? (
                                            <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded mb-1"/>
                                        ) : (
                                            <span className="text-gray-400">없음</span>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}/>
                                    </div>
                                ) : p.image_url ? (
                                    <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded mx-auto"/>
                                ) : ("-")}
                            </td>
                            <td className="p-2 border">
                                {editingId === p.id ? (
                                    <input value={editData.name ?? p.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="border rounded px-2 py-1 w-full"/>
                                ) : (p.name)}
                            </td>
                            <td className="p-2 border text-right">
                                {editingId === p.id ? (
                                    <input type="number" value={editData.price ?? p.price} onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })} className="border rounded px-2 py-1 w-full text-right"/>
                                ) : (`${p.price.toLocaleString()}원`)}
                            </td>
                            <td className="p-2 border text-center">
                                {editingId === p.id ? (
                                    <input type="number" value={editData.stock ?? p.stock} onChange={(e) => setEditData({ ...editData, stock: Number(e.target.value) })} className="border rounded px-2 py-1 w-20 text-center"/>
                                ) : (p.stock)}
                            </td>
                            <td className="p-2 border text-center">
                                {editingId === p.id ? (
                                    <textarea value={editData.description ?? p.description ?? ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="border rounded px-2 py-1 w-60 h-20"/>
                                ) : (
                                    <div className="max-w-[200px] truncate">{p.description || "-"}</div>
                                )}
                            </td>
                            <td className="p-2 border text-center">
                                {editingId === p.id ? (
                                    <input type="datetime-local" value={editData.release_date ?? p.release_date ?? ""} onChange={(e) => setEditData({ ...editData, release_date: e.target.value })} className="border rounded px-2 py-1"/>
                                ) : p.release_date ? (new Date(p.release_date).toLocaleString("ko-KR")) : ("-")}
                            </td>
                            <td className="p-2 border text-center">
                                {editingId === p.id ? (
                                    <input type="checkbox" checked={editData.is_visible ?? p.is_visible ?? false} onChange={(e) => setEditData({ ...editData, is_visible: e.target.checked })}/>
                                ) : p.is_visible ? ("✅") : ("❌")}
                            </td>
                            <td className="p-2 border text-center">
                                {editingId === p.id ? (
                                    <>
                                        <button onClick={() => handleSaveEdit(p.id)} className="text-green-600 hover:underline mr-2">💾 저장</button>
                                        <button onClick={() => { setEditingId(null); setEditData({}); setNewImage(null); }} className="text-gray-500 hover:underline">취소</button>
                                    </>
                                ) : (
                                    <button onClick={() => { setEditingId(p.id); setEditData(p); }} className="text-blue-600 hover:underline">✏️ 수정</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 모바일 카드 뷰 */}
            <div className="md:hidden space-y-4">
                {products.map((p) => (
                    <div key={p.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs text-gray-500">ID: {p.id}</span>
                            {editingId === p.id ? (
                                <div className="flex gap-2">
                                    <button onClick={() => handleSaveEdit(p.id)} className="text-green-600 text-sm">💾 저장</button>
                                    <button onClick={() => { setEditingId(null); setEditData({}); setNewImage(null); }} className="text-gray-500 text-sm">취소</button>
                                </div>
                            ) : (
                                <button onClick={() => { setEditingId(p.id); setEditData(p); }} className="text-blue-600 text-sm">✏️ 수정</button>
                            )}
                        </div>

                        {/* 이미지 */}
                        <div className="mb-3">
                            {editingId === p.id ? (
                                <div className="flex flex-col">
                                    {newImage ? (
                                        <img src={URL.createObjectURL(newImage)} alt="preview" className="w-full h-48 object-cover rounded mb-2"/>
                                    ) : p.image_url ? (
                                        <img src={p.image_url} alt={p.name} className="w-full h-48 object-cover rounded mb-2"/>
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">이미지 없음</div>
                                    )}
                                    <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)} className="text-sm"/>
                                </div>
                            ) : p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-48 object-cover rounded"/>
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">이미지 없음</div>
                            )}
                        </div>

                        {/* 이름 */}
                        <div className="mb-2">
                            <label className="text-xs text-gray-600 block mb-1">상품명</label>
                            {editingId === p.id ? (
                                <input value={editData.name ?? p.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="border rounded px-3 py-2 w-full"/>
                            ) : (
                                <div className="font-semibold">{p.name}</div>
                            )}
                        </div>

                        {/* 가격 & 재고 */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <label className="text-xs text-gray-600 block mb-1">가격</label>
                                {editingId === p.id ? (
                                    <input type="number" value={editData.price ?? p.price} onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })} className="border rounded px-3 py-2 w-full"/>
                                ) : (
                                    <div className="font-medium">{p.price.toLocaleString()}원</div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 block mb-1">재고</label>
                                {editingId === p.id ? (
                                    <input type="number" value={editData.stock ?? p.stock} onChange={(e) => setEditData({ ...editData, stock: Number(e.target.value) })} className="border rounded px-3 py-2 w-full"/>
                                ) : (
                                    <div className="font-medium">{p.stock}개</div>
                                )}
                            </div>
                        </div>

                        {/* 설명 */}
                        <div className="mb-2">
                            <label className="text-xs text-gray-600 block mb-1">설명</label>
                            {editingId === p.id ? (
                                <textarea value={editData.description ?? p.description ?? ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="border rounded px-3 py-2 w-full h-20"/>
                            ) : (
                                <div className="text-sm text-gray-700">{p.description || "-"}</div>
                            )}
                        </div>

                        {/* 출시일 */}
                        <div className="mb-2">
                            <label className="text-xs text-gray-600 block mb-1">출시일</label>
                            {editingId === p.id ? (
                                <input type="datetime-local" value={editData.release_date ?? p.release_date ?? ""} onChange={(e) => setEditData({ ...editData, release_date: e.target.value })} className="border rounded px-3 py-2 w-full"/>
                            ) : (
                                <div className="text-sm">{p.release_date ? new Date(p.release_date).toLocaleString("ko-KR") : "-"}</div>
                            )}
                        </div>

                        {/* 홈노출 */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">홈노출</label>
                            {editingId === p.id ? (
                                <input type="checkbox" checked={editData.is_visible ?? p.is_visible ?? false} onChange={(e) => setEditData({ ...editData, is_visible: e.target.checked })} className="w-5 h-5"/>
                            ) : (
                                <span>{p.is_visible ? "✅" : "❌"}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={() => navigate("/home")} className="mt-6 bg-gray-600 text-white px-4 py-2 rounded w-full md:w-auto">
                ← 홈으로
            </button>
        </div>
    );
};

export default AdminPage;