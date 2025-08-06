import { CheckCircle, Clock, DollarSign, Gavel } from "lucide-react";
import React, { useEffect, useState } from "react";
import socketService from "../../services/socket";
import { useAppStore } from "../../store/useAppStore";
import LoadingSpinner from "../common/LoadingSpinner";

interface AuctionSystemProps {
  game: any;
  participants: any[];
  captains: any[]; // 팀장들만 참여
  onComplete: (results: any) => void;
}

interface AuctionBid {
  id: number;
  bidder_id: number;
  player_id: number;
  bid_amount: number;
  bidder_nickname: string;
  player_nickname?: string | null;
  created_at: string;
}

interface AuctionPlayer {
  id: number;
  nexus_nickname: string;
  current_bid: number;
  bid_count: number;
  is_sold: boolean;
  sold_to?: string | null;
  sold_price?: number;
  tier?: string;
  mainLane?: string;
  winRate?: number;
  totalGames?: number;
  avatarUrl?: string;
}

const AuctionSystem: React.FC<AuctionSystemProps> = ({
  game,
  participants,
  captains,
  onComplete,
}) => {
  const { user } = useAppStore();
  const [bids, setBids] = useState<AuctionBid[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30초로 증가
  const [auctionPlayers, setAuctionPlayers] = useState<AuctionPlayer[]>([]);
  const [currentAuctionPlayer, setCurrentAuctionPlayer] = useState<
    number | null
  >(null);
  const [currentAuctionPlayerNickname, setCurrentAuctionPlayerNickname] =
    useState<string | null>(null);
  const [auctionPhase, setAuctionPhase] = useState<
    "waiting" | "active" | "completed"
  >("waiting");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [captainPoints, setCaptainPoints] = useState<{ [key: number]: number }>(
    {}
  );
  const [teams, setTeams] = useState<any[]>([]);
  const [bidAnimations, setBidAnimations] = useState<
    { id: number; amount: number; bidder: string }[]
  >([]);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; type: string }[]
  >([]);

  useEffect(() => {
    initializeAuction();
    setupRealtimeConnection();
  }, []);

  useEffect(() => {
    if (auctionPhase === "active" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && auctionPhase === "active") {
      endCurrentPlayerAuction();
    }
  }, [timeLeft, auctionPhase]);

  const initializeAuction = () => {
    // 각 팀장에게 3000포인트 지급 (증가)
    const initialPoints: { [key: number]: number } = {};
    captains.forEach((captain) => {
      initialPoints[captain.user_id] = 3000;
    });
    setCaptainPoints(initialPoints);

    // 경매할 플레이어들 필터링 (팀장 제외)
    const availablePlayers = participants.filter(
      (p) => !captains.some((c) => c.user_id === p.user_id)
    );

    // 플레이어 정보에 가상의 승률과 게임 수 추가 (실제로는 API에서 가져와야 함)
    const auctionPlayersData: AuctionPlayer[] = availablePlayers.map(
      (player) => ({
        id: player.user_id,
        nexus_nickname: player.nexus_nickname,
        current_bid: 0,
        bid_count: 0,
        is_sold: false,
        tier: player.tier || "Unranked",
        mainLane: player.mainLane || "Unknown",
        winRate: Math.floor(Math.random() * 30) + 45, // 45-75% 승률
        totalGames: Math.floor(Math.random() * 200) + 50, // 50-250게임
        avatarUrl: player.avatarUrl,
      })
    );

    setAuctionPlayers(auctionPlayersData);
    if (auctionPlayersData.length > 0) {
      setCurrentAuctionPlayer(auctionPlayersData[0].id);
      setCurrentAuctionPlayerNickname(auctionPlayersData[0].nexus_nickname);
    }
    setAuctionPhase("active");
  };

  const setupRealtimeConnection = () => {
    // Socket.IO 연결은 중앙에서 관리되므로 여기서는 연결하지 않음

    // 입찰 이벤트 리스너
    socketService.onAuctionBid((data) => {
      const { player_id, bid_amount, bidder_nickname } = data;
      const newBid: AuctionBid = {
        id: Date.now(),
        bidder_id: data.bidder_id,
        player_id,
        bid_amount,
        bidder_nickname,
        created_at: new Date().toISOString(),
      };

      setBids((prev) => [...prev, newBid]);
      updatePlayerBid(player_id, bid_amount);
      addNotification(
        `${bidder_nickname}님이 ${bid_amount}포인트로 입찰했습니다! 💰`
      );
      addBidAnimation(bid_amount, bidder_nickname);
    });

    // 경매 완료 이벤트 리스너
    socketService.onAuctionComplete((data) => {
      const { player_id, sold_to, sold_price } = data;
      setAuctionPlayers((prev) =>
        prev.map((p) =>
          p.id === player_id ? { ...p, is_sold: true, sold_to, sold_price } : p
        )
      );
      addNotification(
        `${data.player_nickname}님이 ${sold_to}팀에 ${sold_price}포인트로 낙찰되었습니다! 🎉`
      );
    });

    // 새로운 플레이어 경매 시작
    socketService.onNewAuctionPlayer((data) => {
      setCurrentAuctionPlayer(data.player_id);
      setCurrentAuctionPlayerNickname(data.player_nickname);
      setTimeLeft(30);
    });
  };

  const updatePlayerBid = (playerId: number, bidAmount: number) => {
    setAuctionPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, current_bid: bidAmount, bid_count: p.bid_count + 1 }
          : p
      )
    );
  };

  const addBidAnimation = (amount: number, bidder: string) => {
    const animation = { id: Date.now(), amount, bidder };
    setBidAnimations((prev) => [...prev, animation]);
    setTimeout(() => {
      setBidAnimations((prev) => prev.filter((a) => a.id !== animation.id));
    }, 2000);
  };

  const addParticleEffect = () => {
    const particles = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: "gold",
    }));
    setParticles((prev) => [...prev, ...particles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !particles.includes(p)));
    }, 1000);
  };

  const addNotification = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setNotifications((prev) => [...prev, `[${timestamp}] ${message}`]);
    if (notifications.length > 10) {
      setNotifications((prev) => prev.slice(-10));
    }
  };

  const endCurrentPlayerAuction = () => {
    if (!currentAuctionPlayer) return;

    const highestBidder = getHighestBidder(currentAuctionPlayer);
    if (highestBidder) {
      // 플레이어를 팀에 할당
      setAuctionPlayers((prev) =>
        prev.map((p) =>
          p.id === currentAuctionPlayer
            ? {
                ...p,
                is_sold: true,
                sold_to: highestBidder.bidder_nickname,
                sold_price: highestBidder.bid_amount,
              }
            : p
        )
      );

      // 팀장 포인트 차감
      setCaptainPoints((prev) => ({
        ...prev,
        [highestBidder.bidder_id]:
          prev[highestBidder.bidder_id] - highestBidder.bid_amount,
      }));

      addNotification(
        `${getCurrentPlayer()?.nexus_nickname}님이 ${
          highestBidder.bidder_nickname
        }팀에 ${highestBidder.bid_amount}포인트로 낙찰되었습니다! 🎉`
      );
    }

    // 다음 플레이어로 이동
    const remainingPlayers = getRemainingPlayers();
    if (remainingPlayers.length > 0) {
      const nextPlayer = remainingPlayers[0];
      setCurrentAuctionPlayer(nextPlayer.id);
      setCurrentAuctionPlayerNickname(nextPlayer.nexus_nickname);
      setTimeLeft(30);
    } else {
      setAuctionPhase("completed");
      onComplete({ teams: getSoldPlayers() });
    }
  };

  const getHighestBidder = (playerId: number) => {
    const playerBids = bids.filter((b) => b.player_id === playerId);
    if (playerBids.length === 0) return null;
    return playerBids.reduce((highest, current) =>
      current.bid_amount > highest.bid_amount ? current : highest
    );
  };

  const handlePlaceBid = async () => {
    if (!currentAuctionPlayer || !bidAmount || isSubmitting) return;

    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      addNotification("올바른 금액을 입력해주세요.");
      return;
    }

    const currentPoints = getCurrentUserPoints();
    if (amount > currentPoints) {
      addNotification("포인트가 부족합니다.");
      return;
    }

    const currentHighestBid = getHighestBid(currentAuctionPlayer || 0);
    if (amount <= currentHighestBid) {
      addNotification("현재 최고 입찰가보다 높은 금액을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Socket.IO를 통해 입찰 전송
      socketService.sendAuctionBid(
        game.id,
        currentAuctionPlayer!,
        amount,
        currentAuctionPlayerNickname || "Unknown Player"
      );

      setBidAmount("");
      addNotification(`당신이 ${amount}포인트로 입찰했습니다! 💰`);
      addBidAnimation(amount, user!.nexusNickname);
      addParticleEffect();

      // 시간 연장
      setTimeLeft(Math.max(timeLeft, 10));
    } catch (error) {
      console.error("Failed to place bid:", error);
      addNotification("입찰에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHighestBid = (playerId: number) => {
    const playerBids = bids.filter((b) => b.player_id === playerId);
    if (playerBids.length === 0) return 0;
    return Math.max(...playerBids.map((b) => b.bid_amount));
  };

  const getBidCount = (playerId: number) => {
    return bids.filter((b) => b.player_id === playerId).length;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canBid = () => {
    return user && captains.some((c) => c.user_id === user.id);
  };

  const getCurrentUserPoints = () => {
    if (!user) return 0;
    return captainPoints[user.id] || 0;
  };

  const getCurrentPlayer = () => {
    return auctionPlayers.find((p) => p.id === currentAuctionPlayer);
  };

  const getSoldPlayers = () => {
    return auctionPlayers.filter((p) => p.is_sold);
  };

  const getRemainingPlayers = () => {
    return auctionPlayers.filter((p) => !p.is_sold);
  };

  const getLaneColor = (lane: string | undefined) => {
    if (!lane) return "text-gray-500";

    const colors = {
      top: "text-red-500",
      jungle: "text-orange-500",
      mid: "text-blue-500",
      adc: "text-green-500",
      support: "text-purple-500",
    };
    return colors[lane as keyof typeof colors] || "text-gray-500";
  };

  if (auctionPhase === "waiting") {
    return (
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <div className="text-center">
          <LoadingSpinner text="경매 준비 중..." />
          <p className="text-theme-text-secondary mt-4">
            경매가 곧 시작됩니다...
          </p>
        </div>
      </div>
    );
  }

  if (auctionPhase === "completed") {
    return (
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-theme-text mb-4">
            경매 완료! 🎉
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {getSoldPlayers().map((player) => (
              <div
                key={player.id}
                className="bg-theme-surface-secondary rounded-lg p-4 border border-theme-border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-theme-text">
                      {player.nexus_nickname}
                    </h4>
                    <p className="text-sm text-theme-text-secondary">
                      {player.sold_to}팀에 {player.sold_price}포인트로 낙찰
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-theme-text-secondary">
                      {player.mainLane}
                    </p>
                    <p className="text-sm text-theme-text-secondary">
                      승률: {player.winRate}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = getCurrentPlayer();

  return (
    <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Gavel className="w-8 h-8 text-nexus-blue" />
          <div>
            <h2 className="text-2xl font-bold text-theme-text">경매 시스템</h2>
            <p className="text-theme-text-secondary">
              팀을 구성하기 위해 플레이어들을 경매합니다
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <Clock className="w-6 h-6 text-red-500 mx-auto" />
            <p className="text-lg font-bold text-red-500">
              {formatTime(timeLeft)}
            </p>
          </div>
          {canBid() && (
            <div className="text-center">
              <DollarSign className="w-6 h-6 text-green-500 mx-auto" />
              <p className="text-lg font-bold text-green-500">
                {getCurrentUserPoints()}P
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 현재 경매 플레이어 */}
      {currentPlayer && (
        <div className="bg-gradient-to-r from-nexus-blue to-purple-600 rounded-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {currentPlayer.nexus_nickname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {currentPlayer.nexus_nickname}
                </h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getLaneColor(
                      currentPlayer.mainLane
                    )} bg-white bg-opacity-20`}
                  >
                    {currentPlayer.mainLane}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 bg-opacity-20">
                    승률 {currentPlayer.winRate}%
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 bg-opacity-20">
                    {currentPlayer.totalGames}게임
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">현재 최고 입찰가</p>
              <p className="text-3xl font-bold">
                {getHighestBid(currentPlayer.id)}P
              </p>
              <p className="text-sm opacity-80">
                입찰 횟수: {getBidCount(currentPlayer.id)}회
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 입찰 폼 */}
      {canBid() && (
        <div className="bg-theme-surface-secondary rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-theme-text mb-2">
                입찰 금액
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="입찰 금액을 입력하세요"
                className="w-full px-4 py-2 bg-theme-surface border border-theme-border rounded-lg text-theme-text focus:outline-none focus:ring-2 focus:ring-nexus-blue"
                min={getHighestBid(currentAuctionPlayer || 0) + 1}
                max={getCurrentUserPoints()}
              />
            </div>
            <button
              onClick={handlePlaceBid}
              disabled={isSubmitting || !bidAmount}
              className="px-6 py-2 bg-nexus-blue text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "입찰 중..." : "입찰하기"}
            </button>
          </div>
          <div className="mt-2 text-sm text-theme-text-secondary">
            보유 포인트: {getCurrentUserPoints()}P | 최소 입찰가:{" "}
            {getHighestBid(currentAuctionPlayer || 0) + 1}P
          </div>
        </div>
      )}

      {/* 플레이어 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {auctionPlayers.map((player) => (
          <div
            key={player.id}
            className={`bg-theme-surface-secondary rounded-lg p-4 border-2 transition-all ${
              player.id === currentAuctionPlayer
                ? "border-nexus-blue bg-blue-500 bg-opacity-10"
                : player.is_sold
                ? "border-green-500 bg-green-500 bg-opacity-10"
                : "border-theme-border"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-nexus-gray rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {player.nexus_nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text">
                    {player.nexus_nickname}
                  </h4>
                  <p className="text-sm text-theme-text-secondary">
                    {player.tier}
                  </p>
                </div>
              </div>
              {player.is_sold && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-theme-text-secondary">
                  주로가는 라인:
                </span>
                <span
                  className={`font-medium ${getLaneColor(player.mainLane)}`}
                >
                  {player.mainLane}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-theme-text-secondary">승률:</span>
                <span className="font-medium text-green-500">
                  {player.winRate}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-theme-text-secondary">총 게임:</span>
                <span className="font-medium text-blue-500">
                  {player.totalGames}게임
                </span>
              </div>
              {player.current_bid > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-theme-text-secondary">
                    현재 입찰가:
                  </span>
                  <span className="font-medium text-yellow-500">
                    {player.current_bid}P
                  </span>
                </div>
              )}
              {player.is_sold && (
                <div className="mt-2 p-2 bg-green-500 bg-opacity-20 rounded text-sm">
                  <p className="text-green-500 font-medium">
                    {player.sold_to}팀에 {player.sold_price}P로 낙찰
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 알림 */}
      {notifications.length > 0 && (
        <div className="mt-6 bg-theme-surface-secondary rounded-lg p-4 max-h-40 overflow-y-auto">
          <h4 className="font-semibold text-theme-text mb-2">실시간 알림</h4>
          <div className="space-y-1">
            {notifications.slice(-5).map((notification, index) => (
              <p key={index} className="text-sm text-theme-text-secondary">
                {notification}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 입찰 애니메이션 */}
      {bidAnimations.map((animation) => (
        <div
          key={animation.id}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg animate-bounce z-50"
        >
          +{animation.amount}P by {animation.bidder}
        </div>
      ))}

      {/* 파티클 효과 */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed w-2 h-2 bg-yellow-400 rounded-full animate-ping z-40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
        />
      ))}
    </div>
  );
};

export default AuctionSystem;
