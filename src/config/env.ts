export const ENV = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? 'http://127.0.0.1:8000/api/v1' : '/api/v1'),
  WS_BASE_URL:
    import.meta.env.VITE_WS_BASE_URL ||
    (import.meta.env.DEV ? 'ws://127.0.0.1:8000/ws' : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`),
  IS_DEV: import.meta.env.DEV,
};
