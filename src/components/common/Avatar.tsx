import React from "react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const defaultAvatar = "/default-avatar.svg";

  return (
    <img
      src={src || defaultAvatar}
      alt={alt}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      onError={(e) => {
        // 아바타 로드 실패 시 기본 아바타로 대체
        const target = e.target as HTMLImageElement;
        if (target.src !== defaultAvatar) {
          target.src = defaultAvatar;
        }
      }}
    />
  );
};

export default Avatar;
