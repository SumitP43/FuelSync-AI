// Chat functionality for FuelSync-AI
class ChatManager {
  constructor() {
    this.messages = [];
    this.isTyping = false;
  }

  addMessage(role, content) {
    const msg = { role, content, timestamp: new Date() };
    this.messages.push(msg);
    this.renderMessage(msg);
    this.scrollToBottom();
    return msg;
  }

  renderMessage(msg) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    // Remove typing indicator if present
    const typing = container.querySelector('.typing-indicator-wrapper');
    if (typing) typing.remove();

    const div = document.createElement('div');
    div.className = `chat-bubble ${msg.role} fade-in`;
    div.textContent = msg.content;

    const time = document.createElement('div');
    time.style.cssText = 'font-size:0.7rem;color:var(--text-muted);margin-top:4px;text-align:right';
    time.textContent = msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    div.appendChild(time);

    container.appendChild(div);
  }

  showTyping() {
    const container = document.getElementById('chat-messages');
    if (!container || this.isTyping) return;
    this.isTyping = true;
    const div = document.createElement('div');
    div.className = 'chat-bubble assistant typing-indicator-wrapper';
    div.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    container.appendChild(div);
    this.scrollToBottom();
  }

  hideTyping() {
    this.isTyping = false;
    const indicator = document.getElementById('chat-messages')?.querySelector('.typing-indicator-wrapper');
    if (indicator) indicator.remove();
  }

  scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) container.scrollTop = container.scrollHeight;
  }

  async sendMessage(text) {
    if (!text.trim()) return;

    const input = document.getElementById('chat-input');
    if (input) input.value = '';

    this.addMessage('user', text);
    this.showTyping();

    try {
      const result = await api.sendChatMessage(text);
      this.hideTyping();
      if (result?.response) {
        this.addMessage('assistant', result.response);
      }
    } catch (err) {
      this.hideTyping();
      if (err.message.includes('credentials') || err.message.includes('401')) {
        this.addMessage('assistant', 'Please log in to use the AI assistant.');
      } else {
        this.addMessage('assistant', `Sorry, I couldn't process that. (${err.message})`);
      }
    }
  }

  async loadHistory() {
    try {
      const result = await api.getChatHistory();
      if (result?.history?.length) {
        const container = document.getElementById('chat-messages');
        if (container) container.innerHTML = '';
        this.messages = [];
        [...result.history].reverse().forEach(msg => {
          this.addMessage('user', msg.message);
          if (msg.response) this.addMessage('assistant', msg.response);
        });
      }
    } catch { /* history unavailable — silently ignore */ }
  }

  clear() {
    this.messages = [];
    const container = document.getElementById('chat-messages');
    if (container) container.innerHTML = '';
    api.clearChatHistory().catch(() => {});
  }

  init() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const clearBtn = document.getElementById('chat-clear');

    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(input.value); }
      });
    }
    if (sendBtn) sendBtn.addEventListener('click', () => input && this.sendMessage(input.value));
    if (clearBtn) clearBtn.addEventListener('click', () => this.clear());

    // Welcome message
    this.addMessage('assistant', '👋 Hi! I\'m FuelSync AI. Ask me about nearby CNG pumps, current crowd levels, prices, or tips for CNG vehicles!');
  }
}

const chatManager = new ChatManager();
