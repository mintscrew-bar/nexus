import React from "react";
import { Link } from "react-router-dom";

interface FooterLink {
  readonly text: string;
  readonly url: string;
}

interface FooterSectionProps {
  title: string;
  links: FooterLink[];
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => {
  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{title}</h3>
      <ul className="footer-section-links">
        {links.map((link, index) => (
          <li key={index}>
            <Link to={link.url} className="footer-link">
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterSection;
