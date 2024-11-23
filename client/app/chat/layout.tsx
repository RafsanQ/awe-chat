import { Card } from "@/components/ui/card";

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row flex-grow justify-center items-center">
      <Card className="text-center min-w-96">{children}</Card>
    </div>
  );
}
