import { ChevronLeft, User, Mail, Phone, MapPin, Calendar, Package } from 'lucide-react';
import { useEffect, useState } from "react";
import { type NavigateProps, useApp } from "../App.tsx";

interface UserDetail {
    id: number;
    employee_id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    kakao_id?: string;
    marketing_agreed: boolean;
    created_at: string;
}

// Daum 주소 검색 타입 정의
declare global {
    interface Window {
        daum: any;
    }
}

const MyPage = ({ navigate }: NavigateProps) => {
    const { user, setUser } = useApp();
    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        // Daum 우편번호 서비스 스크립트 로드
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchUserDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`https://jimo.world/api/user/${user.employeeId}`,{
                    headers: {
                        "Authorization": `Bearer ${token}`, // ✅ 토큰 첨부
                            "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                setUserDetail(data);
                setEditForm({
                    name: data.name,
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || ''
                });
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch user detail:', error);
                setLoading(false);
            }
        };

        fetchUserDetail();
    }, [user, navigate]);

    // 카카오 주소 검색
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function(data: any) {
                // 도로명 주소 우선, 없으면 지번 주소
                const fullAddress = data.roadAddress || data.jibunAddress;
                setEditForm(prev => ({ ...prev, address: fullAddress }));
            }
        }).open();
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://jimo.world/api/user/${user.employeeId}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`, // ✅ 토큰 첨부
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const data = await response.json();
                setUserDetail(data.user);
                setUser({ ...user, name: editForm.name });
                setIsEditing(false);
                alert('정보가 수정되었습니다.');
            } else {
                alert('정보 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('정보 수정 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async () => {
        if (!user) return;

        const confirmed = confirm('정말로 탈퇴하시겠습니까?\n탈퇴 후 모든 정보가 삭제되며 복구할 수 없습니다.');

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://jimo.world/api/user/${user.employeeId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`, // ✅ 토큰 첨부
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                alert('회원 탈퇴가 완료되었습니다.');
                setUser(null);
                navigate('/login');
            } else {
                const data = await response.json();
                alert(data.message || '회원 탈퇴에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('회원 탈퇴 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!userDetail) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">사용자 정보를 찾을 수 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-medium">홈으로</span>
                    </button>
                </div>
            </header>

            <div className="max-w-3xl mx-auto p-4 py-8">
                {/* 프로필 헤더 */}
                <div className="bg-white rounded-2xl p-8 mb-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <User size={40} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{userDetail.name}</h1>
                            <p className="text-gray-500">사번: {userDetail.employee_id}</p>
                        </div>
                    </div>

                    {/*{userDetail.kakao_id && (*/}
                    {/*    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">*/}
                    {/*        카카오 계정 연동됨*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>

                {/* 개인 정보 */}
                <div className="bg-white rounded-2xl p-8 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">개인 정보</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                            >
                                수정하기
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditForm({
                                            name: userDetail.name,
                                            email: userDetail.email || '',
                                            phone: userDetail.phone || '',
                                            address: userDetail.address || ''
                                        });
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                                >
                                    저장
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* 이름 */}
                        <div className="flex items-start gap-4">
                            <User size={20} className="text-gray-400 mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">이름</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{userDetail.name}</p>
                                )}
                            </div>
                        </div>

                        {/* 이메일 */}
                        <div className="flex items-start gap-4">
                            <Mail size={20} className="text-gray-400 mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">이메일</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{userDetail.email || '미입력'}</p>
                                )}
                            </div>
                        </div>

                        {/* 연락처 */}
                        <div className="flex items-start gap-4">
                            <Phone size={20} className="text-gray-400 mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">연락처</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        placeholder="010-1234-5678"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{userDetail.phone || '미입력'}</p>
                                )}
                            </div>
                        </div>

                        {/* 주소 */}
                        <div className="flex items-start gap-4">
                            <MapPin size={20} className="text-gray-400 mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">배송지 주소</p>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editForm.address}
                                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                                placeholder="주소 검색 버튼을 클릭하세요"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                                readOnly
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddressSearch}
                                                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition font-medium whitespace-nowrap"
                                            >
                                                주소 검색
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="상세주소 입력"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-gray-900 font-medium">{userDetail.address || '미입력'}</p>
                                )}
                            </div>
                        </div>

                        {/* 가입일 */}
                        <div className="flex items-start gap-4">
                            <Calendar size={20} className="text-gray-400 mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">가입일</p>
                                <p className="text-gray-900 font-medium">
                                    {new Date(userDetail.created_at).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* 구매 내역 (추후 구현) */}
                <div className="bg-white rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">구매 내역</h2>
                    <div className="text-center py-12">
                        <Package size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">아직 구매 내역이 없습니다.</p>
                    </div>
                </div>

                {/* 회원 탈퇴 버튼 */}
                <div className="mt-8">
                    <button
                        onClick={handleDelete}
                        className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition border border-red-200"
                    >
                        회원 탈퇴
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyPage;