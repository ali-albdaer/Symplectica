/**
 * HUD display manager
 */

export class HUD {
    private positionEl: HTMLElement;
    private velocityEl: HTMLElement;
    private nearBodyEl: HTMLElement;
    private soiEl: HTMLElement;
    private fpsEl: HTMLElement;
    private pingEl: HTMLElement;
    private tickEl: HTMLElement;
    private bodiesEl: HTMLElement;

    constructor() {
        this.positionEl = document.getElementById('hud-position')!;
        this.velocityEl = document.getElementById('hud-velocity')!;
        this.nearBodyEl = document.getElementById('hud-near-body')!;
        this.soiEl = document.getElementById('hud-soi')!;
        this.fpsEl = document.getElementById('hud-fps')!;
        this.pingEl = document.getElementById('hud-ping')!;
        this.tickEl = document.getElementById('hud-tick')!;
        this.bodiesEl = document.getElementById('hud-bodies')!;
    }

    setPosition(x: number, y: number, z: number): void {
        this.positionEl.textContent = `${this.formatDistance(x)}, ${this.formatDistance(y)}, ${this.formatDistance(z)}`;
    }

    setVelocity(v: number): void {
        this.velocityEl.textContent = this.formatVelocity(v);
    }

    setNearBody(name: string): void {
        this.nearBodyEl.textContent = name;
    }

    setSOI(soi: number): void {
        this.soiEl.textContent = soi > 0 ? this.formatDistance(soi) : 'N/A';
    }

    setFps(fps: number): void {
        this.fpsEl.textContent = fps.toString();
    }

    setPing(ping: number): void {
        this.pingEl.textContent = ping.toString();
    }

    setTick(tick: number): void {
        this.tickEl.textContent = tick.toLocaleString();
    }

    setBodies(count: number): void {
        this.bodiesEl.textContent = count.toString();
    }

    /**
     * Format distance with appropriate units
     */
    private formatDistance(m: number): string {
        const abs = Math.abs(m);
        const sign = m < 0 ? '-' : '';

        if (abs < 1000) {
            return `${sign}${abs.toFixed(1)} m`;
        } else if (abs < 1e6) {
            return `${sign}${(abs / 1000).toFixed(2)} km`;
        } else if (abs < 1e9) {
            return `${sign}${(abs / 1e6).toFixed(2)} Mm`;
        } else if (abs < 1e12) {
            return `${sign}${(abs / 1e9).toFixed(2)} Gm`;
        } else {
            // AU for solar system scale
            const au = abs / 1.495978707e11;
            return `${sign}${au.toFixed(3)} AU`;
        }
    }

    /**
     * Format velocity with appropriate units
     */
    private formatVelocity(mps: number): string {
        const abs = Math.abs(mps);

        if (abs < 1000) {
            return `${mps.toFixed(1)} m/s`;
        } else {
            return `${(mps / 1000).toFixed(2)} km/s`;
        }
    }
}
