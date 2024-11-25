import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="text-center min-w-96">{children}</Card>
    </div>
  );
}
