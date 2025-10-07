
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Chargement..." />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-40 rounded-lg" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-80 rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
