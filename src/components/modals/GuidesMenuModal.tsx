import React from 'react';
import { X, Brain, Activity, ShoppingCart, Coins, ShieldCheck, Scale, Star, Download, FileText } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { GUIDES } from '../../utils/guideTexts';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const GuidesMenuModal: React.FC = () => {
    const { dispatch } = useLifeOS();

    const handleDownloadAll = async () => {
        try {
            const zip = new JSZip();
            
            Object.entries(GUIDES).forEach(([key, content]) => {
                zip.file(`${key}.md`, content);
            });

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'LifeOS_AI_Protocols.zip');
            dispatch.addToast('Protocols Downloaded Successfully', 'success');
        } catch (error) {
            console.error('Failed to download guides:', error);
            dispatch.addToast('Download Failed', 'error');
        }
    };

    const guides = [
        { id: 'questForge', title: 'Quest Forge (Tasks)', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', tag: 'AI_TASK_GEN' },
        { id: 'habitProtocol', title: 'Protocol Foundry (Habits)', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', tag: 'AI_HABIT_GEN' },
        { id: 'shopProtocol', title: 'Shop Archives', icon: ShoppingCart, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/30', tag: 'AI_SHOP_DOCS' },
        { id: 'economyProtocol', title: 'Treasury Archive (Economy)', icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', tag: 'AI_ECON_DOCS' },
        { id: 'raidProtocol', title: 'The War Room (Raids)', icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', tag: 'AI_RAID_OPS' },
        { id: 'codexArbiter', title: 'Codex Arbiter (Laws)', icon: Scale, color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', tag: 'AI_CODEX_GEN' },
        { id: 'badgeProtocol', title: 'Badge Architect', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', tag: 'AI_BADGE_GEN' },
        { id: 'skillProtocol', title: 'Skill Tree Architect', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', tag: 'AI_SKILL_GEN' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-life-black border border-life-gold/30 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl shadow-life-gold/10">
                
                {/* HEADER */}
                <div className="p-4 border-b border-life-muted/20 flex items-center justify-between bg-life-paper/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-life-gold/10 rounded-lg text-life-gold border border-life-gold/20">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-life-gold flex items-center gap-2">
                                System Protocols
                            </h2>
                            <p className="text-[10px] text-life-muted font-mono">AI Generation Guides</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    
                    {/* DOWNLOAD ALL BUTTON */}
                    <button 
                        onClick={handleDownloadAll}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-life-gold text-life-black hover:bg-yellow-400 transition-all shadow-lg shadow-life-gold/20 mb-4"
                    >
                        <Download size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Download All Protocols (ZIP)</span>
                    </button>

                    <div className="w-full h-px bg-life-muted/20 mb-4"></div>

                    {/* GUIDE BUTTONS */}
                    {guides.map((guide) => {
                        const Icon = guide.icon;
                        return (
                            <button 
                                key={guide.id}
                                onClick={() => dispatch.setModal(guide.id as any)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border ${guide.border} hover:bg-zinc-800 transition-all group`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 ${guide.bg} rounded-lg ${guide.color}`}>
                                        <Icon size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-200 group-hover:text-white">
                                        {guide.title}
                                    </span>
                                </div>
                                <span className={`text-[8px] font-mono ${guide.color} opacity-60 bg-black/50 px-2 py-1 rounded border ${guide.border}`}>
                                    {guide.tag}
                                </span>
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default GuidesMenuModal;
