import Link from "next/link";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ThemeChangerButton = dynamic(() => import("./theme-changer.button"), {
  ssr: false
});

const ProfileInfoButton = dynamic(() => import("./profile-info.button"), {
  ssr: false,
  loading: () => <Loader2 className="animate-spin" />
});

export default function Navbar() {
  return (
    <div className="bg-secondary border-border">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex flex-wrap items-center justify-end cursor-pointer">
          <Link className="tracking-wide font-semibold" href="/">
            Chat App
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-end min-h-10">
          <ProfileInfoButton />
          <ThemeChangerButton />
        </div>
      </div>
    </div>
  );
}
