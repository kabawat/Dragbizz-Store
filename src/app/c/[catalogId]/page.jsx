import { Suspense } from "react";
import CatalogPage from "@/page/c/catalog";
import LoadingSkeleton from "@/components/public/LoadingSkeleton";

export async function generateMetadata({ params }) {
    const { catalogId } = await params;

    return {
        title: "Browse Products - DragBizz Store",
        description: "Browse our product catalog and order directly via WhatsApp",
        keywords: "products, catalog, online shopping, DragBizz Store",
        openGraph: {
            title: "Browse Products - DragBizz Store",
            description: "Browse our product catalog and order directly via WhatsApp",
            type: "website",
        },
    };
}

export default async function CatalogPageRoute({ params }) {
    const { catalogId } = await params;

    return (
        <Suspense fallback={<LoadingSkeleton type="catalog" count={8} />}>
            <CatalogPage catalogId={catalogId} />
        </Suspense>
    );
}
