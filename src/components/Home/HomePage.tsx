import React from "react";
import PopularPosts from "./PopularPosts";
import QuickActions from "./QuickActions";
import RecentGames from "./RecentGames";

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-text-primary">
          NEXUS에 오신 것을 환영합니다
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          League of Legends 커뮤니티에서 함께 게임하고 소통하세요
        </p>
      </div>

      {/* 빠른 액션 */}
      <QuickActions />

      {/* 최근 내전 */}
      <RecentGames />

      {/* 인기 게시글 */}
      <PopularPosts />
    </div>
  );
};

export default HomePage;