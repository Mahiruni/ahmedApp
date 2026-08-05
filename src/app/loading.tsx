import { BilooLoadingVisual } from "@/components/biloo/biloo-loading-visual";

export default function Loading() {
  return (
    <main className="biloo-route-loader biloo-route-loader-fallback" role="status">
      <span aria-hidden="true" className="biloo-route-loader-progress" />
      <BilooLoadingVisual
        detail="Preparing your connected experience"
        label="Opening BILOO…"
      />
    </main>
  );
}
