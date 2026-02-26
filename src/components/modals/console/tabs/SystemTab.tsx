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
import { Clock, Volume2, Calendar, FileText, Bell, Zap, Code, Eye } from 'lucide-react';

const renderToggle = (label: string, icon: React.ReactNode, prefKey: any, dispatch: any, state: any) => {
    const isActive = state.user.preferences[prefKey];
    return (
        <button 
            onClick={() => dispatch.togglePreference(prefKey)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-life-black border border-life-muted/20 hover:border-life-gold/50 transition-all group"
        >
            <div className="flex items-center gap-3">
                <div className={isActive ? 'text-life-gold' : 'text-life-muted'}>{icon}</div>
                <span className="text-[10px] font-bold text-life-text uppercase tracking-wider">{label}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isActive ? 'bg-life-gold' : 'bg-life-muted/30'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isActive ? 'left-4.5' : 'left-0.5'}`} />
            </div>
        </button>
    );
};

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
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 pb-10">
            {/* 🟢 SETTINGS SECTION */}
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

            <div className="h-px bg-life-muted/10 my-4" />

            <div className="p-3 bg-life-gold/5 border border-life-gold/10 rounded text-[9px] text-life-gold/70 uppercase font-bold tracking-widest">
                Core System Toggles & Calibration
            </div>

            <div className="w-full flex items-center justify-between p-3 rounded-lg bg-life-black border border-life-muted/20">
                <div className="flex items-center gap-3">
                    <Clock size={16} className="text-life-gold" />
                    <span className="text-[10px] font-bold uppercase text-life-text">Day Start (Reset Hour)</span>
                </div>
                <select 
                    value={state.user.preferences.dayStartHour ?? 4} 
                    onChange={(e) => dispatch.setDayStartHour(parseInt(e.target.value))}
                    className="bg-black border border-life-gold/30 rounded px-2 py-1 text-xs font-mono font-bold text-life-gold outline-none"
                >
                    {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                {renderToggle("Neural Feedback (Sound)", <Volume2 size={16} />, "soundEnabled", dispatch, state)}
                {renderToggle("Google Calendar Sync", <Calendar size={16} />, "showCalendarSync", dispatch, state)}
                {renderToggle("AI Context: History Logs", <FileText size={16} />, "copyIncludesHistory", dispatch, state)}
                {renderToggle("System Alerts (Push)", <Bell size={16} />, "deviceNotificationsEnabled", dispatch, state)}
            </div>

            <div className="h-px bg-life-muted/10 my-2" />

            <div className="space-y-2">
                {renderToggle("Show Spear Tip (Highlights)", <Zap size={16} />, "showHighlights", dispatch, state)}
                {renderToggle("Campaign Module UI", <Code size={16} />, "showCampaignUI", dispatch, state)}
                {renderToggle("Horus Eye (Unlock Weeks)", <Eye size={16} />, "unlockAllWeeks", dispatch, state)}
            </div>
        </div>
    );
};