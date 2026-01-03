export const Logger = {
    log: (msg) => {
        console.log(msg);
    },
    error: (msg) => {
        console.error(msg);
        const errorContainer = document.getElementById('error-log');
        if (errorContainer) {
            errorContainer.classList.remove('hidden');
            const div = document.createElement('div');
            div.textContent = `[ERROR] ${msg}`;
            div.style.color = '#ffaaaa';
            div.style.marginBottom = '5px';
            errorContainer.appendChild(div);
        }
    }
};

export const MathUtils = {
    // Clamp value between min and max
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    
    // Linear interpolation
    lerp: (start, end, t) => start * (1 - t) + end * t
};
