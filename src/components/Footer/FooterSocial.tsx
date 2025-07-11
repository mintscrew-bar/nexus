import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../common/config";

const FooterSocial: React.FC = () => {
  const socialLinks = [
    { name: "Discord", url: "https://discord.gg/nexus", icon: "🎮" },
    { name: "YouTube", url: "https://youtube.com/nexus", icon: "📺" },
    { name: "Twitter", url: "https://twitter.com/nexus", icon: "🐦" },
  ];
  const navigate = useNavigate();

  const handleQuickMatchClick = () => {
    navigate(ROUTES.BATTLES);
  };

  return (
    <div className="footer-social">
      <h3 className="footer-social-title">소셜 미디어</h3>
      <div className="footer-social-links">
        <button
          className="social-link"
          type="button"
          onClick={handleQuickMatchClick}
          title="빠른 매칭"
        >
          <span className="footer-social-icon">⚡</span>
          <span className="footer-social-name">빠른 매칭</span>
        </button>
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title={social.name}
          >
            <span className="footer-social-icon">{social.icon}</span>
            <span className="footer-social-name">{social.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FooterSocial;
