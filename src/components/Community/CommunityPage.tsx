import {
  Eye,
  Filter,
  MessageSquare,
  Plus,
  Search,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiService, { CommunityPost } from "../../services/api";
import { useAppStore } from "../../store/useAppStore";

const CommunityPage: React.FC = () => {
  const { user } = useAppStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const categories = [
    { value: "all", label: "전체" },
    { value: "general", label: "일반" },
    { value: "strategy", label: "전략" },
    { value: "humor", label: "유머" },
    { value: "news", label: "소식" },
    { value: "question", label: "질문" },
  ];

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await apiService.getCommunityPosts(params);
      setPosts(response);
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId: number) => {
    try {
      await apiService.likePost(postId);
      fetchPosts(); // 목록 새로고침
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  const handleDislike = async (postId: number) => {
    try {
      await apiService.dislikePost(postId);
      fetchPosts(); // 목록 새로고침
    } catch (error) {
      console.error("싫어요 실패:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nexus-dark flex items-center justify-center">
        <div className="text-nexus-white">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexus-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-nexus-white mb-2">
              커뮤니티
            </h1>
            <p className="text-nexus-gray">
              게임 전략을 공유하고 재미있는 이야기를 나누세요
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-nexus-blue text-white font-medium rounded-lg hover:bg-nexus-blue-dark transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>게시글 작성</span>
            </button>
          )}
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-nexus-darker rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 카테고리 필터 */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-nexus-gray" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-nexus-dark border border-nexus-gray/20 rounded-lg px-4 py-2 text-nexus-white focus:outline-none focus:ring-2 focus:ring-nexus-blue"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 검색 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-nexus-gray" />
              <input
                type="text"
                placeholder="게시글 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-nexus-dark border border-nexus-gray/20 rounded-lg text-nexus-white placeholder-nexus-gray focus:outline-none focus:ring-2 focus:ring-nexus-blue"
              />
            </div>
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-nexus-darker rounded-lg p-6 border border-nexus-gray/20 hover:border-nexus-blue/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-nexus-gray rounded-full flex items-center justify-center">
                      <span className="text-nexus-white font-medium">
                        {post.is_anonymous
                          ? "익명"
                          : post.nexus_nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-nexus-white font-medium">
                          {post.is_anonymous ? "익명" : post.nexus_nickname}
                        </span>
                        <span className="px-2 py-1 bg-nexus-blue/20 text-nexus-blue rounded text-xs">
                          {categories.find((c) => c.value === post.category)
                            ?.label || post.category}
                        </span>
                      </div>
                      <span className="text-xs text-nexus-gray">
                        {formatTimeAgo(post.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link to={`/community/post/${post.id}`}>
                  <h3 className="text-xl font-semibold text-nexus-white mb-3 hover:text-nexus-blue transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-nexus-gray mb-4 line-clamp-3">
                    {post.content}
                  </p>
                </Link>

                {/* 태그 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-nexus-gray/20 text-nexus-gray rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-1 text-nexus-gray hover:text-nexus-blue transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{post.like_count}</span>
                    </button>
                    <button
                      onClick={() => handleDislike(post.id)}
                      className="flex items-center space-x-1 text-nexus-gray hover:text-red-400 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm">{post.dislike_count}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-nexus-gray">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{post.comment_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-nexus-gray">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{post.view_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-nexus-gray mb-4">
                <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">게시글이 없습니다</p>
                <p className="text-sm">첫 번째 게시글을 작성해보세요!</p>
              </div>
              {user && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-nexus-blue text-white font-medium rounded-lg hover:bg-nexus-blue-dark transition-colors"
                >
                  게시글 작성하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 게시글 작성 모달 */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
};

// 게시글 작성 모달 컴포넌트
interface CreatePostModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      await apiService.createCommunityPost({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: tags.length > 0 ? tags : undefined,
        isAnonymous: formData.isAnonymous,
      });

      onSuccess();
    } catch (error) {
      console.error("게시글 작성 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-nexus-darker rounded-lg p-6 w-full max-w-2xl mx-4">
        <h2 className="text-2xl font-bold text-nexus-white mb-6">
          게시글 작성
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nexus-gray mb-2">
              제목
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 bg-nexus-dark border border-nexus-gray/20 rounded-lg text-nexus-white focus:outline-none focus:ring-2 focus:ring-nexus-blue"
              placeholder="제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-nexus-gray mb-2">
              카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 bg-nexus-dark border border-nexus-gray/20 rounded-lg text-nexus-white focus:outline-none focus:ring-2 focus:ring-nexus-blue"
            >
              <option value="general">일반</option>
              <option value="strategy">전략</option>
              <option value="humor">유머</option>
              <option value="news">소식</option>
              <option value="question">질문</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-nexus-gray mb-2">
              내용
            </label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-4 py-2 bg-nexus-dark border border-nexus-gray/20 rounded-lg text-nexus-white focus:outline-none focus:ring-2 focus:ring-nexus-blue resize-none"
              placeholder="내용을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-nexus-gray mb-2">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="w-full px-4 py-2 bg-nexus-dark border border-nexus-gray/20 rounded-lg text-nexus-white focus:outline-none focus:ring-2 focus:ring-nexus-blue"
              placeholder="태그1, 태그2, 태그3"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={(e) =>
                setFormData({ ...formData, isAnonymous: e.target.checked })
              }
              className="mr-2"
            />
            <label htmlFor="isAnonymous" className="text-sm text-nexus-gray">
              익명으로 작성
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-nexus-gray hover:text-nexus-white transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-nexus-blue text-white font-medium rounded-lg hover:bg-nexus-blue-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "작성 중..." : "작성하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityPage;
