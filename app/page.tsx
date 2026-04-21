import dynamic from "next/dynamic";
import { Masthead } from "@/components/masthead";
import { Catalog } from "@/components/catalog";
import { ProductsGrid } from "@/components/products-grid";
import { PeriodicTable } from "@/components/periodic-table";
import { ExperimentsPreview } from "@/components/experiments-preview";
import { Correspondence } from "@/components/correspondence";
import { SectionSkeleton } from "@/components/section-skeleton";

/** Client + HLS: split so first paint doesn’t pay for the player chunk up front. */
const Signal = dynamic(
  () => import("@/components/signal").then((m) => ({ default: m.Signal })),
  { ssr: true, loading: () => <SectionSkeleton minHeight={120} /> },
);
/** Form state + client handlers – separate async chunk. */
const Subscribe = dynamic(
  () => import("@/components/subscribe").then((m) => ({ default: m.Subscribe })),
  { ssr: true, loading: () => <SectionSkeleton minHeight={100} /> },
);

export default function HomePage() {
  return (
    <>
      <Masthead />
      <Signal />
      <Catalog />
      <ProductsGrid />
      <PeriodicTable />
      <ExperimentsPreview />
      <Subscribe />
      <Correspondence withGrain />
    </>
  );
}
