"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  isLoading: boolean;
  disabled?: boolean;
  type?: "submit" | "reset" | "button" | undefined;
  text?: string;
  children?: React.ReactNode;
  className?: string;
  onlyIcon?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export default function AsyncButton(props: Props) {
  return props.isLoading ? (
    <Button variant={props.variant} disabled className={props.className}>
      <Loader2 className="animate-spin" />
      {props.onlyIcon ? " " : "Please wait"}
    </Button>
  ) : (
    <Button
      disabled={props.disabled}
      variant={props.variant}
      className={props.className}
      type={props.type}
      onClick={props.onClick}
    >
      {props.children || props.text}
    </Button>
  );
}
