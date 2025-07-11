export async function signup(email: string, password: string) {
  const res = await fetch("http://localhost:4000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "회원가입 실패");
  return data;
}

export async function login(
  email: string,
  password: string,
  autoLogin: boolean
) {
  const res = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, autoLogin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "로그인 실패");
  return data;
}

export async function logout() {
  const res = await fetch("http://localhost:4000/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("로그아웃 실패");
  return true;
}
