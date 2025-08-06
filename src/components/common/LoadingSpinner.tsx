import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-nexus-blue rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-nexus-blue rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-nexus-blue rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
      {text && <p className="text-theme-text-secondary text-sm mt-2">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
