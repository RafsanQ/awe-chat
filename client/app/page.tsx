import { getCookie } from "cookies-next";
import { redirect } from "next/navigation";

export default function RootComponent() {
  const jwt = getCookie("jwt");
  if (jwt) {
    redirect("/chat");
  } else {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-row flex-grow justify-center items-center">
      Home Page
    </div>
  );
}
