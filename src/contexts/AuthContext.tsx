import React, { createContext, useContext, useEffect, useState } from "react";
import { storageUtils } from "../utils";

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 사용자 정보 복원
  useEffect(() => {
    const savedUser = storageUtils.get<User>("user");
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 실제 API 호출 시뮬레이션
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 테스트용: 특정 이메일/비밀번호 조합만 성공
          if (email === "test@example.com" && password === "password123") {
            resolve("success");
          } else {
            reject(new Error("로그인 실패"));
          }
        }, 1000);
      });

      // 로그인 성공 시 사용자 정보 설정
      const userData: User = {
        id: "1",
        email: email,
        username: "김내전",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        createdAt: new Date(),
      };

      setUser(userData);
      storageUtils.set("user", userData);
      return true;
    } catch (error) {
      console.error("로그인 실패:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    storageUtils.remove("user");
  };

  const register = async (
    email: string,
    _password: string,
    username: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve("success");
        }, 1000);
      });

      // 회원가입 성공 시 사용자 정보 설정
      const userData: User = {
        id: Date.now().toString(),
        email: email,
        username: username,
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        createdAt: new Date(),
      };

      setUser(userData);
      storageUtils.set("user", userData);
      return true;
    } catch (error) {
      console.error("회원가입 실패:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
