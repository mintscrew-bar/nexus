import { Check, MapPin, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import apiService from "../../services/api";
import { useAppStore } from "../../store/useAppStore";

interface LineSelectionProps {
  game: any;
  onComplete: () => void;
}

const LineSelection: React.FC<LineSelectionProps> = ({ game, onComplete }) => {
  const { user } = useAppStore();
  const [linePositions, setLinePositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingLine, setSelectingLine] = useState<string | null>(null);

  const lineNames = {
    top: "탑",
    jungle: "정글",
    mid: "미드",
    adc: "원딜",
    support: "서폿",
  };

  const lineColors = {
    top: "bg-red-500",
    jungle: "bg-green-500",
    mid: "bg-blue-500",
    adc: "bg-yellow-500",
    support: "bg-purple-500",
  };

  useEffect(() => {
    fetchLinePositions();
  }, []);

  const fetchLinePositions = async () => {
    try {
      const response = await apiService.getLinePositions(game.id);
      setLinePositions(response.data.linePositions || []);
    } catch (error) {
      console.error("Failed to fetch line positions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLine = async (lineName: string) => {
    setSelectingLine(lineName);
    try {
      await apiService.selectLine(game.id, lineName as any);
      await fetchLinePositions(); // Refresh positions
    } catch (error) {
      console.error("Failed to select line:", error);
      alert("라인 선택에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSelectingLine(null);
    }
  };

  const isLineTaken = (lineName: string) => {
    return linePositions.some((pos) => pos.line_name === lineName);
  };

  const getLinePlayer = (lineName: string) => {
    return linePositions.find((pos) => pos.line_name === lineName);
  };

  const isUserSelectedLine = () => {
    return linePositions.some((pos) => pos.user_id === user?.id);
  };

  const getUserSelectedLine = () => {
    return linePositions.find((pos) => pos.user_id === user?.id);
  };

  if (loading) {
    return (
      <div className="bg-nexus-darker rounded-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">라인 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-nexus-darker rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MapPin className="w-6 h-6 text-green-500" />
        <h2 className="text-xl font-semibold text-white">라인 선택</h2>
      </div>

      <div className="mb-6">
        <p className="text-nexus-light-gray mb-4">
          플레이하고 싶은 라인을 선택하세요. 각 라인은 한 명만 선택할 수
          있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(lineNames).map(([lineKey, lineDisplay]) => {
          const isTaken = isLineTaken(lineKey);
          const player = getLinePlayer(lineKey);
          const isSelected = player?.user_id === user?.id;

          return (
            <div
              key={lineKey}
              className={`border rounded-lg p-4 ${
                isSelected
                  ? "bg-green-900/20 border-green-500/50"
                  : isTaken
                  ? "bg-gray-900/20 border-gray-500/30"
                  : "bg-nexus-dark border-nexus-gray hover:border-nexus-blue cursor-pointer"
              }`}
              onClick={() => !isTaken && handleSelectLine(lineKey)}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    lineColors[lineKey as keyof typeof lineColors]
                  }`}
                >
                  <span className="text-white text-sm font-medium">
                    {lineDisplay.charAt(0)}
                  </span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-green-400" />}
                {isTaken && !isSelected && (
                  <X className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <h3 className="text-lg font-medium text-white mb-2">
                {lineDisplay}
              </h3>

              {isTaken ? (
                <div className="text-sm">
                  <p className="text-nexus-light-gray">선택됨</p>
                  <p className="text-white font-medium">
                    {player?.nexus_nickname}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-nexus-light-gray">선택 가능</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        {isUserSelectedLine() ? (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
              <Check className="w-5 h-5" />
              <span className="font-medium">라인 선택 완료</span>
            </div>
            <p className="text-sm text-nexus-light-gray">
              선택한 라인:{" "}
              {
                lineNames[
                  getUserSelectedLine()?.line_name as keyof typeof lineNames
                ]
              }
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-nexus-light-gray">
              원하는 라인을 클릭하여 선택하세요.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-nexus-light-gray">
          모든 참가자가 라인을 선택하면 게임이 시작됩니다.
        </p>
      </div>
    </div>
  );
};

export default LineSelection;
