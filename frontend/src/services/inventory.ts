import { apiGet } from "./api";

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
  const data = await apiGet<PlatformRegisterResponse>(`/api/inventory/register${query}`);
  return data.items;
}
