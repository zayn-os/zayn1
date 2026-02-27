import React, { useState, useEffect } from 'react';
import { useLifeOS } from '../../../../contexts/LifeOSContext';
import { useShop } from '../../../../contexts/ShopContext';
import { useSkills } from '../../../../contexts/SkillContext';
import { useTasks } from '../../../../contexts/TaskContext';
import { useHabits } from '../../../../contexts/HabitContext';
import { useRaids } from '../../../../contexts/RaidContext';
import { useCampaign } from '../../../../contexts/CampaignContext';
import { auth } from '../../../../firebase';
import { GoogleAuthProvider, signInWithPopup, linkWithPopup, User as FirebaseUser } from 'firebase/auth';
import { SettingsSection } from '../../../views/profile/SettingsSection';
import { Clock, Volume2, Calendar, FileText, Bell, Zap, Code, Eye, BookOpen, Shield, Sword, Layout, Settings } from 'lucide-react';

const renderToggle = (label: string, icon: React.ReactNode, prefKey: any, dispatch: any, state: any) => {
    const preferences = state.user?.preferences || {};
    const isActive = preferences[prefKey];
    return (
        <button 
            onClick={() => dispatch.togglePreference(prefKey)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-life-black border border-life-muted/10 hover:border-life-gold/30 transition-all group"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-life-gold/10 text-life-gold' : 'bg-life-muted/10 text-life-muted'}`}>
                    {icon}
                </div>
                <span className="text-xs font-bold text-life-text uppercase tracking-wide">{label}</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isActive ? 'bg-life-gold' : 'bg-life-muted/20'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${isActive ? 'left-6' : 'left-1'}`} />
            </div>
        </button>
    );
};

const ManualCard: React.FC<{ title: string, icon: React.ReactNode, onClick: () => void, color?: string }> = ({ title, icon, onClick, color = "text-life-gold" }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 rounded-xl bg-life-black border border-life-muted/10 hover:border-life-gold/30 hover:bg-life-gold/5 transition-all gap-3 group"
    >
        <div className={`p-3 rounded-full bg-life-muted/5 group-hover:bg-life-gold/10 transition-colors ${color}`}>
            {icon}
        </div>
        <span className="text-[10px] font-bold text-life-muted group-hover:text-life-text uppercase tracking-wider text-center leading-tight">
            {title}
        </span>
    </button>
);

export const SystemTab: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { shopState } = useShop();
    const { skillState } = useSkills();
    const { taskState } = useTasks();
    const { habitState } = useHabits();
    const { raidState } = useRaids();
    const { campaignState } = useCampaign();
    
    const { user } = state;

    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(u => setCurrentUser(u));
        return () => unsubscribe();
    }, []);

    const handleExport = () => {
        const fullBackup = {
            user: state.user,
            badgesRegistry: state.badgesRegistry,
            ui: { ...state.ui, activeModal: 'none', modalData: null },
            tasks: taskState.tasks,
            taskCategories: taskState.categories,
            laws: taskState.laws,
            habits: habitState.habits,
            habitCategories: habitState.categories,
            raids: raidState.raids,
            skills: skillState.skills,
            storeItems: shopState.storeItems,
            campaign: campaignState.campaign,
            meta: {
                timestamp: new Date().toISOString(),
                version: "2.0",
                type: "full_backup"
            }
        };

        const dataStr = JSON.stringify(fullBackup, null, 2);
        dispatch.setModal('dataExchange', { 
            mode: 'export', 
            title: 'System Backup', 
            data: dataStr 
        });
    };

    const handleImport = () => {
        dispatch.setModal('dataExchange', { 
            mode: 'import', 
            title: 'System Uplink'
        });
    };

    const handleForceSleep = () => {
        dispatch.triggerDailyReset();
        dispatch.addToast('System Cycle Reset Initiated', 'success');
    };

    const handleGoogleLink = async () => {
        const provider = new GoogleAuthProvider();
        try {
            if (currentUser) {
                if (currentUser.isAnonymous) {
                    await linkWithPopup(currentUser, provider);
                    dispatch.addToast('Account Linked Successfully', 'success');
                } else {
                    dispatch.addToast('Already Connected', 'info');
                }
            } else {
                await signInWithPopup(auth, provider);
                dispatch.addToast('Neural Link Established', 'success');
            }
        } catch (error: any) {
            console.error("Link Error:", error);
            dispatch.addToast(error.message || 'Link Failed', 'error');
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            dispatch.addToast('Neural Link Severed', 'info');
        } catch (error: any) {
            console.error("Logout Error:", error);
            dispatch.addToast('Logout Failed', 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 pb-10">
            {/* 🟢 ACCOUNT & DATA SECTION */}
            <SettingsSection 
                user={user}
                dispatch={dispatch}
                onForceSleep={handleForceSleep}
                onExport={handleExport}
                onImport={handleImport}
                currentUser={currentUser}
                onLogin={handleGoogleLink}
                onLogout={handleLogout}
            />

            {/* 🟢 SYSTEM CONFIGURATION */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Settings size={14} className="text-life-gold" />
                    <h3 className="text-[10px] font-black text-life-muted uppercase tracking-widest">System Configuration</h3>
                </div>

                <div className="grid gap-3">
                    {/* Day Start Selector */}
                    <div className="w-full flex items-center justify-between p-3 rounded-xl bg-life-black border border-life-muted/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-life-muted/10 text-life-gold">
                                <Clock size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-life-text uppercase tracking-wide">Day Start Hour</span>
                                <span className="text-[9px] text-life-muted">When the daily cycle resets</span>
                            </div>
                        </div>
                        <div className="relative">
                            <select 
                                value={state.user.preferences.dayStartHour ?? 4} 
                                onChange={(e) => dispatch.setDayStartHour(parseInt(e.target.value))}
                                className="appearance-none bg-life-paper border border-life-muted/20 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-life-gold outline-none focus:border-life-gold/50 transition-colors cursor-pointer"
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-life-muted">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {renderToggle("Sound Effects", <Volume2 size={16} />, "soundEnabled", dispatch, state)}
                    {renderToggle("Push Notifications", <Bell size={16} />, "deviceNotificationsEnabled", dispatch, state)}
                    {renderToggle("Calendar Sync", <Calendar size={16} />, "showCalendarSync", dispatch, state)}
                    {renderToggle("History Logs", <FileText size={16} />, "copyIncludesHistory", dispatch, state)}
                </div>
            </div>

            {/* 🟢 MODULE TOGGLES */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Layout size={14} className="text-life-gold" />
                    <h3 className="text-[10px] font-black text-life-muted uppercase tracking-widest">Interface Modules</h3>
                </div>
                <div className="grid gap-3">
                    {renderToggle("Spear Tip (Highlights)", <Zap size={16} />, "showHighlights", dispatch, state)}
                    {renderToggle("Campaign Module", <Code size={16} />, "showCampaignUI", dispatch, state)}
                    {renderToggle("Horus Eye (God Mode)", <Eye size={16} />, "unlockAllWeeks", dispatch, state)}
                </div>
            </div>

            {/* 🟢 MANUALS GRID */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <BookOpen size={14} className="text-life-gold" />
                    <h3 className="text-[10px] font-black text-life-muted uppercase tracking-widest">System Manuals</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <ManualCard 
                        title="Habit Protocol" 
                        icon={<Shield size={20} />} 
                        onClick={() => dispatch.setModal('manual', { manualId: 'habits' })} 
                    />
                    <ManualCard 
                        title="Task & Codex" 
                        icon={<CheckCircle size={20} />} 
                        onClick={() => dispatch.setModal('manual', { manualId: 'tasks' })} 
                    />
                    <ManualCard 
                        title="Raid Operations" 
                        icon={<Sword size={20} />} 
                        onClick={() => dispatch.setModal('manual', { manualId: 'raids' })} 
                        color="text-life-crimson"
                    />
                    <ManualCard 
                        title="Interface Guide" 
                        icon={<Layout size={20} />} 
                        onClick={() => dispatch.setModal('manual', { manualId: 'ui' })} 
                    />
                </div>
            </div>
        </div>
    );
};

// Helper component for manual card icon
import { CheckCircle } from 'lucide-react';