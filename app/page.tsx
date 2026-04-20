import { Masthead } from "@/components/masthead";
import { Signal } from "@/components/signal";
import { Catalog } from "@/components/catalog";
import { ProductsGrid } from "@/components/products-grid";
import { PeriodicTable } from "@/components/periodic-table";
import { ExperimentsPreview } from "@/components/experiments-preview";
import { Subscribe } from "@/components/subscribe";
import { Correspondence } from "@/components/correspondence";

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
