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
    address_detail?: string;
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
        address: '',
        address_detail: ''
    });



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
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                setUserDetail(data);
                setEditForm({
                    name: data.name,
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    address_detail: data.address_detail || ''
                });
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch user detail:', error);
                setLoading(false);
            }
        };
        fetchUserDetail();
    }, [user, navigate]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressResults, setAddressResults] = useState<any[]>([]);
    const [addressKeyword, setAddressKeyword] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    // 카카오 주소 검색
    // PurchasePage와 동일한 주소 검색 함수
    const handleAddressSearch = async () => {
        if (!addressKeyword.trim()) {
            alert('검색어를 입력하세요');
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://jimo.world/api/address/search?keyword=${encodeURIComponent(addressKeyword)}`
            );
            const data = await response.json();

            if (data.documents && data.documents.length > 0) {
                setAddressResults(data.documents);
            } else {
                alert('검색 결과가 없습니다.');
                setAddressResults([]);
            }
        } catch (error) {
            console.error('Address search error:', error);
            alert('주소 검색 중 오류가 발생했습니다.');
        } finally {
            setIsSearching(false);
        }
    };


    const selectAddress = (addr: any) => {
        let fullAddress = '';

        if (addr.road_address?.address_name) {
            fullAddress = addr.road_address.address_name;
            if (addr.road_address.building_name) {
                fullAddress += ` (${addr.road_address.building_name})`;
            }
        } else if (addr.address_name) {
            fullAddress = addr.address_name;
        } else if (addr.address?.address_name) {
            fullAddress = addr.address.address_name;
        }

        if (!fullAddress) {
            alert('주소 정보를 가져올 수 없습니다.');
            return;
        }

        setEditForm(prev => ({ ...prev, address: fullAddress }));
        setShowAddressModal(false);
        setAddressKeyword('');
        setAddressResults([]);
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
           <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div className="max-w-5xl mx-auto px-6 py-4">
        <button
            onClick={() => window.history.back()} // ✅ 이전 페이지로 이동
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
            <ChevronLeft size={20} />
            <span className="font-medium text-sm">홈으로</span>
        </button>
    </div>
</header>

            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* 프로필 헤더 */}
                <div className="bg-white rounded-2xl p-8 mb-6 border border-gray-100">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={36} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{userDetail.name}</h1>
                            <p className="text-sm text-gray-500">사번: {userDetail.employee_id}</p>
                        </div>
                    </div>
                </div>

                {/* 개인 정보 */}
                <div className="bg-white rounded-2xl p-8 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-900">개인 정보</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium"
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
                                            address: userDetail.address || '',
                                            address_detail: userDetail.address_detail || ''
                                        });
                                    }}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium"
                                >
                                    저장
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* 이름 */}
                        <div className="flex items-start gap-4">
                            <User size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">이름</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium text-sm">{userDetail.name}</p>
                                )}
                            </div>
                        </div>

                        {/* 이메일 */}
                        <div className="flex items-start gap-4">
                            <Mail size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">이메일</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium text-sm break-all">{userDetail.email || '미입력'}</p>
                                )}
                            </div>
                        </div>

                        {/* 연락처 */}
                        <div className="flex items-start gap-4">
                            <Phone size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">연락처</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                        placeholder="010-1234-5678"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium text-sm">{userDetail.phone || '미입력'}</p>
                                )}
                            </div>
                        </div>

                        {/* 주소 */}
                        <div className="flex items-start gap-4">
                            <MapPin size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">배송지 주소</p>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editForm.address}
                                                placeholder="주소 검색 버튼을 클릭하세요"
                                                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50"
                                                readOnly
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowAddressModal(true)}
                                                className="px-4 py-2.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium whitespace-nowrap"
                                            >
                                                주소 검색
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={editForm.address_detail}
                                            onChange={(e) => setEditForm({...editForm, address_detail: e.target.value})}
                                            placeholder="상세주소 입력"
                                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-900 font-medium text-sm">{userDetail.address || '미입력'}</p>
                                        {userDetail.address_detail && (
                                            <p className="text-gray-600 text-sm mt-1">{userDetail.address_detail}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 가입일 */}
                        <div className="flex items-start gap-4">
                            <Calendar size={20} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-2 font-medium">가입일</p>
                                <p className="text-gray-900 font-medium text-sm">
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

                {/* 주소 검색 모달 */}
                {showAddressModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-bold mb-4 text-gray-900">주소 검색</h2>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="도로명 또는 지번 주소 입력"
                                        value={addressKeyword}
                                        onChange={(e) => setAddressKeyword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                                        className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleAddressSearch}
                                        disabled={isSearching}
                                        className="px-6 py-3 bg-brand-600 text-white text-sm rounded-xl hover:bg-brand-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isSearching ? '검색중...' : '검색'}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {addressResults.length === 0 ? (
                                    <p className="text-gray-500 text-center py-12 text-sm">
                                        주소를 검색해주세요
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {addressResults.map((addr, index) => {
                                            const isPlace = addr.address_type === 'PLACE';
                                            const mainAddress = addr.road_address?.address_name || addr.address_name || '';
                                            const subAddress = addr.address?.address_name;
                                            const buildingName = addr.road_address?.building_name || '';
                                            const placeName = addr.place_name || '';
                                            const category = addr.category_name || '';

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => selectAddress(addr)}
                                                    className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-colors"
                                                >
                                                    {isPlace && placeName && (
                                                        <div className="font-semibold text-brand-600 text-sm mb-1">
                                                            📍 {placeName}
                                                        </div>
                                                    )}
                                                    <div className="font-medium text-gray-900 text-sm">
                                                        {mainAddress}
                                                        {buildingName && ` (${buildingName})`}
                                                    </div>
                                                    {subAddress && mainAddress !== subAddress && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            지번: {subAddress}
                                                        </div>
                                                    )}
                                                    {isPlace && category && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {category}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowAddressModal(false);
                                        setAddressKeyword('');
                                        setAddressResults([]);
                                    }}
                                    className="w-full py-3 bg-gray-600 text-white text-sm rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 구매 내역 */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">구매 내역</h2>
                    <div className="text-center py-12">
                        <Package size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">아직 구매 내역이 없습니다.</p>
                    </div>
                </div>

                {/* 회원 탈퇴 버튼 */}
                <div className="mt-8">
                    <button
                        onClick={handleDelete}
                        className="w-full py-4 bg-red-50 text-red-600 text-sm rounded-xl font-semibold hover:bg-red-100 transition-colors border border-red-200"
                    >
                        회원 탈퇴
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyPage;