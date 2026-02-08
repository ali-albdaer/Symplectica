/**
 * Chat UI Component
 * 
 * Simple chat panel for multiplayer communication.
 * Features:
 * - Last 10 messages displayed
 * - Auto-scroll to newest message
 * - Enter to send
 * - Toggle visibility with T key
 */

import { NetworkClient } from './network';

interface ChatMessage {
    id: number;
    sender: string;
    text: string;
    timestamp: number;
    isSystem: boolean;
}

export class Chat {
    private container: HTMLElement;
    private messageList!: HTMLElement;
    private input!: HTMLInputElement;
    private messages: ChatMessage[] = [];
    private nextId = 1;
    private network?: NetworkClient;
    private isOpen = true;
    private isFocused = false;

    private readonly MAX_MESSAGES = 10;
    private localName = `Player${Math.floor(Math.random() * 9000) + 1000}`;

    constructor(network?: NetworkClient) {
        this.network = network;
        this.container = this.createUI();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcuts();

        // Welcome message (player list will be injected on server welcome)
        this.addSystemMessage('Welcome to the chat. Type /help for a list of available commands.');
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'chat-panel';
        container.innerHTML = `
            <div class="chat-header">
                <span>💬 Chat</span>
                <button class="chat-toggle" title="Toggle (T)">−</button>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-container">
                <input type="text" id="chat-input" placeholder="Type a message..." maxlength="200">
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #chat-panel {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 350px;
                background: rgba(10, 15, 30, 0.9);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: #fff;
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 13px;
                z-index: 150;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: height 0.2s, opacity 0.2s;
            }
            
            #chat-panel.minimized {
                height: 38px !important;
            }
            
            #chat-panel.minimized .chat-messages,
            #chat-panel.minimized .chat-input-container {
                display: none;
            }
            
            .chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-weight: 500;
                cursor: pointer;
            }
            
            .chat-toggle {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 18px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }
            
            .chat-toggle:hover {
                color: #fff;
            }
            
            .chat-messages {
                height: 200px;
                overflow-y: auto;
                padding: 10px 15px;
            }
            
            .chat-message {
                margin-bottom: 8px;
                line-height: 1.4;
                word-wrap: break-word;
            }
            
            .chat-message .sender {
                font-weight: 600;
                color: #4fc3f7;
            }
            
            .chat-message.system {
                color: rgba(255, 255, 255, 0.5);
                font-style: italic;
            }
            
            .chat-message.system .sender {
                color: #ab47bc;
            }
            
            .chat-message .text {
                color: rgba(255, 255, 255, 0.9);
            }
            
            .chat-message .time {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.3);
                margin-left: 8px;
            }
            
            .chat-input-container {
                padding: 10px 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            #chat-input {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 5px;
                color: #fff;
                padding: 8px 12px;
                font-size: 13px;
            }
            
            #chat-input:focus {
                outline: none;
                border-color: #4fc3f7;
            }
            
            #chat-input::placeholder {
                color: rgba(255, 255, 255, 0.3);
            }
        `;
        document.head.appendChild(style);

        // Get references
        this.messageList = container.querySelector('#chat-messages')!;
        this.input = container.querySelector('#chat-input')!;

        // Setup event listeners
        this.setupEventListeners(container);

        return container;
    }

    private setupEventListeners(container: HTMLElement): void {
        // Toggle button
        const toggleBtn = container.querySelector('.chat-toggle');
        const header = container.querySelector('.chat-header');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        header?.addEventListener('click', () => {
            this.toggle();
        });

        // Input focus tracking
        this.input.addEventListener('focus', () => {
            this.isFocused = true;
        });

        this.input.addEventListener('blur', () => {
            this.isFocused = false;
        });

        // Send on Enter
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }

            // Prevent propagation so game controls don't trigger
            e.stopPropagation();
        });
    }

    private setupKeyboardShortcuts(): void {
        window.addEventListener('keydown', (e) => {
            if (this.isFocused) return; // Don't trigger when typing

            if (e.key === 't' || e.key === 'T') {
                this.toggle();
            }

            if (e.key === 'Enter' && this.isOpen) {
                this.input.focus();
            }
        });
    }

    toggle(): void {
        this.isOpen = !this.isOpen;
        this.container.classList.toggle('minimized', !this.isOpen);

        const btn = this.container.querySelector('.chat-toggle');
        if (btn) {
            btn.textContent = this.isOpen ? '−' : '+';
        }
    }

    private sendMessage(): void {
        const text = this.input.value.trim();
        if (!text) return;

        if (this.network?.isConnected()) {
            this.network.sendChat(this.localName, text);
        } else {
            // Add locally in offline mode
            this.addMessage({
                id: this.nextId++,
                sender: this.localName,
                text,
                timestamp: Date.now(),
                isSystem: false,
            });
            console.warn('Chat message not sent: not connected to server');
        }

        this.input.value = '';
    }

    addMessage(message: ChatMessage): void {
        this.messages.push(message);

        // Keep only last N messages
        if (this.messages.length > this.MAX_MESSAGES) {
            this.messages.shift();
        }

        this.renderMessages();
    }

    addSystemMessage(text: string): void {
        this.addMessage({
            id: this.nextId++,
            sender: 'System',
            text,
            timestamp: Date.now(),
            isSystem: true,
        });
    }

    private renderMessages(): void {
        this.messageList.innerHTML = this.messages.map(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="chat-message ${msg.isSystem ? 'system' : ''}">
                    <span class="sender">${this.escapeHtml(msg.sender)}:</span>
                    <span class="text">${this.escapeHtml(msg.text)}</span>
                    <span class="time">${time}</span>
                </div>
            `;
        }).join('');

        // Auto-scroll to bottom
        this.messageList.scrollTop = this.messageList.scrollHeight;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /** Called when receiving messages from server */
    onServerMessage(sender: string, text: string): void {
        this.addMessage({
            id: this.nextId++,
            sender,
            text,
            timestamp: Date.now(),
            isSystem: sender === 'System',
        });
    }

    setPlayersList(players: string[]): void {
        if (players.length === 0) {
            this.addSystemMessage('Current players: none');
            return;
        }
        this.addSystemMessage(`Current players: ${players.join(', ')}`);
    }

    setLocalName(name: string): void {
        const trimmed = name.trim();
        if (trimmed.length > 0) {
            this.localName = trimmed.slice(0, 20);
        }
    }
}
