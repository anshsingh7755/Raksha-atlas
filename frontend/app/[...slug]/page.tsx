import { notFound } from "next/navigation";
import AtlasApp from "../AtlasApp";
import { resolveView } from "../../lib/routes.mjs";

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
