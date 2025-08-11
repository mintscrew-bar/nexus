import { Gamepad2, MessageSquare, Plus, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const QuickActions: React.FC = () => {
  return (
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
  );
};

export default QuickActions;
