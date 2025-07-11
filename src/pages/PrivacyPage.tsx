import React from "react";
import "../styles/PrivacyPage.css";

const PrivacyPage: React.FC = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>개인정보처리방침</h1>
        <p className="last-updated">최종 업데이트: 2024년 12월 19일</p>

        <section className="privacy-section">
          <h2>1. 개인정보의 처리 목적</h2>
          <p>
            NEXUS는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적
            이외의 용도로는 이용하지 않습니다.
          </p>
          <ul>
            <li>
              <strong>회원 가입 및 관리:</strong> 회원제 서비스 제공, 회원 식별
            </li>
            <li>
              <strong>내전 매칭 및 게임 서비스:</strong> 팀 매칭, 게임 진행,
              전적 기록
            </li>
            <li>
              <strong>커뮤니티 서비스:</strong> 게시판 운영, 댓글 서비스
            </li>
            <li>
              <strong>고객 상담:</strong> 문의 접수, 답변 제공
            </li>
            <li>
              <strong>서비스 개선:</strong> 서비스 이용 통계, 개선사항 반영
            </li>
            <li>
              <strong>마케팅 및 광고:</strong> 신규 서비스 안내, 이벤트 정보
              제공 (선택적)
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>2. 수집하는 개인정보 항목</h2>
          <div className="info-table">
            <h3>필수 수집 항목</h3>
            <ul>
              <li>
                <strong>이메일 주소:</strong> 회원 식별, 서비스 이용
              </li>
              <li>
                <strong>닉네임:</strong> 게임 내 표시, 커뮤니티 활동
              </li>
              <li>
                <strong>비밀번호:</strong> 계정 보안 (암호화 저장)
              </li>
              <li>
                <strong>생년월일:</strong> 만 14세 이상 확인, 연령별 서비스 제공
              </li>
            </ul>

            <h3>선택 수집 항목</h3>
            <ul>
              <li>
                <strong>프로필 이미지:</strong> 커뮤니티 활동
              </li>
              <li>
                <strong>소셜 미디어 연동:</strong> 간편 로그인
              </li>
              <li>
                <strong>게임 선호도:</strong> 맞춤형 매칭
              </li>
              <li>
                <strong>마케팅 수신 동의:</strong> 이벤트 및 서비스 안내
              </li>
            </ul>

            <h3>자동 수집 항목</h3>
            <ul>
              <li>
                <strong>접속 로그:</strong> IP 주소, 쿠키, 서비스 이용 기록
              </li>
              <li>
                <strong>기기 정보:</strong> OS 정보, 브라우저 정보, 디바이스 ID
              </li>
            </ul>
          </div>
        </section>

        <section className="privacy-section">
          <h2>3. 개인정보의 보유 및 이용기간</h2>
          <p>회원 탈퇴 시까지 또는 법정 보유기간</p>
          <ul>
            <li>
              <strong>회원정보:</strong> 회원 탈퇴 시까지
            </li>
            <li>
              <strong>게임 기록:</strong> 회원 탈퇴 후 1년간
            </li>
            <li>
              <strong>문의 기록:</strong> 문의 완료 후 3년간
            </li>
            <li>
              <strong>계약 또는 청약철회 등에 관한 기록:</strong> 5년간
            </li>
            <li>
              <strong>대금결제 및 재화 등의 공급에 관한 기록:</strong> 5년간
            </li>
            <li>
              <strong>소비자의 불만 또는 분쟁처리에 관한 기록:</strong> 3년간
            </li>
            <li>
              <strong>웹사이트 방문기록:</strong> 3개월간
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. 개인정보의 제3자 제공</h2>
          <p>
            NEXUS는 원칙적으로 이용자의 개인정보를 제1조에서 명시한 범위
            내에서만 처리하며, 이용자의 사전 동의 없이는 제3자에게 제공하지
            않습니다.
          </p>
          <p>단, 다음의 경우에는 개인정보를 처리할 수 있습니다:</p>
          <ul>
            <li>이용자가 사전에 제3자 제공에 동의한 경우</li>
            <li>
              법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와
              방법에 따라 수사기관의 요구가 있는 경우
            </li>
            <li>
              이용자 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나
              주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 이용자
              또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고
              인정되는 경우
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. 개인정보의 위탁처리</h2>
          <p>
            NEXUS는 서비스 향상을 위해 개인정보를 외부 전문업체에 위탁하여
            처리하고 있습니다.
          </p>
          <div className="info-table">
            <h3>위탁업체 및 위탁업무</h3>
            <ul>
              <li>
                <strong>클라우드 서비스:</strong> AWS, Google Cloud Platform
                (데이터 저장 및 처리)
              </li>
              <li>
                <strong>결제 서비스:</strong> 토스페이먼츠, 아임포트 (결제 처리)
              </li>
              <li>
                <strong>이메일 서비스:</strong> SendGrid, Mailgun (이메일 발송)
              </li>
              <li>
                <strong>분석 서비스:</strong> Google Analytics (서비스 이용
                분석)
              </li>
            </ul>
          </div>
          <p>
            위탁계약 체결 시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외
            개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에
            대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에
            명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고
            있습니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. 개인정보의 파기</h2>
          <p>
            개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게
            되었을 때에는 지체없이 해당 개인정보를 파기합니다.
          </p>
          <h3>파기방법</h3>
          <ul>
            <li>
              <strong>전자적 파일 형태:</strong> 복구 및 재생이 불가능한
              방법으로 영구 삭제
            </li>
            <li>
              <strong>종이에 출력된 개인정보:</strong> 분쇄기로 분쇄하거나 소각
            </li>
          </ul>
          <h3>파기절차</h3>
          <ul>
            <li>
              <strong>개인정보 보유기간 경과:</strong> 보유기간이 경과한
              개인정보는 별도 분리하여 보관 후 파기
            </li>
            <li>
              <strong>개인정보의 처리 목적 달성:</strong> 처리목적이 달성된
              개인정보는 지체없이 파기
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>7. 이용자의 권리와 행사방법</h2>
          <p>
            이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
          </p>
          <ul>
            <li>
              <strong>개인정보 열람요구:</strong> 자신의 개인정보에 대한 열람을
              요구할 수 있습니다.
            </li>
            <li>
              <strong>정정·삭제 요구:</strong> 개인정보의 정정·삭제를 요구할 수
              있습니다.
            </li>
            <li>
              <strong>처리정지 요구:</strong> 개인정보의 처리정지를 요구할 수
              있습니다.
            </li>
            <li>
              <strong>개인정보의 이전 요구:</strong> 개인정보의 이전을 요구할 수
              있습니다.
            </li>
            <li>
              <strong>개인정보 처리에 대한 동의 철회:</strong> 개인정보 처리에
              대한 동의를 철회할 수 있습니다.
            </li>
          </ul>
          <p>
            위의 권리를 행사하려면 개인정보보호책임자에게 서면, 전화, 전자우편
            등을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이
            조치하겠습니다.
          </p>

          <h3>권리 행사 방법</h3>
          <ul>
            <li>
              <strong>온라인:</strong> 마이페이지 &gt; 개인정보 관리에서 직접
              처리
            </li>
            <li>
              <strong>이메일:</strong> nexuscshelper@gmail.com으로 요청
            </li>
            <li>
              <strong>Discord:</strong> 실시간 채팅을 통한 문의
            </li>
          </ul>

          <h3>권리 행사 시 준수사항</h3>
          <ul>
            <li>
              개인정보 열람, 정정·삭제, 처리정지 요구는 개인정보보호법 제35조,
              제36조, 제37조에 따라 요구할 수 있습니다.
            </li>
            <li>
              개인정보보호법 제35조(개인정보의 열람), 제36조(개인정보의
              정정·삭제), 제37조(개인정보의 처리정지)의 규정에 의한 요구에
              대하여는 지체없이 필요한 조치를 취할 것입니다.
            </li>
            <li>
              개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집
              대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>8. 개인정보의 안전성 확보 조치</h2>
          <p>
            개인정보보호법 제29조에 따라 다음과 같은 안전성 확보 조치를 취하고
            있습니다.
          </p>
          <ul>
            <li>
              <strong>개인정보의 암호화:</strong> 비밀번호는 암호화되어 저장 및
              관리
            </li>
            <li>
              <strong>해킹 등에 대비한 기술적 대책:</strong> 보안프로그램 설치
              및 주기적 갱신
            </li>
            <li>
              <strong>개인정보에 대한 접근 제한:</strong> 접근권한 관리 및
              침입차단시스템 운영
            </li>
            <li>
              <strong>접속기록의 보관:</strong> 최소 6개월 이상 보관, 관리
            </li>
            <li>
              <strong>개인정보의 안전한 전송:</strong> SSL 암호화 통신 사용
            </li>
            <li>
              <strong>개인정보 접근 통제:</strong> 최소 권한 원칙에 따른 접근
              권한 관리
            </li>
            <li>
              <strong>개인정보 취급 직원의 최소화 및 교육:</strong> 개인정보를
              취급하는 직원을 지정하고 담당자에 한정하여 최소화하여 개인정보를
              관리하는 대책을 시행하고 있습니다.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>9. 쿠키(Cookie)의 운용</h2>
          <p>
            NEXUS는 개인화되고 맞춤화된 서비스를 제공하기 위해서 이용자의 정보를
            저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
          </p>
          <h3>쿠키의 사용 목적</h3>
          <ul>
            <li>이용자 선호도 및 관심분야 파악 및 분석</li>
            <li>방문 및 이용횟수 파악</li>
            <li>자동 로그인 기능 제공</li>
            <li>서비스 개선 및 신규 서비스 개발</li>
          </ul>
          <h3>쿠키 설정 거부 방법</h3>
          <p>
            이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서 이용자는
            웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가
            저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도
            있습니다.
          </p>
          <ul>
            <li>
              <strong>Chrome:</strong> 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및
              기타 사이트 데이터
            </li>
            <li>
              <strong>Firefox:</strong> 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및
              사이트 데이터
            </li>
            <li>
              <strong>Safari:</strong> 환경설정 &gt; 개인정보 보호 &gt; 쿠키 및
              웹사이트 데이터
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>10. 개인정보 보호책임자</h2>
          <div className="contact-info">
            <p>
              <strong>개인정보보호책임자</strong>
            </p>
            <ul>
              <li>성명: 김보안</li>
              <li>직책: 개인정보보호책임자</li>
              <li>연락처: nexuscshelper@gmail.com</li>
              <li>Discord: 실시간 채팅</li>
            </ul>
          </div>
          <div className="contact-info">
            <p>
              <strong>개인정보 분쟁조정위원회</strong>
            </p>
            <ul>
              <li>웹사이트: www.privacy.go.kr</li>
              <li>전화: 1833-6972</li>
            </ul>
          </div>
          <div className="contact-info">
            <p>
              <strong>개인정보보호위원회</strong>
            </p>
            <ul>
              <li>웹사이트: www.pipc.go.kr</li>
              <li>전화: 02-2100-2499</li>
            </ul>
          </div>
        </section>

        <section className="privacy-section">
          <h2>11. 개인정보처리방침의 변경</h2>
          <p>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른
            변경내용이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을
            통하여 고지할 것입니다.
          </p>
          <p>
            다만, 개인정보의 수집 및 활용, 제3자 제공 등과 같이 이용자 권리의
            중요한 변경이 있을 경우에는 최소 30일 전에 고지합니다.
          </p>
        </section>

        <section className="privacy-section">
          <h2>12. 개인정보 처리업무 위탁에 관한 사항</h2>
          <p>
            NEXUS는 서비스 향상을 위해 개인정보를 외부 전문업체에 위탁하여
            처리하고 있습니다.
          </p>
          <div className="info-table">
            <h3>위탁업체 및 위탁업무</h3>
            <ul>
              <li>
                <strong>클라우드 서비스:</strong> AWS, Google Cloud Platform
                (데이터 저장 및 처리)
              </li>
              <li>
                <strong>결제 서비스:</strong> 토스페이먼츠, 아임포트 (결제 처리)
              </li>
              <li>
                <strong>이메일 서비스:</strong> SendGrid, Mailgun (이메일 발송)
              </li>
              <li>
                <strong>분석 서비스:</strong> Google Analytics (서비스 이용
                분석)
              </li>
            </ul>
          </div>
          <p>
            위탁계약 체결 시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외
            개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에
            대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에
            명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고
            있습니다.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
