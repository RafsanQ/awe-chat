"use client";
import { useState, createContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type UserInfo = {
  username: string;
  email: string;
};

export const AuthContext = createContext<{
  authenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  user: UserInfo;
  setUser: (user: UserInfo) => void;
}>({
  authenticated: false,
  setAuthenticated: () => {},
  user: { username: "", email: "" },
  setUser: () => {}
});

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo>({ username: "", email: "" });

  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    const userInfo = sessionStorage.getItem("user_info");

    if (!userInfo) {
      if (pathName != "/register") {
        router.push("/login");
        return;
      }
    } else {
      const user: UserInfo = JSON.parse(userInfo);
      if (user) {
        setUser({
          username: user.username,
          email: user.email
        });
      }
      setAuthenticated(true);
    }
  }, [authenticated]);

  return (
    <AuthContext.Provider
      value={{
        authenticated: authenticated,
        setAuthenticated: setAuthenticated,
        user: user,
        setUser: setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
