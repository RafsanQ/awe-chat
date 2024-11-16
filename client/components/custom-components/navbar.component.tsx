import Link from "next/link";
import ProfileInfoButton from "./profile-info.button";
import ThemeChangerButton from "./theme-changer.button";

export default function Navbar() {
  return (
    <nav className="bg-secondary border-border">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex flex-wrap items-center justify-end cursor-pointer">
          <Link className="tracking-wide font-semibold" href="/">
            Chat App
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-end">
          <ProfileInfoButton />
          <ThemeChangerButton />
        </div>
      </div>
    </nav>
  );
}
