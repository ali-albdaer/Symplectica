/**
 * Canonical UI Color Design System for Symplectica
 * 
 * Centralized, strongly typed UI color palette used across all HUD overlays,
 * control panels, buttons, feedback indicators, and mobile UI elements.
 */

export const UI_COLORS = {
    /** Accent & Brand Highlights */
    accent: {
        primary: '#18e7ec',
        primaryHover: '#47eff3',
        primaryMuted: 'rgba(24, 231, 236, 0.6)',
        secondary: '#55CCCC',
        link: '#18e7ec',
        spawnGradientStart: '#18e7ec',
        spawnGradientEnd: '#0eabaf',
        spawnGradientHoverStart: '#47eff3',
        spawnGradientHoverEnd: '#12c4c8',
    },

    /** Surface & Container Backgrounds / Glassmorphism */
    surface: {
        panelBg: 'rgba(33, 39, 49, 0.95)',
        headerBg: 'rgba(57, 62, 70, 0.5)',
        inputBg: 'rgba(57, 62, 70, 0.6)',
        inputBgAlt: 'rgba(57, 62, 70, 0.8)',
        selectOptionBg: '#212731',
        buttonBg: 'rgba(57, 62, 70, 0.4)',
        buttonHoverBg: 'rgba(57, 62, 70, 0.7)',
        cardBorder: 'rgba(237, 237, 237, 0.12)',
        cardBorderSubtle: 'rgba(237, 237, 237, 0.06)',
        inputBorder: 'rgba(237, 237, 237, 0.18)',
        panelShadow: 'rgba(0, 0, 0, 0.5)',
    },

    /** Typography & Text Colors */
    text: {
        primary: '#ededed',
        highContrast: '#ffffff',
        secondary: 'rgba(237, 237, 237, 0.85)',
        muted: 'rgba(237, 237, 237, 0.7)',
        subtle: 'rgba(237, 237, 237, 0.6)',
        disabled: 'rgba(237, 237, 237, 0.5)',
        hint: 'rgba(237, 237, 237, 0.4)',
    },

    /** Status & Health/Drift Indicators */
    status: {
        good: '#4caf50',
        excellent: '#8bc34a',
        warn: '#ffeb3b',
        paused: '#ff9800',
        critical: '#f44336',
        error: '#ff5252',
        dangerBg: 'rgba(255, 0, 0, 0.1)',
        dangerBorder: 'rgba(255, 107, 107, 0.6)',
        dangerText: '#ffe6e6',
        dangerHoverBg: 'rgba(255, 107, 107, 0.2)',
        dangerBtnBorderSubtle: 'rgba(255, 107, 107, 0.3)',
    },

    /** In-Scene HUD Body & Celestial Labels */
    labels: {
        default: '#ededed',
        star: '#fff8e7',
        moon: '#b0c4de',
        shadow: 'rgba(0, 0, 0, 1.0)',
    },

    /** On-Screen Touch Controls */
    touch: {
        btnGradientStart: 'rgba(33, 39, 49, 0.9)',
        btnGradientEnd: 'rgba(57, 62, 70, 0.9)',
        btnGradientActiveStart: 'rgba(57, 62, 70, 0.95)',
        btnGradientActiveEnd: 'rgba(85, 204, 204, 0.8)',
        btnGradientHoverStart: 'rgba(40, 48, 60, 0.9)',
        btnGradientHoverEnd: 'rgba(65, 72, 82, 0.9)',
        btnBorder: 'rgba(24, 231, 236, 0.35)',
        btnShadow: 'rgba(0, 0, 0, 0.4)',
    },

    /** Mobile Modal Prompt */
    mobile: {
        promptBgStart: 'rgba(33, 39, 49, 0.95)',
        promptBgEnd: 'rgba(25, 30, 38, 0.95)',
        promptBorder: 'rgba(24, 231, 236, 0.35)',
        primaryBtnStart: '#18e7ec',
        primaryBtnEnd: '#0eabaf',
        secondaryBtnBg: 'rgba(57, 62, 70, 0.4)',
        secondaryBtnBorder: 'rgba(237, 237, 237, 0.2)',
        secondaryBtnActiveBg: 'rgba(57, 62, 70, 0.7)',
    },
} as const;

export type UIColorPalette = typeof UI_COLORS;

// Export direct top-level convenience constants for high-frequency access
export const UI_ACCENT_PRIMARY = UI_COLORS.accent.primary;
export const UI_ACCENT_PRIMARY_HOVER = UI_COLORS.accent.primaryHover;
export const UI_ACCENT_SECONDARY = UI_COLORS.accent.secondary;
export const UI_PANEL_BG = UI_COLORS.surface.panelBg;
export const UI_CARD_BORDER = UI_COLORS.surface.cardBorder;
export const UI_TEXT_PRIMARY = UI_COLORS.text.primary;
export const UI_TEXT_MUTED = UI_COLORS.text.muted;
export const UI_STATUS_GOOD = UI_COLORS.status.good;
export const UI_STATUS_WARN = UI_COLORS.status.warn;
export const UI_STATUS_PAUSED = UI_COLORS.status.paused;
export const UI_STATUS_CRITICAL = UI_COLORS.status.critical;

/** Mapping of CSS custom variables to UI_COLORS for stylesheet injection */
export const UI_CSS_VARIABLES = {
    '--ui-accent-primary': UI_COLORS.accent.primary,
    '--ui-accent-primary-hover': UI_COLORS.accent.primaryHover,
    '--ui-accent-primary-muted': UI_COLORS.accent.primaryMuted,
    '--ui-accent-secondary': UI_COLORS.accent.secondary,
    '--ui-accent-link': UI_COLORS.accent.link,
    '--ui-panel-bg': UI_COLORS.surface.panelBg,
    '--ui-header-bg': UI_COLORS.surface.headerBg,
    '--ui-input-bg': UI_COLORS.surface.inputBg,
    '--ui-input-bg-alt': UI_COLORS.surface.inputBgAlt,
    '--ui-select-option-bg': UI_COLORS.surface.selectOptionBg,
    '--ui-button-bg': UI_COLORS.surface.buttonBg,
    '--ui-button-hover-bg': UI_COLORS.surface.buttonHoverBg,
    '--ui-card-border': UI_COLORS.surface.cardBorder,
    '--ui-card-border-subtle': UI_COLORS.surface.cardBorderSubtle,
    '--ui-input-border': UI_COLORS.surface.inputBorder,
    '--ui-text-primary': UI_COLORS.text.primary,
    '--ui-text-high-contrast': UI_COLORS.text.highContrast,
    '--ui-text-secondary': UI_COLORS.text.secondary,
    '--ui-text-muted': UI_COLORS.text.muted,
    '--ui-text-subtle': UI_COLORS.text.subtle,
    '--ui-text-disabled': UI_COLORS.text.disabled,
    '--ui-text-hint': UI_COLORS.text.hint,
    '--ui-status-good': UI_COLORS.status.good,
    '--ui-status-excellent': UI_COLORS.status.excellent,
    '--ui-status-warn': UI_COLORS.status.warn,
    '--ui-status-paused': UI_COLORS.status.paused,
    '--ui-status-critical': UI_COLORS.status.critical,
    '--ui-status-error': UI_COLORS.status.error,
    '--ui-label-default': UI_COLORS.labels.default,
    '--ui-label-star': UI_COLORS.labels.star,
    '--ui-label-moon': UI_COLORS.labels.moon,
} as const;
