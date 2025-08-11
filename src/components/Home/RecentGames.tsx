import { ArrowRight, Gamepad2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

const RecentGames: React.FC = () => {
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentGames = async () => {
      try {
        const response = await apiService.getCustomGames({ limit: 5 });
        setRecentGames(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch recent games:", error);
        setError("최근 내전 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentGames();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8 text-text-muted">
        <div className="spinner w-8 h-8 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
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
  );
};

export default RecentGames;
