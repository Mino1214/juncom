const Footer = () => {
    return (
        <footer className="hidden md:block bg-gray-100 border-t text-sm text-gray-600">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-3 gap-12">
                    {/* 왼쪽: 회사 정보 */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">임직원 복지몰</h2>
                        <div className="space-y-2 text-gray-600">
                            <p className="font-semibold text-gray-800">고객센터</p>
                            <p>상담/주문: 010-2385-4214</p>
                            <p>이메일: leejj821@naver.com</p>
                            <p className="text-xs text-gray-500 mt-3">
                                운영시간: 평일 10:00 ~ 18:00<br />
                                (주말 및 공휴일 휴무)
                            </p>
                        </div>
                    </div>

                    {/* 중앙: 사업자 정보 */}
                    <div>
                        <p className="font-semibold text-gray-800 mb-4">사업자 정보</p>
                        <div className="space-y-1.5 text-gray-600">
                            <p>상호명: 준컴</p>
                            <p>대표자: 이재준</p>
                            <p>사업자등록번호: 412-31-01230</p>
                            <p>통신판매업: 2023-고양일산동-2893</p>
                            <p className="pt-2 border-t border-gray-300 mt-3">개인정보보호책임자: 이재준</p>
                        </div>
                    </div>

                    {/* 오른쪽: 주소 및 링크 */}
                    <div>
                        <p className="font-semibold text-gray-800 mb-4">찾아오시는 길</p>
                        <div className="space-y-1.5 text-gray-600">
                            <p>경기도 고양시 일산동구</p>
                            <p>정발산로 43-7 (메리트윈빌딩)</p>
                            <p>201</p>
                            <p className="pt-3">대표 전화: 010-2385-4214</p>
                        </div>
                        <div className="mt-6">
                            <a
                                href="/privacy"
                                className="text-blue-600 hover:text-blue-800 font-medium underline"
                            >
                                개인정보처리방침
                            </a>
                        </div>
                    </div>
                </div>

                {/* 중요 안내사항 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                    <p className="text-sm text-blue-900 leading-relaxed">
                        <span className="font-semibold">안내:</span> 모든 거래에 대한 책임과 배송, 교환, 환불 민원 등의 처리는
                        <span className="font-bold text-blue-700"> 준컴</span>에서 진행합니다.
                        문의사항은 고객센터(010-2385-4214)로 연락 주시기 바랍니다.
                    </p>
                </div>

                {/* 구분선 */}
                <div className="border-t border-gray-300 mt-10 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-500">
                            © 2025 준컴. All rights reserved.
                        </p>
                        <div className="flex gap-4 text-xs text-gray-500">
                            <a href="/terms" className="hover:text-gray-800">이용약관</a>
                            <span>|</span>
                            <a href="#/privacy" className="hover:text-gray-800">개인정보처리방침</a>
                            <span>|</span>
                            <a href="/guide" className="hover:text-gray-800">이용안내</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;