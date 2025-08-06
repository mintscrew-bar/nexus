import { MessageSquare, Users } from "lucide-react";
import React from "react";

const MessagesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-theme-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="mb-8">
            <MessageSquare className="w-24 h-24 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-theme-text mb-4">메시지</h1>
            <p className="text-theme-text-secondary text-lg">
              친구들과 실시간으로 대화하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                <h2 className="text-xl font-semibold text-theme-text">
                  실시간 메시지
                </h2>
              </div>
              <p className="text-theme-text-secondary mb-4">
                우측 패널에서 친구들과 실시간으로 메시지를 주고받을 수 있습니다.
              </p>
              <ul className="text-theme-text-secondary text-sm space-y-2">
                <li>• 실시간 메시지 송수신</li>
                <li>• 읽음 확인 기능</li>
                <li>• 온라인 상태 표시</li>
                <li>• 대화 검색 기능</li>
              </ul>
            </div>

            <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-8 h-8 text-green-500" />
                <h2 className="text-xl font-semibold text-theme-text">
                  친구 관리
                </h2>
              </div>
              <p className="text-theme-text-secondary mb-4">
                친구 목록에서 친구를 추가하고 관리할 수 있습니다.
              </p>
              <ul className="text-theme-text-secondary text-sm space-y-2">
                <li>• 친구 요청 보내기/받기</li>
                <li>• 온라인 친구 확인</li>
                <li>• 친구 검색 기능</li>
                <li>• 친구 삭제 기능</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-nexus-blue rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              메시지 패널 열기
            </h3>
            <p className="text-blue-100 mb-4">
              우측 상단의 메시지 아이콘을 클릭하여 DM 패널을 열어보세요.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-200">
              <MessageSquare className="w-5 h-5" />
              <span>메시지 패널에서 친구들과 대화를 시작하세요!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
