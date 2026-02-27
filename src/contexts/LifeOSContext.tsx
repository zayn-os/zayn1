import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LifeOSState, UserProfile, UIState, Toast, ModalType, ViewState, LootPayload, DailyMode, Stat, Difficulty, Theme, BadgeDefinition, FocusSessionData, SystemLog, CustomAudio } from '../types/types';
import { usePersistence } from '../hooks/usePersistence';
import { requestNotificationPermission } from '../utils/notifications';
import { useThemeManager } from './hooks/useThemeManager';
import { playSound } from '../utils/audio';
import { BADGE_DATABASE } from '../data/badgeData';

// Initial User State
const initialUser: UserProfile = {
    name: 'Operative',
    title: 'Initiate',
    level: 1,
    currentXP: 0,
    targetXP: 1000,
    gold: 0,
    honor: 100,
    honorDailyLog: {},
    streak: 0,
    shields: 0,
    inventory: [],
    equippedItems: [],
    hasOnboarded: false,
    purchaseHistory: [],
    dailyXP: 0,
    dailyTarget: 500,
    currentMode: DailyMode.NORMAL,
    pendingMode: DailyMode.NORMAL,
    lastProcessedDate: new Date().toISOString(),
    consecutiveShields: 0,
    streakHistory: {},
    badges: [],
    badgeTiers: {},
    badgeHistory: {},
    featuredBadges: [],
    metrics: {
        totalTasksCompleted: 0,
        tasksByDifficulty: { [Difficulty.EASY]: 0, [Difficulty.NORMAL]: 0, [Difficulty.HARD]: 0 },
        totalRaidsWon: 0,
        raidsByDifficulty: { [Difficulty.EASY]: 0, [Difficulty.NORMAL]: 0, [Difficulty.HARD]: 0 },
        totalGoldEarned: 0,
        totalXPEarned: 0,
        highestStreak: 0,
        habitsFixed: 0,
        shieldsUsed: 0,
        resetsCount: 0
    },
    unlockedThemes: [{
        id: 'default',
        name: 'Standard Issue',
        colors: {
            '--color-life-black': '#09090b',
            '--color-life-paper': '#18181b',
            '--color-life-gold': '#eab308',
            '--color-life-text': '#fafafa',
            '--color-life-muted': '#71717a',
            '--color-life-easy': '#22c55e',
            '--color-life-hard': '#ef4444'
        }
    }],
    stats: {
        [Stat.STR]: 0, [Stat.INT]: 0, [Stat.DIS]: 0, [Stat.HEA]: 0,
        [Stat.CRT]: 0, [Stat.SPR]: 0, [Stat.REL]: 0, [Stat.FIN]: 0
    },
    lastOnline: new Date().toISOString(),
    preferences: {
        soundEnabled: true,
        deviceNotificationsEnabled: false,
        theme: 'default',
        showHighlights: true,
        showCampaignUI: true,
        unlockAllWeeks: false,
        showCalendarSync: false,
        statsViewMode: 'radar',
        dayStartHour: 4
    }
};

// Initial UI State
const initialUI: UIState = {
    currentView: 'profile',
    activeModal: 'none',
    modalQueue: [],
    toasts: [],
    systemLogs: [],
    debugDate: null,
    focusSession: null,
    habitsViewMode: 'list',
    tasksViewMode: 'missions'
};

// Context Definition
interface LifeOSContextType {
    state: LifeOSState;
    dispatch: {
        updateUser: (updates: Partial<UserProfile>) => void;
        setModal: (type: ModalType, data?: any) => void;
        closeModal: () => void;
        setView: (view: ViewState) => void;
        addToast: (message: string, type: Toast['type']) => void;
        removeToast: (id: string) => void;
        toggleSound: () => void;
        setDebugDate: (date: string | null) => void;
        setFocusSession: (session: FocusSessionData | null) => void;
        addSystemLog: (message: string, type: string) => void;
        setHabitsViewMode: (mode: 'list' | 'calendar') => void;
        setTasksViewMode: (mode: 'missions' | 'codex') => void;
        // New Methods
        completeOnboarding: (name?: string, title?: string, mainStat?: Stat) => void;
        startFocusSession: (itemId: string, durationMinutes: number, itemType: 'task' | 'habit' | 'raid_step') => void;
        endFocusSession: () => void;
        importData: (data: any) => void;
        exportData: () => void;
        resetSystem: () => void;
        triggerDailyReset: () => void;
        setCustomAudio: (audio: CustomAudio) => void;
        setDayStartHour: (hour: number) => void;
        setTheme: (themeId: string) => void;
        addTheme: (theme: Theme) => void;
        useItem: (itemId: string) => void;
        toggleEquip: (itemId: string) => void;
        togglePreference: (key: keyof UserProfile['preferences']) => void;
    };
}

const LifeOSContext = createContext<LifeOSContextType | undefined>(undefined);

// Helper to deep merge user data with initial state
const migrateUser = (data: any): UserProfile => {
    if (!data) return initialUser;
    return {
        ...initialUser,
        ...data,
        preferences: { 
            ...initialUser.preferences, 
            ...(data.preferences || {}) 
        },
        stats: { 
            ...initialUser.stats, 
            ...(data.stats || {}) 
        },
        metrics: { 
            ...initialUser.metrics, 
            ...(data.metrics || {}) 
        },
        // Ensure arrays are preserved if they exist, otherwise use initial
        inventory: data.inventory || initialUser.inventory,
        badges: data.badges || initialUser.badges,
        unlockedThemes: data.unlockedThemes || initialUser.unlockedThemes,
    };
};

export const LifeOSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Persistence for User Profile with Migration Strategy
    const [user, setUser] = usePersistence<UserProfile>('user_profile', initialUser, 'profile', migrateUser);
    
    // Local UI State
    const [ui, setUI] = useState<UIState>(initialUI);

    // Combine State
    const state: LifeOSState = {
        user,
        badgesRegistry: BADGE_DATABASE,
        ui
    };

    // Theme Manager Hook
    useThemeManager(state);

    // Dispatch Methods
    const updateUser = (updates: Partial<UserProfile>) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    const setModal = (type: ModalType, data?: any) => {
        setUI(prev => ({ ...prev, activeModal: type, modalData: data }));
        playSound('click', user.preferences.soundEnabled);
    };

    const closeModal = () => {
        setUI(prev => ({ ...prev, activeModal: 'none', modalData: undefined }));
    };

    const setView = (view: ViewState) => {
        setUI(prev => ({ ...prev, currentView: view }));
        playSound('click', user.preferences.soundEnabled);
    };

    const addToast = (message: string, type: Toast['type']) => {
        const id = Date.now().toString();
        setUI(prev => ({ ...prev, toasts: [...prev.toasts, { id, message, type }] }));
        
        // Auto-remove toast
        setTimeout(() => {
            setUI(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
        }, 3000);
    };

    const removeToast = (id: string) => {
        setUI(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
    };

    const toggleSound = () => {
        updateUser({ preferences: { ...user.preferences, soundEnabled: !user.preferences.soundEnabled } });
    };

    const setDebugDate = (date: string | null) => {
        setUI(prev => ({ ...prev, debugDate: date }));
    };

    const setFocusSession = (session: FocusSessionData | null) => {
        setUI(prev => ({ ...prev, focusSession: session }));
    };

    const addSystemLog = (message: string, type: string) => {
        const newLog: SystemLog = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date().toISOString()
        };
        setUI(prev => ({ ...prev, systemLogs: [newLog, ...prev.systemLogs].slice(0, 50) }));
    };

    const setHabitsViewMode = (mode: 'list' | 'calendar') => {
        setUI(prev => ({ ...prev, habitsViewMode: mode }));
    };

    const setTasksViewMode = (mode: 'missions' | 'codex') => {
        setUI(prev => ({ ...prev, tasksViewMode: mode }));
    };

    // 🆕 MISSING METHODS IMPLEMENTATION
    const completeOnboarding = (name?: string, title?: string, mainStat?: Stat) => {
        updateUser({ 
            hasOnboarded: true,
            name: name || user.name,
            title: title || user.title,
        });
        if (mainStat) {
             updateUser({ stats: { ...user.stats, [mainStat]: 5 } }); 
        }
    };

    const startFocusSession = (itemId: string, durationMinutes: number, itemType: 'task' | 'habit' | 'raid_step') => {
        setFocusSession({
            itemId,
            itemType,
            startTime: new Date().toISOString(),
            durationMinutes,
            isActive: true
        });
    };

    const endFocusSession = () => {
        setFocusSession(null);
    };

    const importData = (data: any) => {
        if (data.user) {
            setUser(data.user);
            addToast('Data Imported Successfully', 'success');
        } else {
            addToast('Invalid Data Format', 'error');
        }
    };

    const exportData = () => {
        const data = {
            user,
            timestamp: new Date().toISOString(),
            version: '2.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifeos_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const resetSystem = () => {
        setUser(initialUser);
        addToast('System Reset Complete', 'crit');
    };

    const triggerDailyReset = () => {
        // Logic for daily reset (simplified for now)
        const now = new Date();
        updateUser({
            dailyXP: 0,
            lastProcessedDate: now.toISOString(),
            honorDailyLog: { ...user.honorDailyLog, [now.toISOString().split('T')[0]]: 100 }
        });
        addToast('Daily Reset Triggered', 'info');
    };

    const setCustomAudio = (audio: CustomAudio) => {
        setUI(prev => ({ ...prev, customAudio: audio }));
    };

    const setDayStartHour = (hour: number) => {
        updateUser({ preferences: { ...user.preferences, dayStartHour: hour } });
    };

    const setTheme = (themeId: string) => {
        updateUser({ preferences: { ...user.preferences, theme: themeId } });
    };

    const addTheme = (theme: Theme) => {
        if (!user.unlockedThemes.find(t => t.id === theme.id)) {
            updateUser({ unlockedThemes: [...user.unlockedThemes, theme] });
            addToast(`Theme Unlocked: ${theme.name}`, 'success');
        }
    };

    const useItem = (itemId: string) => {
        // Placeholder for item usage logic
        const newInventory = user.inventory.filter(i => i !== itemId); // Remove one instance? Or just use?
        // Assuming simple consumption for now
        // In a real app, we'd check item type and apply effects
        updateUser({ inventory: newInventory });
        addToast('Item Used', 'info');
    };

    const toggleEquip = (itemId: string) => {
        const isEquipped = user.equippedItems.includes(itemId);
        let newEquipped = [...user.equippedItems];
        
        if (isEquipped) {
            newEquipped = newEquipped.filter(id => id !== itemId);
        } else {
            if (newEquipped.length < 3) {
                newEquipped.push(itemId);
            } else {
                addToast('Max 3 items equipped', 'error');
                return;
            }
        }
        updateUser({ equippedItems: newEquipped });
    };

    const togglePreference = async (key: keyof UserProfile['preferences']) => {
        if (key === 'deviceNotificationsEnabled' && !user.preferences.deviceNotificationsEnabled) {
            const granted = await requestNotificationPermission();
            updateUser({ preferences: { ...user.preferences, deviceNotificationsEnabled: granted } });
            addToast(granted ? 'Notifications Enabled' : 'Permission Denied', granted ? 'success' : 'error');
            return;
        }
        updateUser({ preferences: { ...user.preferences, [key]: !user.preferences[key] } });
    };

    return (
        <LifeOSContext.Provider value={{
            state,
            dispatch: {
                updateUser,
                setModal,
                closeModal,
                setView,
                addToast,
                removeToast,
                toggleSound,
                setDebugDate,
                setFocusSession,
                addSystemLog,
                setHabitsViewMode,
                setTasksViewMode,
                // New Methods
                completeOnboarding,
                startFocusSession,
                endFocusSession,
                importData,
                exportData,
                resetSystem,
                triggerDailyReset,
                setCustomAudio,
                setDayStartHour,
                setTheme,
                addTheme,
                useItem,
                toggleEquip,
                togglePreference
            }
        }}>
            {children}
        </LifeOSContext.Provider>
    );
};

export const useLifeOS = () => {
    const context = useContext(LifeOSContext);
    if (context === undefined) {
        throw new Error('useLifeOS must be used within a LifeOSProvider');
    }
    return context;
};
