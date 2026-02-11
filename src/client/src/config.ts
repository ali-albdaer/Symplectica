const parseNumber = (value: string | undefined, fallback: number): number => {
    if (value === undefined) {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveProtocol = (): string => {
    const envProtocol = import.meta.env.VITE_WS_PROTOCOL;
    if (envProtocol === 'ws' || envProtocol === 'wss') {
        return envProtocol;
    }

    return window.location.protocol === 'https:' ? 'wss' : 'ws';
};

export const CLIENT_CONFIG = {
    wsPort: parseNumber(import.meta.env.VITE_WS_PORT, 8080),
};

export const getWebSocketUrl = (): string => {
    const isDev = import.meta.env.DEV;

    const protocol = resolveProtocol();
    const hostname = window.location.hostname;

    if (isDev) {
        return `${protocol}://${hostname}:${CLIENT_CONFIG.wsPort}`;
    } else {
        return `${protocol}://${window.location.host}`;
    }
};
