export const resolveStorageUrl = (path: string | null | undefined): string => {
    if (!path || !path.trim()) return '';
    if (/^(https?:|blob:|data:)/.test(path)) return path;

    const rawApi = (import.meta.env?.VITE_API_BASE_URL as string | undefined) || '';
    const proxyTarget = (import.meta.env?.VITE_PROXY_TARGET as string | undefined) || '';

    const rawBase = rawApi.startsWith('http')
        ? rawApi
        : (proxyTarget || 'http://127.0.0.1:8080');

    const base = rawBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    const bersih = path.replace(/^\/+/, '').replace(/^storage\//, '');
    return `${base}/storage/${bersih}`;
};