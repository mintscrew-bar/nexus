import React from "react";

const FooterCopyright: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer-copyright">
      <div className="footer-copyright-content">
        <p>&copy; {currentYear} NEXUS. All rights reserved.</p>
        <div className="footer-copyright-links">
          <a href="/privacy">개인정보처리방침</a>
          <a href="/terms">이용약관</a>
          <a href="/contact">문의하기</a>
        </div>
      </div>
    </div>
  );
};

export default FooterCopyright;
