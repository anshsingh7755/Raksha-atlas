export const pathToView: Readonly<Record<string, string>>;
export const viewToPath: Readonly<Record<string, string>>;
export function resolveView(pathname: string): string | null;
export function resolvePath(view: string): string;
