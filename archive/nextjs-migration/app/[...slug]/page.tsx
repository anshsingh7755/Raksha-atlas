import { notFound } from "next/navigation";
import AtlasApp from "../AtlasApp";
import { pathToView, resolveView } from "../../lib/routes.mjs";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(pathToView)
    .filter((path) => path !== "/")
    .map((path) => ({ slug: path.slice(1).split("/") }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const pathname = `/${slug.join("/")}`;
  if (!resolveView(pathname)) notFound();
  return <AtlasApp />;
}
