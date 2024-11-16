import ProfileInfoButton from "./profile-info.button";
import ThemeChangerButton from "./theme-changer.button";

export default function Navbar() {
  return (
    <nav className="bg-gray-200 border-gray-200 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex flex-wrap items-center justify-end cursor-pointer">
          <h1>Chat App</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end">
          <ProfileInfoButton />
          <ThemeChangerButton />
        </div>
      </div>
    </nav>
  );
}
