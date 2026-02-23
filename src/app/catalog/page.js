import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
          Загрузка каталога…
        </div>
      }
    >
      <CatalogClient />
    </Suspense>
  );
}
