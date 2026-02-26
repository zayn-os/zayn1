
import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Trash2, Archive, Edit2, Activity, Shield, Zap, Brain, Heart, Dumbbell, BookOpen, Lock, Hash, AlertTriangle, Clock, Bell, Check, Palette, CalendarPlus, ChevronDown, Copy, Coins, Users, Flame } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useTasks } from '../../contexts/TaskContext';
import { useHabits } from '../../contexts/HabitContext';
import { useRaids } from '../../contexts/RaidContext';
import { useSkills } from '../../contexts/SkillContext';
import { Stat, Reminder, Difficulty } from '../../types/types';
import { Subtask } from '../../types/taskTypes'; 
import { DIFFICULTY_COLORS, STAT_COLORS, DIFFICULTY_BG } from '../../types/constants';
import { openInGoogleCalendar } from '../../utils/googleCalendar';

// 🟢 NEW IMPORTS (Full Forms)
import TaskForm from '../forms/TaskForm';
import HabitForm from '../forms/HabitForm';
import RaidForm from '../forms/RaidForm';
import { RaidStepEditor } from '../forms/parts/RaidStepEditor';
import { PendingRaidStep } from '../../types/raidTypes';

// Helper for Stats Icons
const StatIcon = ({ stat, size = 14 }: { stat: Stat; size?: number }) => {
  switch (stat) {
    case Stat.STR: return <Dumbbell size={size} />;
    case Stat.INT: return <Brain size={size} />;
    case Stat.DIS: return <Zap size={size} />;
    case Stat.HEA: return <Heart size={size} />;
    case Stat.CRT: return <Palette size={size} />;
    case Stat.SPR: return <Flame size={size} />;
    case Stat.REL: return <Users size={size} />;
    case Stat.FIN: return <Coins size={size} />;
    default: return <Activity size={size} />;
  }
};

const ItemDetailsModal: React.FC = () => {
    const { state, dispatch } = useLifeOS();
    const { taskState, taskDispatch } = useTasks();
    const { habitState, habitDispatch } = useHabits();
    const { raidState, raidDispatch } = useRaids();
    const { skillState } = useSkills();
    
    const { modalData } = state.ui;

    // 1. RESOLVE DATA BASED ON TYPE
    const resolvedData = useMemo(() => {
        if (!modalData) return null;
        const { itemId, type, parentId } = modalData;

        if (type === 'task') {
            const item = taskState.tasks.find(t => t.id === itemId);
            if (!item) return null;
            return {
                item, title: item.title, desc: item.description, difficulty: item.difficulty, stats: item.stats, skillId: item.skillId,
                scheduledTime: item.scheduledTime || item.deadline, reminders: item.reminders, subtasks: item.subtasks,
                isEditable: true, canArchive: true, isFullControl: true
            };
        }
        
        if (type === 'habit') {
            const item = habitState.habits.find(h => h.id === itemId);
            if (!item) return null;
            return {
                item, title: item.title, desc: item.description, difficulty: item.difficulty, stats: item.stats, skillId: item.skillId,
                scheduledTime: item.scheduledTime, reminders: item.reminders, subtasks: item.subtasks,
                isEditable: true, canArchive: false, isFullControl: true
            };
        }

        if (type === 'raid' || type === 'raid_step') {
            if (type === 'raid') {
                const item = raidState.raids.find(r => r.id === itemId);
                if (!item) return null;
                return { 
                    item, title: item.title, desc: item.description, difficulty: item.difficulty, stats: item.stats, skillId: item.skillId, 
                    scheduledTime: item.deadline, reminders: [], subtasks: [], // Raids main don't typically have reminders/subtasks on the container
                    isEditable: true, canArchive: true, isFullControl: true 
                };
            } else {
                const parentRaid = raidState.raids.find(r => r.id === parentId);
                const item = parentRaid?.steps.find(s => s.id === itemId);
                if (!item || !parentRaid) return null;
                
                // 🟢 GRANULAR STEP RESOLUTION
                // If step has its own stat/diff, use it. Otherwise inherit from parent.
                // Skill is ALWAYS inherited (Enforced Rule).
                const stepStats = item.stat ? [item.stat] : ((parentRaid.stats && parentRaid.stats.length > 0) ? parentRaid.stats : [Stat.STR]);
                const stepDiff = item.difficulty || parentRaid.difficulty;
                const stepSkill = parentRaid.skillId; // 🔒 LOCKED TO PARENT

                return { 
                    item, parentRaid, title: item.title, desc: item.notes, 
                    difficulty: stepDiff, stats: stepStats, skillId: stepSkill, 
                    scheduledTime: item.scheduledTime, reminders: item.reminders, subtasks: item.subtasks, 
                    isTimed: item.isTimed, durationMinutes: item.durationMinutes, // 👈 NEW
                    isEditable: true, canArchive: true, isFullControl: true,
                    isSkillLocked: true // 🔒 UI Flag to disable skill editing
                };
            }
        }
        return null;
    }, [modalData, taskState.tasks, habitState.habits, raidState.raids]);

    // 🎭 LOCAL UI STATE
    const [isEditing, setIsEditing] = useState(false);

    // Reset editing state when modal data changes
    useEffect(() => {
        setIsEditing(false);
    }, [modalData]);

    if (!modalData || !resolvedData) return null;

    const handleClose = () => dispatch.setModal('none');

    const handleCopyJSON = () => {
        const itemCopy: any = { ...resolvedData.item };
        const shouldKeepHistory = state.user.preferences.copyIncludesHistory ?? true;

        if (!shouldKeepHistory) {
            delete itemCopy.history;
            delete itemCopy.streak;
            delete itemCopy.streakHistory;
            delete itemCopy.purchaseHistory;
        }

        // Wrap in injection format
        let payload: any = {};
        if (modalData.type === 'habit') payload = { habits: [itemCopy] };
        else if (modalData.type === 'task') payload = { tasks: [itemCopy] };
        else if (modalData.type === 'raid') payload = { raids: [itemCopy] };
        else payload = itemCopy;

        navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        dispatch.addToast('Item Copied to Clipboard (JSON)', 'success');
    };

    const handleArchive = () => {
        if (modalData.type === 'task') taskDispatch.archiveTask(modalData.itemId);
        else if (modalData.type === 'raid') raidDispatch.archiveRaid(modalData.itemId);
        else if (modalData.type === 'raid_step') raidDispatch.archiveRaidStep(modalData.parentId!, modalData.itemId);
        handleClose();
    };

    const handleDelete = () => {
        dispatch.setModal('confirmation', {
            title: 'Confirm Deletion',
            message: 'Permanently delete this item?',
            confirmText: 'Delete',
            isDangerous: true,
            onConfirm: () => {
                if (modalData.type === 'task') taskDispatch.deleteTask(modalData.itemId);
                else if (modalData.type === 'habit') habitDispatch.deleteHabit(modalData.itemId);
                else if (modalData.type === 'raid') raidDispatch.deleteRaid(modalData.itemId);
                else if (modalData.type === 'raid_step') raidDispatch.deleteRaidStep(modalData.parentId!, modalData.itemId);
            }
        });
    };

    const handleAddToCalendar = () => {
        if (!resolvedData.scheduledTime) return;
        openInGoogleCalendar(resolvedData.title, resolvedData.desc || '', resolvedData.scheduledTime);
    };

    // 🟢 RAID STEP SAVE HANDLER
    const handleSaveRaidStep = (updatedStep: PendingRaidStep) => {
        if (modalData.type !== 'raid_step' || !modalData.parentId) return;
        
        // Convert PendingRaidStep to partial RaidStep update
        const payload: any = {
            title: updatedStep.title,
            notes: updatedStep.notes,
            difficulty: updatedStep.difficulty,
            // stat: updatedStep.stat, // Usually inherited, but if editor allows change, we save it
            scheduledTime: updatedStep.scheduledTime,
            deadline: updatedStep.deadline,
            isTimed: updatedStep.isTimed,
            durationMinutes: updatedStep.durationMinutes,
            subtasks: updatedStep.subtasks,
            reminders: updatedStep.reminders
        };

        raidDispatch.updateRaidStep(modalData.parentId, modalData.itemId, payload);
        setIsEditing(false);
        dispatch.addToast("Step Updated", "success");
    };

    const diffColor = DIFFICULTY_COLORS[resolvedData.difficulty];
    const statColor = STAT_COLORS[resolvedData.stats[0]];
    const linkedSkill = resolvedData.skillId ? skillState.skills.find(s => s.id === resolvedData.skillId) : null;

    return (
        <div onClick={handleClose} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div onClick={(e) => e.stopPropagation()} className="bg-life-paper w-full max-w-md rounded-xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 relative group">
                
                {/* HEADER */}
                <div className="p-5 border-b border-zinc-800 flex justify-between items-start bg-life-black/40">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-life-gold bg-life-gold/10 px-2 py-0.5 rounded border border-life-gold/20">{modalData.type.replace('_', ' ')}</span>
                            {modalData.parentId && <span className="text-[9px] text-life-muted border border-zinc-800 px-1.5 py-0.5 rounded bg-life-black">Linked</span>}
                        </div>
                        {isEditing ? (
                            <h2 className="text-xl font-bold text-life-text leading-tight font-mono text-life-gold animate-pulse">Editing...</h2>
                        ) : (
                            <h2 className="text-xl font-bold text-life-text leading-tight font-mono">{resolvedData.title}</h2>
                        )}
                    </div>
                    <button onClick={handleClose} className="text-life-muted hover:text-white"><X size={18} /></button>
                </div>

                {/* META BAR (READ ONLY) */}
                {!isEditing && (
                    <div className="px-5 py-3 bg-life-black border-b border-zinc-800 flex flex-wrap gap-2 items-center">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-black uppercase ${diffColor} bg-opacity-10`}><Lock size={10} />{resolvedData.difficulty}</div>
                        {resolvedData.stats.map(stat => (
                            <div key={stat} className="flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-black uppercase bg-life-paper" style={{ borderColor: `${STAT_COLORS[stat]}40`, color: STAT_COLORS[stat] }}><StatIcon stat={stat} size={10} />{stat}</div>
                        ))}
                        {linkedSkill && <div className="flex items-center gap-1 px-2 py-1 rounded border border-life-gold/30 text-life-gold bg-life-gold/5 text-[10px] font-bold"><BookOpen size={10} /> {linkedSkill.title}</div>}
                    </div>
                )}

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-5 bg-life-paper relative">
                    {isEditing ? (
                        <div className="animate-in fade-in duration-300">
                            {/* 🟢 RENDER FULL FORMS FOR EDITING */}
                            {modalData.type === 'task' && (
                                <TaskForm onClose={() => setIsEditing(false)} initialData={resolvedData.item as any} />
                            )}
                            {modalData.type === 'habit' && (
                                <HabitForm onClose={() => setIsEditing(false)} initialData={resolvedData.item as any} />
                            )}
                            {modalData.type === 'raid' && (
                                <RaidForm onClose={() => setIsEditing(false)} initialData={resolvedData.item as any} />
                            )}
                            {modalData.type === 'raid_step' && (
                                <RaidStepEditor 
                                    step={{
                                        ...(resolvedData.item as any),
                                        // Ensure all required fields for PendingRaidStep are present
                                        subtasks: (resolvedData.item as any).subtasks || [],
                                        reminders: (resolvedData.item as any).reminders || [],
                                        notes: (resolvedData.item as any).notes || ''
                                    }}
                                    onSave={handleSaveRaidStep}
                                    onClose={() => setIsEditing(false)}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {resolvedData.scheduledTime && (
                                <div className="flex gap-2 items-center text-xs text-life-gold bg-life-gold/10 px-3 py-2 rounded-lg border border-life-gold/20 inline-flex">
                                    <Clock size={12} />
                                    <span className="font-mono font-bold">{modalData.type === 'habit' ? `Daily at ${resolvedData.scheduledTime}` : new Date(resolvedData.scheduledTime).toLocaleString()}</span>
                                    <button onClick={handleAddToCalendar} className="ml-2 border-l border-life-gold/30 pl-2 text-life-gold hover:text-white"><CalendarPlus size={14} /></button>
                                </div>
                            )}
                            <p className="text-sm text-life-text/90 leading-relaxed font-mono whitespace-pre-wrap">{resolvedData.desc || <span className="text-life-muted italic">No Description</span>}</p>
                            {resolvedData.subtasks && resolvedData.subtasks.length > 0 && (
                                <div className="mt-4 border-t border-zinc-800 pt-4">
                                    <h4 className="text-[10px] text-life-muted uppercase font-bold mb-2 flex items-center gap-1"><Check size={12} /> Steps</h4>
                                    <div className="space-y-2">{resolvedData.subtasks.map(st => (
                                        <div key={st.id} className="flex items-center gap-2 p-2 rounded bg-life-black border border-zinc-800">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${st.isCompleted ? 'bg-life-gold border-life-gold text-life-black' : 'border-zinc-800'}`}><Check size={12} strokeWidth={3} /></div>
                                            <span className={`text-xs ${st.isCompleted ? 'text-life-muted line-through' : 'text-life-text'}`}>{st.title}</span>
                                        </div>
                                    ))}</div>
                                </div>
                            )}

                            {/* 🟢 RAID STEPS MANAGEMENT (ONLY FOR RAID PARENT) */}
                            {modalData.type === 'raid' && (resolvedData.item as any).steps && (
                                <div className="mt-6 border-t border-zinc-800 pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-[10px] text-life-muted uppercase font-bold flex items-center gap-1"><Activity size={12} /> Operation Steps</h4>
                                        <button 
                                            onClick={() => {
                                                // Quick Add Step Logic
                                                const newStep = {
                                                    id: `rs_new_${Date.now()}`,
                                                    title: "New Tactical Step",
                                                    isCompleted: false,
                                                    isLocked: false,
                                                    difficulty: resolvedData.difficulty, // Inherit
                                                    stat: resolvedData.stat, // Inherit
                                                };
                                                const updatedSteps = [...(resolvedData.item as any).steps, newStep];
                                                raidDispatch.updateRaid(modalData.itemId, { steps: updatedSteps });
                                                dispatch.addToast("Step Added", "success");
                                            }}
                                            className="text-[9px] bg-life-gold/10 text-life-gold px-2 py-1 rounded border border-life-gold/20 hover:bg-life-gold/20 transition-colors"
                                        >
                                            + Add Step
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(resolvedData.item as any).steps.map((step: any, idx: number) => (
                                            <div key={step.id} className="flex items-center justify-between p-3 rounded bg-life-black border border-life-muted/20 group hover:border-life-gold/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-mono text-life-muted opacity-50">{(idx + 1).toString().padStart(2, '0')}</span>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs font-bold ${step.isCompleted ? 'text-life-muted line-through' : 'text-life-text'}`}>{step.title}</span>
                                                        <div className="flex gap-1 mt-0.5">
                                                            {step.difficulty && step.difficulty !== (resolvedData.item as any).difficulty && (
                                                                <span className={`text-[7px] font-black uppercase px-1 rounded border ${DIFFICULTY_COLORS[step.difficulty]}`}>{step.difficulty}</span>
                                                            )}
                                                            {step.stat && step.stat !== (resolvedData.item as any).stats?.[0] && (
                                                                <span className="text-[7px] font-black uppercase px-1 rounded border border-life-muted/20 flex items-center gap-0.5" style={{ color: STAT_COLORS[step.stat], borderColor: `${STAT_COLORS[step.stat]}40` }}>
                                                                    <StatIcon stat={step.stat} size={6} /> {step.stat}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            dispatch.setModal('itemDetails', { itemId: step.id, type: 'raid_step', parentId: modalData.itemId });
                                                        }}
                                                        className="p-1.5 rounded bg-life-muted/10 hover:bg-life-gold/20 text-life-muted hover:text-life-gold"
                                                    >
                                                        <Edit2 size={10} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            raidDispatch.deleteRaidStep(modalData.itemId, step.id);
                                                        }}
                                                        className="p-1.5 rounded bg-life-hard/10 hover:bg-life-hard/20 text-life-hard"
                                                    >
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                {!isEditing && (
                    <div className="p-4 bg-life-black border-t border-zinc-800 flex items-center justify-between gap-3">
                        <div className="flex gap-2">
                            <button onClick={handleDelete} className="p-2 rounded-lg text-life-hard hover:bg-life-hard/10"><Trash2 size={16} /></button>
                            {resolvedData.canArchive && <button onClick={handleArchive} className="p-2 rounded-lg text-life-muted hover:bg-life-muted/10"><Archive size={16} /></button>}
                            
                            {/* 🟢 COPY JSON BUTTON */}
                            <button onClick={handleCopyJSON} className="p-2 rounded-lg text-life-gold hover:bg-life-gold/10 border border-life-gold/20" title="Copy JSON Code">
                                <Copy size={16} />
                            </button>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-lg border border-zinc-800 bg-life-paper text-life-text hover:text-life-gold text-xs font-black uppercase flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemDetailsModal;
