
import React, { useState, useEffect } from 'react';
import { Download, Upload, Skull, ShieldCheck, Database, RefreshCw, FileText, Share2, Smartphone, Brain, Activity, Coins, Star, ShoppingCart, Scale, Bell, Archive, LogOut, Zap, ChevronRight } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../../../types/types';
import { usePWAInstall } from '../../../hooks/usePWAInstall';
import { useSkills } from '../../../contexts/SkillContext';
import { requestNotificationPermission, sendAlert } from '../../../utils/notifications';
import { downloadSourceCode } from '../../../utils/downloadSource';

interface SettingsSectionProps {
    user: UserProfile;
    dispatch: any;
    onExport: () => void;
    onImport: () => void;
    onForceSleep: () => void;
    currentUser: FirebaseUser | null;
    onLogin: () => void;
    onLogout: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
    user, dispatch, onExport, onImport, onForceSleep, currentUser, onLogin, onLogout
}) => {
    const { isInstallable, promptInstall } = usePWAInstall();
    const { skillState } = useSkills();
    const [verificationCode, setVerificationCode] = useState('');
    const [projectStats, setProjectStats] = useState<{ totalLines: number; fileCount: number } | null>(null);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setProjectStats(data))
            .catch(err => console.error("Failed to fetch stats", err));
    }, []);

    const handleTitleOverrideToggle = () => {
        dispatch.togglePreference('useSkillAsTitle');
    };

    const handleSkillLink = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const skillId = e.target.value;
        dispatch.updateUser({ preferences: { ...user.preferences, linkedSkillId: skillId } });
    };

    return (
        <div className="space-y-4">

            {/* 🟢 NEURAL LINK (ACCOUNT) */}
            <div className="bg-life-black border border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className={currentUser ? "text-life-easy" : "text-life-muted"} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-life-muted">Neural Link</h3>
                </div>

                {currentUser ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-life-paper rounded-lg border border-life-easy/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-life-easy/10 flex items-center justify-center text-life-easy">
                                    <ShieldCheck size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-life-text">Link Active</p>
                                    <p className="text-[9px] text-life-muted">{currentUser.email}</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition-all text-xs font-bold uppercase tracking-wider"
                        >
                            <LogOut size={14} /> Sever Link (Logout)
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={onLogin}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-life-black border border-zinc-700 hover:border-life-gold/50 hover:bg-life-gold/5 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-life-muted/10 flex items-center justify-center text-life-muted group-hover:text-life-gold transition-colors">
                                <Zap size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-life-text group-hover:text-life-gold transition-colors">Connect Google Account</p>
                                <p className="text-[9px] text-life-muted">Sync across devices</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-life-muted group-hover:text-life-gold" />
                    </button>
                )}
            </div>
            
            {/* 👑 NEW: TITLE OVERRIDE */}
            <div className="bg-life-black border border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-life-muted" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-life-muted">Title Override</h3>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between p-3 bg-life-paper rounded-lg border border-zinc-800">
                    <label htmlFor="title-override-toggle" className="text-xs font-bold text-life-text">Use Skill as Title</label>
                    <button 
                        id="title-override-toggle"
                        onClick={handleTitleOverrideToggle}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${user.preferences.useSkillAsTitle ? 'bg-life-gold' : 'bg-life-muted/20'}`}>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${user.preferences.useSkillAsTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Skill Selector (Conditional) */}
                {user.preferences.useSkillAsTitle && (
                    <div className="animate-in fade-in duration-300">
                        <select 
                            value={user.preferences.linkedSkillId || ''}
                            onChange={handleSkillLink}
                            className="w-full p-3 bg-life-paper border border-zinc-800 rounded-lg text-xs font-bold text-life-text focus:outline-none focus:ring-2 focus:ring-life-gold/50"
                        >
                            <option value="" disabled>Select a Skill...</option>
                            {skillState.skills.map(skill => (
                                <option key={skill.id} value={skill.id}>{skill.title}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* 📥 DATA MANAGEMENT GROUP */}
            <div className="bg-life-black border border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Database size={14} className="text-life-muted" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-life-muted">Data Persistence</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onExport} 
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-zinc-800 hover:border-life-gold/50 transition-all group"
                    >
                        <Download size={20} className="text-life-gold group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Backup System</span>
                    </button>
                    
                    <button 
                        onClick={onImport} 
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-zinc-800 hover:border-life-easy/50 transition-all group"
                    >
                        <Upload size={20} className="text-life-easy group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Restore Data</span>
                    </button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 opacity-50">
                    <ShieldCheck size={10} className="text-life-easy" />
                    <span className="text-[8px] text-life-muted uppercase font-bold">Local Storage Protocol Active</span>
                </div>
            </div>

            {/* ⚙️ SYSTEM ACTIONS */}
            <div className="space-y-2">
                {/* 🤖 AI PROTOCOLS MENU */}
                <button 
                    onClick={() => dispatch.setModal('guidesMenu')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-life-gold/10 border border-life-gold/30 hover:bg-life-gold/20 transition-all group shadow-lg shadow-life-gold/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-life-gold/20 rounded-lg text-life-gold group-hover:scale-110 transition-transform">
                            <Brain size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-life-gold group-hover:text-yellow-400">
                            System Protocols (AI Guides)
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-life-gold/60 bg-life-gold/10 px-2 py-1 rounded border border-life-gold/20">
                        AI_DOCS
                    </span>
                </button>

                                {/* 📦 SOURCE ARCHIVE (ORACLE) */}
                <div className="w-full flex flex-col items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-700 transition-all group space-y-3">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-zinc-700/20 rounded-lg text-zinc-400 group-hover:text-zinc-300">
                                <Download size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-200 group-hover:text-white">
                                Oracle Source Archive (ZIP)
                            </span>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded border border-zinc-700/30">
                            SYS_EXPORT
                        </span>
                    </div>
                    <input 
                        type="password"
                        placeholder="Enter code to unlock"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full bg-life-black border border-zinc-600 rounded-lg p-2 text-center text-xs text-life-text placeholder:text-life-muted/50 focus:outline-none focus:border-life-gold/50 transition-all font-mono"
                    />
                    <button 
                        onClick={downloadSourceCode}
                        disabled={verificationCode !== 'asad0032'}
                        className="w-full py-2 rounded-lg bg-life-gold text-life-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-life-gold/20 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Download Source
                    </button>
                    {projectStats && (
                        <div className="flex justify-between w-full px-2 pt-1 opacity-50">
                            <span className="text-[8px] font-mono text-zinc-400">Files: {projectStats.fileCount}</span>
                            <span className="text-[8px] font-mono text-zinc-400">LOC: {projectStats.totalLines.toLocaleString()}</span>
                        </div>
                    )}
                </div>
                

                {/* 🔔 NOTIFICATION CONTROLS */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={async () => {
                            const granted = await requestNotificationPermission();
                            if (granted) alert("Notifications Enabled! 🔔");
                            else alert("Notifications Denied or Not Supported 🔕");
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-life-muted/20 hover:border-life-gold/50 transition-all group"
                    >
                        <Bell size={20} className="text-life-gold group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Enable Alerts</span>
                    </button>
                    
                    <button 
                        onClick={() => sendAlert(Date.now(), "Life OS", "System Test: Notifications Operational ⚡")} 
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-life-muted/20 hover:border-life-easy/50 transition-all group"
                    >
                        <Activity size={20} className="text-life-easy group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Test Alert</span>
                    </button>
                </div>

                <button 
                    onClick={onForceSleep}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-life-black border border-life-muted/10 hover:bg-life-muted/5 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <RefreshCw size={16} className="text-life-gold group-hover:rotate-180 transition-transform duration-700" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-life-text">Trigger Daily Reset</span>
                    </div>
                    <span className="text-[8px] font-mono text-life-muted opacity-50">MANUAL_OVERRIDE</span>
                </button>
            </div>

            {/* Version Footer */}
            <div className="text-center pt-4">
                <p className="text-[8px] text-life-muted font-mono opacity-40 uppercase tracking-[0.3em]">
                    LifeOS Neural Kernel v2.4.0 // Secured
                </p>
            </div>
        </div>
    );
};
