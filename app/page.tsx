import { Masthead } from "@/components/masthead";
import { Catalog } from "@/components/catalog";
import { ProductsGrid } from "@/components/products-grid";
import { PeriodicTable } from "@/components/periodic-table";
import { ExperimentsPreview } from "@/components/experiments-preview";
import { Correspondence } from "@/components/correspondence";

export default function HomePage() {
  return (
    <>
      <Masthead />
      <Catalog />
      <ProductsGrid />
      <PeriodicTable />
      <ExperimentsPreview />
      <Correspondence withGrain />
    </>
  );
}
