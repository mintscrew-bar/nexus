import {
  ArrowRight,
  Gamepad2,
  MessageSquare,
  Plus,
  Star,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";
import { useAppStore } from "../../store/useAppStore";

const HomePage: React.FC = () => {
  const { user } = useAppStore();
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesResponse, postsResponse] = await Promise.all([
          apiService.getCustomGames({ limit: 5 }),
          apiService.getPopularPosts(5),
        ]);

        setRecentGames(Array.isArray(gamesResponse) ? gamesResponse : []);
        setPopularPosts(Array.isArray(postsResponse) ? postsResponse : []);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/custom-games?create=true"
          className="card card-interactive p-6 text-center group"
        >
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Plus className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">내전 생성</h3>
          <p className="text-sm text-text-secondary">
            새로운 내전을 만들어보세요
          </p>
        </Link>

        <Link
          to="/custom-games"
          className="card card-interactive p-6 text-center group"
        >
          <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Gamepad2 className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">내전 참가</h3>
          <p className="text-sm text-text-secondary">
            진행 중인 내전에 참가하세요
          </p>
        </Link>

        <Link
          to="/community"
          className="card card-interactive p-6 text-center group"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Users className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">커뮤니티</h3>
          <p className="text-sm text-text-secondary">
            다른 플레이어들과 소통하세요
          </p>
        </Link>

        <Link
          to="/messages"
          className="card card-interactive p-6 text-center group"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-success-500 to-success-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="text-white" size={24} />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">메시지</h3>
          <p className="text-sm text-text-secondary">친구들과 대화하세요</p>
        </Link>
      </div>

      {/* 최근 내전 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">최근 내전</h2>
          <Link
            to="/custom-games"
            className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
          >
            <span>모두 보기</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(recentGames) && recentGames.length > 0 ? (
            recentGames.map((game) => (
              <Link
                key={game.id}
                to={`/custom-games/${game.id}`}
                className="card card-interactive p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-primary truncate">
                    {game.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      game.status === "recruiting"
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {game.status === "recruiting" ? "모집 중" : "진행 중"}
                  </span>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2">
                  {game.description || "설명이 없습니다."}
                </p>

                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>생성자: {game.creator_nickname}</span>
                  <span>
                    {game.current_players}/{game.max_players}명
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-text-muted">
              <Gamepad2 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">아직 내전이 없습니다</p>
              <p className="text-sm mt-2">첫 번째 내전을 만들어보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* 인기 게시글 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">인기 게시글</h2>
          <Link
            to="/community"
            className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
          >
            <span>모두 보기</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(popularPosts) && popularPosts.length > 0 ? (
            popularPosts.map((post) => (
              <Link
                key={post.id}
                to={`/community/posts/${post.id}`}
                className="card card-interactive p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-primary line-clamp-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-text-muted">
                    <div className="flex items-center space-x-1">
                      <Star size={12} className="text-accent" />
                      <span>{post.like_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare size={12} />
                      <span>{post.comment_count}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2">
                  {post.content}
                </p>

                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>작성자: {post.nexus_nickname}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-text-muted">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">아직 게시글이 없습니다</p>
              <p className="text-sm mt-2">첫 번째 게시글을 작성해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
