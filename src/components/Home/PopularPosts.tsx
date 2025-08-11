import { ArrowRight, MessageSquare, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

const PopularPosts: React.FC = () => {
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const response = await apiService.getPopularPosts(5);
        setPopularPosts(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch popular posts:", error);
        setError("인기 게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
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
  );
};

export default PopularPosts;
