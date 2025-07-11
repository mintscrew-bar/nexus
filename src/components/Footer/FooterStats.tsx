import React from "react";

interface Stat {
  readonly label: string;
  readonly value: string;
}

interface FooterStatsProps {
  stats: Stat[];
}

const FooterStats: React.FC<FooterStatsProps> = ({ stats }) => {
  return (
    <div className="footer-stats">
      <h3 className="footer-stats-title">통계</h3>
      <div className="footer-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="footer-stat-item">
            <div className="footer-stat-value">{stat.value}</div>
            <div className="footer-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FooterStats;
