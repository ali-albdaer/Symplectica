/**
 * Centralized Time Controller
 * 
 * Implements the industry-standard fixed timestep + accumulator pattern:
 * - Physics runs at a fixed timestep (dt = 3600s = 1 hour)
 * - Rendering runs at variable rate (requestAnimationFrame)
 * - Accumulator ensures deterministic simulation regardless of framerate
 */

export interface SpeedLevel {
    /** Simulation seconds per real second */
    sim: number;
    /** Human-readable label for display */
    label: string;
}

export class TimeController {
    // Fixed physics timestep (simulation seconds per step)
    private physicsTimestep = 3600;

    // Speed levels (simulation seconds per real second)
    private readonly SPEED_LEVELS: SpeedLevel[] = [
        { sim: 1, label: '1s/s' },           // Real-time
        { sim: 60, label: '1min/s' },        // 1 minute per second
        { sim: 3600, label: '1hr/s' },       // 1 hour per second
        { sim: 86400, label: '1day/s' },     // 1 day per second
        { sim: 604800, label: '1wk/s' },     // 1 week per second
        { sim: 2592000, label: '1mo/s' },    // ~30 days per second
        { sim: 31536000, label: '1yr/s' },   // 1 year per second
    ];

    // Default to 1s/s to match server mode
    private speedIndex = 0;
    private accumulator = 0;
    private paused = false;

    // Callbacks for state changes
    private onSpeedChange?: (speed: SpeedLevel) => void;
    private onPauseChange?: (paused: boolean) => void;

    /**
     * Update the time accumulator and return the number of physics steps to run.
     * @param realDeltaSeconds Real time elapsed since last frame (in seconds)
     * @returns Number of physics steps to execute this frame
     */
    update(realDeltaSeconds: number): number {
        if (this.paused) return 0;

        const speed = this.SPEED_LEVELS[this.speedIndex].sim;
        this.accumulator += realDeltaSeconds * speed;

        let steps = 0;
        while (this.accumulator >= this.physicsTimestep) {
            this.accumulator -= this.physicsTimestep;
            steps++;
        }

        const maxSteps = 1000;
        if (steps > maxSteps) {
            this.accumulator = 0;
            return maxSteps;
        }

        return steps;
    }

    /** Get the physics timestep (simulation seconds per physics step) */
    getPhysicsTimestep(): number {
        return this.physicsTimestep;
    }

    /** Set the physics timestep (advanced users only) */
    setPhysicsTimestep(dt: number): void {
        if (dt > 0) {
            this.physicsTimestep = dt;
        }
    }

    /** Get the current speed level */
    getCurrentSpeed(): SpeedLevel {
        return this.SPEED_LEVELS[this.speedIndex];
    }

    /** Get all available speed levels */
    getSpeedLevels(): SpeedLevel[] {
        return [...this.SPEED_LEVELS];
    }

    /** Get current speed index */
    getSpeedIndex(): number {
        return this.speedIndex;
    }

    /** Increase speed (> key) */
    increaseSpeed(): boolean {
        if (this.speedIndex < this.SPEED_LEVELS.length - 1) {
            this.speedIndex++;
            this.onSpeedChange?.(this.getCurrentSpeed());
            return true;
        }
        return false;
    }

    /** Decrease speed (< key) */
    decreaseSpeed(): boolean {
        if (this.speedIndex > 0) {
            this.speedIndex--;
            this.onSpeedChange?.(this.getCurrentSpeed());
            return true;
        }
        return false;
    }

    /** Set speed by index */
    setSpeedIndex(index: number): void {
        if (index >= 0 && index < this.SPEED_LEVELS.length) {
            this.speedIndex = index;
            this.onSpeedChange?.(this.getCurrentSpeed());
        }
    }

    /** Set speed by simulation seconds per real second (closest match) */
    setSpeedBySimRate(simSecondsPerRealSecond: number): void {
        if (!Number.isFinite(simSecondsPerRealSecond) || simSecondsPerRealSecond <= 0) return;

        let closestIndex = 0;
        let closestDelta = Math.abs(this.SPEED_LEVELS[0].sim - simSecondsPerRealSecond);

        for (let i = 1; i < this.SPEED_LEVELS.length; i++) {
            const delta = Math.abs(this.SPEED_LEVELS[i].sim - simSecondsPerRealSecond);
            if (delta < closestDelta) {
                closestDelta = delta;
                closestIndex = i;
            }
        }

        this.speedIndex = closestIndex;
        this.onSpeedChange?.(this.getCurrentSpeed());
    }

    /** Toggle pause */
    togglePause(): void {
        this.paused = !this.paused;
        this.onPauseChange?.(this.paused);
    }

    /** Set pause state */
    setPaused(paused: boolean): void {
        this.paused = paused;
        this.onPauseChange?.(this.paused);
    }

    /** Get pause state */
    isPaused(): boolean {
        return this.paused;
    }

    /** Get display label for current speed */
    getDisplayLabel(): string {
        if (this.paused) {
            return '⏸ PAUSED';
        }
        return `⏱ ${this.SPEED_LEVELS[this.speedIndex].label}`;
    }

    /** Set callback for speed changes */
    setOnSpeedChange(callback: (speed: SpeedLevel) => void): void {
        this.onSpeedChange = callback;
    }

    /** Set callback for pause changes */
    setOnPauseChange(callback: (paused: boolean) => void): void {
        this.onPauseChange = callback;
    }

    /** Reset accumulator (e.g., after simulation reset) */
    resetAccumulator(): void {
        this.accumulator = 0;
    }
}
