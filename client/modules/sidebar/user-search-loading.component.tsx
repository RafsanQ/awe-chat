import { Skeleton } from "@/components/ui/skeleton";
export default function UserSearchLoadingComponent() {
  return (
    <>
      <div className="space-y-4">
        <Skeleton className="h-4 w-[250px] space-y-1" />
        <Skeleton className="h-4 w-[200px] space-y-1" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] space-y-1" />
        <Skeleton className="h-4 w-[200px] space-y-1" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] space-y-1" />
        <Skeleton className="h-4 w-[200px] space-y-1" />
      </div>
    </>
  );
}
