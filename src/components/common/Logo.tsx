import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  text?: string;
  to?: string;
  className?: string;
  variant?: "header" | "footer";
  description?: string;
  showIcon?: boolean;
  logoType?: "desktop" | "app";
}

const Logo: React.FC<LogoProps> = ({
  text = "NEXUS",
  to = "/",
  className = "",
  variant = "header",
  description,
  showIcon = true,
  logoType = "desktop",
}) => {
  const logoSrc =
    logoType === "app" ? "/icons/Nexus_app.svg" : "/icons/Nexus.svg";

  if (variant === "footer") {
    return (
      <div className={`footer-logo ${className}`}>
        <h3>
          {showIcon && (
            <object
              data={logoSrc}
              type="image/svg+xml"
              className="logo-icon"
              style={{ width: "24px", height: "24px" }}
              aria-label="Nexus Logo"
            >
              {/* 폴백 텍스트 */}
              <span>Nexus</span>
            </object>
          )}{" "}
          {text}
        </h3>
        {description && <p>{description}</p>}
      </div>
    );
  }

  return (
    <div className={`header-logo ${className}`}>
      <Link to={to} className="logo-link">
        {showIcon && (
          <object
            data={logoSrc}
            type="image/svg+xml"
            className="logo-icon"
            style={{ width: "32px", height: "32px" }}
            aria-label="Nexus Logo"
          >
            {/* 폴백 텍스트 */}
            <span>Nexus</span>
          </object>
        )}
        <span className="logo-text">{text}</span>
      </Link>
    </div>
  );
};

export default Logo;
