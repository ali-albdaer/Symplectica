import { describe, it, expect } from 'vitest';
import {
    UI_COLORS,
    UI_ACCENT_PRIMARY,
    UI_STATUS_GOOD,
    UI_PANEL_BG,
    UI_CSS_VARIABLES,
} from '../../../shared/constants';

describe('UI Colors System', () => {
    it('provides valid accent, surface, text, status, and label color palettes', () => {
        expect(UI_COLORS.accent.primary).toBe('#18e7ec');
        expect(UI_COLORS.accent.secondary).toBe('#55CCCC');
        expect(UI_COLORS.surface.panelBg).toBe('rgba(33, 39, 49, 0.95)');
        expect(UI_COLORS.text.primary).toBe('#ededed');
        expect(UI_COLORS.status.good).toBe('#4caf50');
        expect(UI_COLORS.labels.star).toBe('#fff8e7');
    });

    it('exports top-level convenience constants consistent with UI_COLORS', () => {
        expect(UI_ACCENT_PRIMARY).toBe(UI_COLORS.accent.primary);
        expect(UI_STATUS_GOOD).toBe(UI_COLORS.status.good);
        expect(UI_PANEL_BG).toBe(UI_COLORS.surface.panelBg);
    });

    it('defines CSS variable mappings for runtime stylesheet injection', () => {
        expect(UI_CSS_VARIABLES['--ui-accent-primary']).toBe('#18e7ec');
        expect(UI_CSS_VARIABLES['--ui-panel-bg']).toBe('rgba(33, 39, 49, 0.95)');
        expect(UI_CSS_VARIABLES['--ui-text-primary']).toBe('#ededed');
        expect(UI_CSS_VARIABLES['--ui-status-good']).toBe('#4caf50');
    });
});
