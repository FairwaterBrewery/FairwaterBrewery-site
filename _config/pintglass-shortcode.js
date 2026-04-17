export default function pintGlassShortcode(colour, width, height) {

    if(colour == null || colour == "") return "";

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    let idSuffix = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        idSuffix += chars[randomIndex];
    }

    return `<svg width="${width}" height="${height}" viewBox="0 0 180 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Glass outline -->
        <defs>
            <!-- Glass gradient -->
            <linearGradient id="glassGradient-${idSuffix}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(255,255,255,0.4)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0.1)" />
            </linearGradient>

            <!-- Beer gradient -->
            <linearGradient id="beerGradient-${idSuffix}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--${colour})" />
                <stop offset="100%" stop-color="var(--${colour})" />
            </linearGradient>

            <!-- Foam gradient -->
            <radialGradient id="foamGradient-${idSuffix}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff" />
                <stop offset="100%" stop-color="#f0f0f0" />
            </radialGradient>
        </defs>

        <!-- Beer liquid -->
        <path d="M35 40 L145 40 L132 185 L48 185 Z"
            fill="url(#beerGradient-${idSuffix})" />

        <!-- Glass shape -->
        <path d="M25 10 L155 10 L140 190 L40 190 Z"
            fill="url(#glassGradient-${idSuffix})" stroke="#666" stroke-width="1" stroke-linejoin="round" />

        <!-- Foam head -->
        <ellipse cx="90" cy="40" rx="55" ry="12" fill="url(#foamGradient-${idSuffix})" stroke="white" stroke-width="1" />
    </svg>`;
}