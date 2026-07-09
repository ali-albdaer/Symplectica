import * as THREE from 'three';

export class MediaCapture {
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];
    private isRecording = false;
    private canvas: HTMLCanvasElement;

    // Optional callback for UI updates
    public onRecordingStateChange?: (isRecording: boolean) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    public toggleRecording(): void {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    private startRecording(): void {
        if (this.isRecording) return;

        try {
            // Capture at 60 FPS
            const stream = this.canvas.captureStream(60);
            
            // Try to get highest quality WebM
            const options = { mimeType: 'video/webm;codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm'; // Fallback
            }

            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: options.mimeType,
                videoBitsPerSecond: 10000000 // 10 Mbps for high quality
            });

            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.downloadRecording();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.onRecordingStateChange?.(true);

        } catch (e) {
            console.error("Failed to start recording:", e);
        }
    }

    private stopRecording(): void {
        if (!this.isRecording || !this.mediaRecorder) return;
        
        this.mediaRecorder.stop();
        this.isRecording = false;
        this.onRecordingStateChange?.(false);
    }

    private downloadRecording(): void {
        if (this.recordedChunks.length === 0) return;

        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        this.triggerDownload(url, `symplectica-capture-${timestamp}.webm`);
        
        URL.revokeObjectURL(url);
        this.recordedChunks = [];
    }

    /**
     * Takes a standard screenshot at current canvas resolution
     */
    public takeScreenshot(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
        renderer.render(scene, camera);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const url = this.canvas.toDataURL('image/png');
        this.triggerDownload(url, `symplectica-shot-${timestamp}.png`);
    }

    /**
     * Takes a high-resolution screenshot by temporarily resizing the renderer.
     * Note: This causes a visible hitch and requires passing the WebGL renderer.
     */
    public takeHighResScreenshot(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, scaleMultiplier: number = 2): void {
        const originalWidth = this.canvas.clientWidth;
        const originalHeight = this.canvas.clientHeight;
        const originalPixelRatio = renderer.getPixelRatio();

        // Increase resolution
        renderer.setPixelRatio(originalPixelRatio * scaleMultiplier);
        renderer.setSize(originalWidth, originalHeight, false);

        // Render a single high-res frame
        renderer.render(scene, camera);

        // Capture it
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const url = this.canvas.toDataURL('image/png');
        this.triggerDownload(url, `symplectica-hires-${timestamp}.png`);

        // Restore original resolution
        renderer.setPixelRatio(originalPixelRatio);
        renderer.setSize(originalWidth, originalHeight, false);
    }

    private triggerDownload(url: string, filename: string): void {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
