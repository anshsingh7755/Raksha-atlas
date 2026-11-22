export type PlatformRegisterItem = {
  category: string;
  service: string;
  className: string;
  platform: string;
  count: number | null;
  origin: string;
  procurementYear: number | null;
  inductedYear: number | null;
  status: string;
  futureOrders: string;
  role: string;
  imageUrl: string;
  sourceUrl: string;
  supportingSourceUrls?: string[];
};

type PlatformRegisterResponse = {
  items: PlatformRegisterItem[];
};

export async function fetchPlatformRegister(
  category: string,
): Promise<PlatformRegisterItem[]> {
  const query = category === "all" ? "" : `?category=${encodeURIComponent(category)}`;
  const response = await fetch(`/api/inventory/register${query}`);

  if (!response.ok) {
    throw new Error(`Platform register request failed (${response.status}).`);
  }

  const data = (await response.json()) as PlatformRegisterResponse;
  return data.items;
}
