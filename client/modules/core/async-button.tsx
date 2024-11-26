"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  isLoading: boolean;
  type?: "submit" | "reset" | "button" | undefined;
  text: string;
}

export default function AsyncButton(props: Props) {
  return props.isLoading ? (
    <Button disabled>
      <Loader2 className="animate-spin" />
      Please wait
    </Button>
  ) : (
    <Button type={props.type}>{props.text}</Button>
  );
}
