import React from "react";
import { FaBlog, FaDiscord, FaYoutube } from "react-icons/fa";
import "../../styles/footer.css";
import Logo from "../common/Logo";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${className}`}>
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <Logo
              text="NEXUS"
              to="/"
              variant="footer"
              showIcon={true}
              description="리그 오브 레전드 내전 플랫폼"
            />
            <div className="footer-social">
              <a
                href="https://discord.gg/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaDiscord />
              </a>
              <a
                href="https://youtube.com/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaYoutube />
              </a>
              <a
                href="https://blog.nexus.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaBlog />
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>서비스</h4>
            <ul>
              <li>
                <a href="/">내전 목록</a>
              </li>
              <li>
                <a href="/battles">내전 참가</a>
              </li>
              <li>
                <a href="/create">내전 모집</a>
              </li>
              <li>
                <a href="/ranking">랭킹</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>커뮤니티</h4>
            <ul>
              <li>
                <a href="/community">자유게시판</a>
              </li>
              <li>
                <a href="/users">유저 DB</a>
              </li>
              <li>
                <a href="/friends">친구 목록</a>
              </li>
              <li>
                <a href="/history">전적 기록</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>고객지원</h4>
            <ul>
              <li>
                <a href="/contact">문의하기</a>
              </li>
              <li>
                <a href="/faq">FAQ</a>
              </li>
              <li>
                <a href="/terms">이용약관</a>
              </li>
              <li>
                <a href="/privacy">개인정보처리방침</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} NEXUS. All rights reserved.</p>
          <div className="footer-links">
            <a href="/privacy">개인정보처리방침</a>
            <a href="/terms">이용약관</a>
            <a href="/contact">문의하기</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
