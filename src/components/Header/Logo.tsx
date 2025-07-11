import React from "react";
import { Link } from "react-router-dom";

interface HeaderLogoProps {
  text?: string;
  to?: string;
  className?: string;
}

const HeaderLogo: React.FC<HeaderLogoProps> = ({
  text = "NEXUS",
  to = "/",
  className = "",
}) => {
  return (
    <div className={`header-logo ${className}`}>
      <Link to={to}>
        <h1>{text}</h1>
      </Link>
    </div>
  );
};

export default HeaderLogo;
