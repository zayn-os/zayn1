import React from 'react';
import { useLifeOS } from '../contexts/LifeOSContext';
import { Stat } from '../types/types';

/**
 * Hook to retrieve the current theme's icon override for a given key.
 * If no override exists, it returns the default fallback (usually a React Node or string).
 */
export const useThemeIcon = () => {
    const { state } = useLifeOS();
    const currentThemeId = state.user.preferences.theme;
    const theme = state.user.unlockedThemes.find(t => t.id === currentThemeId);

    const getIcon = (key: string, fallback: React.ReactNode): React.ReactNode => {
        if (theme?.icons && theme.icons[key]) {
            return <span className="emoji-icon">{theme.icons[key]}</span>;
        }
        return fallback;
    };

    return { getIcon };
};
