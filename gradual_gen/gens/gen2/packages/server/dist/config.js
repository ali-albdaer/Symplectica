/**
 * Game Server Configuration
 */
import { DEFAULT_PHYSICS_CONFIG } from '@space-sim/shared';
export const DEFAULT_SERVER_CONFIG = {
    port: 3000,
    adminPort: 3001,
    maxPlayers: 32,
    tickRate: 20,
    defaultWorld: 'sun-earth-moon',
    worldsDirectory: './worlds',
    physics: DEFAULT_PHYSICS_CONFIG,
    networkTickRate: 20
};
/**
 * Load configuration from environment variables
 */
export function loadServerConfig() {
    return {
        ...DEFAULT_SERVER_CONFIG,
        port: parseInt(process.env['PORT'] ?? '3000', 10),
        adminPort: parseInt(process.env['ADMIN_PORT'] ?? '3001', 10),
        maxPlayers: parseInt(process.env['MAX_PLAYERS'] ?? '32', 10),
        defaultWorld: process.env['DEFAULT_WORLD'] ?? 'sun-earth-moon',
        worldsDirectory: process.env['WORLDS_DIR'] ?? './worlds'
    };
}
//# sourceMappingURL=config.js.map