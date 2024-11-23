"use client";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeChangerButton() {
  const { theme, setTheme } = useTheme();
  const handleThemeChange = () => {
    setTheme(theme == "light" ? "dark" : "light");
  };

  return (
    <Button variant="ghost" onClick={handleThemeChange}>
      {theme == "light" ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
