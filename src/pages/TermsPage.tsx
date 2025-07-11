import React from "react";
import { Link } from "react-router-dom";
import "../styles/TermsPage.css";

const TermsPage: React.FC = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>이용약관</h1>
        <p className="last-updated">최종 업데이트: 2024년 12월 19일</p>

        <section className="terms-section">
          <h2>제1조 (목적)</h2>
          <p>
            본 약관은 NEXUS(이하 "회사")가 제공하는 게임 매칭 서비스(이하
            "서비스")의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항,
            기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="terms-section">
          <h2>제2조 (정의)</h2>
          <ul>
            <li>
              <strong>서비스:</strong> 회사가 제공하는 게임 매칭 및 커뮤니티
              서비스
            </li>
            <li>
              <strong>회원:</strong> 본 약관에 동의하고 회사와 서비스 이용계약을
              체결한 자
            </li>
            <li>
              <strong>게임:</strong> 회원 간의 내전 및 팀 매칭을 위한 게임 활동
            </li>
            <li>
              <strong>내전:</strong> 회원들이 자유롭게 참여할 수 있는 게임 매칭
              시스템
            </li>
            <li>
              <strong>랭킹:</strong> 회원의 게임 실력을 평가하는 점수 시스템
            </li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>제3조 (약관의 효력 및 변경)</h2>
          <p>
            본 약관은 서비스 이용 신청 시 회원이 동의하고, 회사가 승낙함으로써
            효력이 발생합니다.
          </p>
          <p>
            회사는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 서비스
            내 공지사항을 통해 공지합니다. 변경된 약관에 동의하지 않는 경우,
            회원은 서비스 이용을 중단할 수 있습니다.
          </p>
        </section>

        <section className="terms-section">
          <h2>제4조 (서비스 이용)</h2>
          <p>회원은 서비스 이용 시 다음 사항을 준수해야 합니다:</p>
          <ul>
            <li>타인을 비방하거나 모욕하는 행위 금지</li>
            <li>서비스의 정상적인 운영을 방해하는 행위 금지</li>
            <li>불법적인 게임 행위(핵, 버그 악용 등) 금지</li>
            <li>타인의 개인정보를 무단으로 수집, 이용하는 행위 금지</li>
            <li>음란, 폭력적, 불법적인 콘텐츠 게시 금지</li>
            <li>상업적 목적의 광고성 게시물 작성 금지</li>
            <li>타인의 지적재산권을 침해하는 행위 금지</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>제5조 (회원의 의무)</h2>
          <p>회원은 서비스 이용 시 다음 의무를 준수해야 합니다:</p>
          <ul>
            <li>정확한 개인정보 제공 및 유지</li>
            <li>서비스 이용 중 발생한 문제에 대한 신고</li>
            <li>회사의 서비스 개선을 위한 건의사항 제출</li>
            <li>타 회원과의 원활한 소통 및 협력</li>
            <li>본 약관 및 관련 법령 준수</li>
            <li>계정 정보의 안전한 관리</li>
            <li>서비스 이용 중 발생한 모든 책임의 인정</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>제6조 (회사의 의무)</h2>
          <p>회사는 서비스 제공과 관련하여 다음 의무를 수행합니다:</p>
          <ul>
            <li>안정적이고 지속적인 서비스 제공</li>
            <li>회원의 개인정보 보호</li>
            <li>서비스 이용 중 발생한 문제에 대한 신속한 처리</li>
            <li>회원의 건의사항 검토 및 반영</li>
            <li>서비스의 보안 유지</li>
            <li>회원의 권익 보호</li>
            <li>서비스 개선을 위한 지속적인 노력</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>제7조 (서비스 이용 제한)</h2>
          <p>
            회원이 다음 각 호에 해당하는 경우, 회사는 서비스 이용을 제한할 수
            있습니다:
          </p>
          <ul>
            <li>본 약관을 위반한 경우</li>
            <li>타 회원에게 피해를 주는 행위를 한 경우</li>
            <li>서비스의 정상적인 운영을 방해하는 경우</li>
            <li>불법적인 행위를 한 경우</li>
            <li>부정한 방법으로 서비스를 이용한 경우</li>
            <li>회사의 서버에 부하를 일으키는 행위를 한 경우</li>
            <li>타인의 계정을 무단으로 사용한 경우</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>제8조 (서비스 중단 및 변경)</h2>
          <p>회사는 다음의 경우 서비스 제공을 중단할 수 있습니다:</p>
          <ul>
            <li>서비스 점검, 보수, 교체가 필요한 경우</li>
            <li>천재지변, 전쟁, 기타 불가항력적인 사유가 있는 경우</li>
            <li>서비스 이용의 폭주로 정상적인 서비스 제공이 어려운 경우</li>
            <li>기타 회사가 서비스 중단이 필요하다고 판단하는 경우</li>
          </ul>
          <p>
            서비스 중단 시 회사는 사전에 공지하며, 긴급한 경우 사후 공지할 수
            있습니다.
          </p>
        </section>

        <section className="terms-section">
          <h2>제9조 (개인정보 보호)</h2>
          <p>
            회사는 회원의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고
            이를 준수합니다. 개인정보의 수집, 이용, 제공 등에 관한 자세한 내용은
            개인정보처리방침을 참조하시기 바랍니다.
          </p>
        </section>

        <section className="terms-section">
          <h2>제10조 (지적재산권)</h2>
          <p>
            서비스와 관련된 모든 지적재산권은 회사에 귀속됩니다. 회원은 서비스를
            통해 얻은 정보를 회사의 사전 동의 없이 복제, 전송, 출판, 배포, 방송
            기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게
            하여서는 안 됩니다.
          </p>
        </section>

        <section className="terms-section">
          <h2>제11조 (면책조항)</h2>
          <p>
            회사는 천재지변, 전쟁, 기타 불가항력적인 사유로 서비스를 제공할 수
            없는 경우 서비스 제공에 관한 책임이 면제됩니다.
          </p>
          <p>
            회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을
            지지 않습니다.
          </p>
          <p>
            회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여
            책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에
            관하여 책임을 지지 않습니다.
          </p>
        </section>

        <section className="terms-section">
          <h2>제12조 (분쟁해결)</h2>
          <p>
            서비스 이용으로 발생한 분쟁에 대해 회사와 회원은 우선 대화와 협상을
            통해 해결하기 위해 노력합니다.
          </p>
          <p>협상이 원활하지 않을 경우, 관련 법령 및 상관례에 따릅니다.</p>
        </section>

        <section className="terms-section">
          <h2>제13조 (준거법 및 관할법원)</h2>
          <p>
            본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용으로 발생한
            분쟁에 대해서는 회사의 주소지 관할법원에서 해결합니다.
          </p>
        </section>

        <div className="terms-footer">
          <p>
            <strong>시행일자:</strong> 2024년 1월 1일
          </p>
          <p>
            <strong>최종 수정일:</strong> 2024년 12월 19일
          </p>
        </div>

        <div className="terms-actions">
          <Link to="/signup" className="back-to-signup-btn">
            회원가입으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
