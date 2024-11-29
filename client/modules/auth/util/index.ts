import { deleteCookie, getCookie, hasCookie, setCookie } from "cookies-next";

export interface UserInfo {
  username: string;
  email: string;
}

const config = {
  secure: true,
  path: "/",
  domain: "localhost"
};

export const login = (userInfo: {
  token: string;
  email: string;
  username: string;
}) => {
  localStorage.setItem("user_email", userInfo.email);
  localStorage.setItem("user_name", userInfo.username);
  setCookie("jwt", userInfo.token, config);
  setCookie("user_email", userInfo.email, config);
  setCookie("user_name", userInfo.username, config);
  window.location.replace("/chat");
};

export const logout = () => {
  localStorage.setItem("user_email", "");
  localStorage.setItem("user_name", "");
  deleteCookie("jwt");
  deleteCookie("user_email");
  deleteCookie("user_name");
  window.location.replace("/auth/login");
};

export const getProfileInfo = () => {
  if (!hasCookie("user_email") || !hasCookie("user_name")) {
    return null;
  }
  return {
    email: String(getCookie("user_email")),
    username: String(getCookie("user_name"))
  };
};
