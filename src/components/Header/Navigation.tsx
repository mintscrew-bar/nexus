import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAVIGATION_CONFIG } from "../common/config";

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className = "" }) => {
  const location = useLocation();

  return (
    <nav className={`header-nav ${className}`}>
      <ul className="nav-list">
        {NAVIGATION_CONFIG.main.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
