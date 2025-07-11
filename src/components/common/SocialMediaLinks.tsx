import React from "react";
import { FaDiscord, FaInstagram } from "react-icons/fa";

interface SocialMediaLinksProps {
  className?: string;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  className = "",
}) => {
  const socialLinks = [
    {
      name: "Discord",
      url: "https://discord.gg/nexus",
      icon: FaDiscord,
      color: "#7289da",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/nexus",
      icon: FaInstagram,
      color: "#e4405f",
    },
  ];

  return (
    <div className={`social-media-links ${className}`}>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          style={{ "--social-color": link.color } as React.CSSProperties}
          aria-label={`${link.name}로 이동`}
        >
          <link.icon className="social-icon" />
        </a>
      ))}
    </div>
  );
};

export default SocialMediaLinks;
