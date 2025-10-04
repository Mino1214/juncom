const Footer = () => {
    return (
        <footer className="bg-gray-100 border-t text-sm text-gray-600">
            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 왼쪽 영역 */}
                <div>
                    <h2 className="text-lg font-bold mb-3">임직원 복지몰</h2>
                    <div className="space-y-1">
                        <p className="font-semibold">고객센터 정보</p>
                        <p>상담/주문전화: 010-2385-4214</p>
                        <p>상담/주문 이메일: leejj821@naver.com</p>
                        <p>CS 운영시간: 오전 10:00 ~ 오후 6시</p>
                    </div>
                </div>
                {/* 오른쪽 영역 */}
                <div>
                    <div className="mb-4">
                        <a href="#" className="hover:text-black">
                            개인정보처리방침
                        </a>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold">쇼핑몰 기본정보</p>
                        <p>상호명: (IT)전시몰</p>
                        <p>대표자명: 이재준</p>
                        <p>사업자 등록번호: 7968300593</p>
                        <p>통신판매업 신고번호: 2025-고양일산동-0434</p>
                        <p>개인정보보호책임자: 이재준</p>
                        <p className="mt-2">사업장 주소: 경기도 고양시 일산동구 은행마을로 100 (식사동) 301-705</p>
                        <p>대표 전화: 010-2385-4214</p>
                    </div>
                </div>
            </div>
            {/* 하단 카피라이트 */}
            <div className="text-center py-4 border-t text-gray-500 text-xs sm:text-sm">
                © 2025 (IT)전시몰. All rights reserved.
            </div>
        </footer>
    );
};
export default Footer;