/**
 * Game Server Configuration
 */
import { type PhysicsConfig } from '@space-sim/shared';
export interface ServerConfig {
    port: number;
    adminPort: number;
    maxPlayers: number;
    tickRate: number;
    defaultWorld: string;
    worldsDirectory: string;
    physics: PhysicsConfig;
    networkTickRate: number;
}
export declare const DEFAULT_SERVER_CONFIG: ServerConfig;
/**
 * Load configuration from environment variables
 */
export declare function loadServerConfig(): ServerConfig;
//# sourceMappingURL=config.d.ts.map