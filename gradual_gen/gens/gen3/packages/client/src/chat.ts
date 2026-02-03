/**
 * Chat system
 */

type SendHandler = (message: string) => void;

export class Chat {
    private logEl: HTMLElement;
    private inputEl: HTMLInputElement;
    private sendHandlers: SendHandler[] = [];

    constructor() {
        this.logEl = document.getElementById('chat-log')!;
        this.inputEl = document.getElementById('chat-input') as HTMLInputElement;

        this.setupInput();
    }

    private setupInput(): void {
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const message = this.inputEl.value.trim();
                if (message.length > 0) {
                    this.sendHandlers.forEach((handler) => handler(message));
                    this.inputEl.value = '';
                }
            }

            // Prevent game input while typing
            e.stopPropagation();
        });

        // Focus chat on Enter key (when not already focused)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement !== this.inputEl) {
                e.preventDefault();
                this.inputEl.focus();
            }
        });
    }

    addSystem(message: string): void {
        this.addMessage('chat-system', '[SYSTEM]', message);
    }

    addPlayer(playerName: string, message: string): void {
        this.addMessage('chat-player', `[${playerName}]`, message);
    }

    private addMessage(className: string, prefix: string, message: string): void {
        const line = document.createElement('div');
        
        const prefixSpan = document.createElement('span');
        prefixSpan.className = className;
        prefixSpan.textContent = prefix + ' ';
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'chat-message';
        messageSpan.textContent = message;
        
        line.appendChild(prefixSpan);
        line.appendChild(messageSpan);
        
        this.logEl.appendChild(line);

        // Auto-scroll to bottom
        this.logEl.scrollTop = this.logEl.scrollHeight;

        // Limit log size
        while (this.logEl.childElementCount > 100) {
            this.logEl.removeChild(this.logEl.firstChild!);
        }
    }

    onSend(handler: SendHandler): void {
        this.sendHandlers.push(handler);
    }

    clear(): void {
        this.logEl.innerHTML = '';
    }
}
