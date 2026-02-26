import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Shield, ScrollText, Layers, Zap, PlusSquare } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';

const RaidProtocolModal: React.FC = () => {
    const { dispatch } = useLifeOS();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'basics' | 'advanced' | 'append'>('basics');

    const PART_1_TEXT = `ROLE: You are "The War Room" (غرفة العمليات) - Part 1: Basics.
GOAL: Plan complex Operations (Raids) for a high-performance individual.

WHEN I ASK FOR A RAID, OUTPUT A VALID JSON OBJECT.
DO NOT CHAT. JUST OUTPUT THE JSON.

--- INTRODUCTION ---
A Raid is a large project or campaign consisting of multiple "Steps" (Missions).
This guide covers the basic structure and metadata of a Raid.

--- OUTPUT RULES ---
1. **Title:** Military/Tactical naming (e.g., "Operation: Apollo").
2. **Difficulty:** "easy", "normal", "hard".
3. **Stats:** Array of primary attributes (e.g., ["STR", "INT"]).
4. **Skill Link:** If known, link to a skill ID (e.g., "s_coding").
5. **Deadline:** Optional deadline in "YYYY-MM-DD" format.
6. **Steps (The Missions):** Array of step objects. Each step must have a "title".

--- JSON TEMPLATE (BASICS) ---
\`\`\`json
{
  "raids": [
    {
      "title": "Operation: PROJECT_NAME",
      "description": "Brief tactical overview.",
      "difficulty": "hard",
      "stats": ["INT"],
      "skillId": "OPTIONAL_SKILL_ID",
      "deadline": "YYYY-MM-DD",
      "steps": [
        { "title": "Phase 1: Recon" },
        { "title": "Phase 2: Execution" }
      ]
    }
  ]
}
\`\`\`
`;

    const PART_2_TEXT = `ROLE: You are "The War Room" (غرفة العمليات) - Part 2: Advanced Steps.
GOAL: Plan complex Operations (Raids) with advanced step configurations.

WHEN I ASK FOR A RAID, OUTPUT A VALID JSON OBJECT.
DO NOT CHAT. JUST OUTPUT THE JSON.

--- ADVANCED STEP RULES ---
1. **Inheritance:** Steps inherit Difficulty/Stat from the Raid unless specified.
2. **Overrides:** You CAN override a step's difficulty/stat (e.g., a "Hard" step in a "Normal" raid).
3. **Skill Lock:** Steps ALWAYS inherit the Raid's Skill. You cannot change this per step.
4. **Subtasks:** A step can have an array of subtasks (strings or objects).
5. **Timers:** Use "durationMinutes" to make a step timed.
6. **Reminders:** Array of times (e.g., ["09:00", "15:30"]) to trigger alerts.

--- JSON TEMPLATE (ADVANCED STEPS) ---
\`\`\`json
{
  "raids": [
    {
      "title": "Operation: Deep Work",
      "difficulty": "normal",
      "stats": ["INT"],
      "steps": [
        {
          "title": "Phase 1: Research",
          "difficulty": "easy", 
          "stat": "INT",
          "subtasks": ["Find sources", "Take notes"]
        },
        {
          "title": "Phase 2: Writing",
          "difficulty": "hard",
          "stat": "DIS", 
          "durationMinutes": 120,
          "reminders": ["10:00", "14:00"]
        }
      ]
    }
  ]
}
\`\`\`
`;

    const PART_3_TEXT = `ROLE: You are "The War Room" (غرفة العمليات) - Part 3: Smart Append.
GOAL: Learn how to inject large Raids in multiple parts using Smart Append.

WHEN I ASK FOR A RAID, OUTPUT A VALID JSON OBJECT.
DO NOT CHAT. JUST OUTPUT THE JSON.

--- SMART APPEND RULES ---
If a Raid is too large to generate in one response, you can inject it in multiple parts!

1. **Matching by ID:** To add steps to an existing Raid, you MUST use the EXACT SAME "id" (e.g., "rd_123...") in your new JSON injection.
2. **Appending Steps:** The system will automatically find the active Raid with that ID and APPEND the new steps to the end of it.
3. **Updating Metadata:** If you include description, difficulty, stats, or deadline in the new injection, it will UPDATE the existing Raid's metadata.
4. **Locking:** Newly appended steps are automatically locked if there are previous steps, preserving the sequential progression.

--- JSON TEMPLATE (MULTI-INJECTION) ---

**Injection 1 (The Beginning):**
\`\`\`json
{
  "raids": [
    {
      "id": "rd_operation_masterpiece",
      "title": "Operation: Masterpiece",
      "difficulty": "hard",
      "steps": [
        { "title": "Step 1: Concept" },
        { "title": "Step 2: Outline" }
      ]
    }
  ]
}
\`\`\`

**Injection 2 (Adding More Steps Later):**
\`\`\`json
{
  "raids": [
    {
      "id": "rd_operation_masterpiece",
      "title": "Operation: Masterpiece",
      "steps": [
        { "title": "Step 3: First Draft" },
        { "title": "Step 4: Revisions" }
      ]
    }
  ]
}
\`\`\`
*Result: "Operation: Masterpiece" now has 4 steps!*
`;

    const getActiveText = () => {
        if (activeTab === 'basics') return PART_1_TEXT;
        if (activeTab === 'advanced') return PART_2_TEXT;
        return PART_3_TEXT;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getActiveText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-life-black border border-red-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-red-500/10">
                
                {/* HEADER */}
                <div className="p-4 border-b border-life-muted/20 flex items-center justify-between bg-life-paper/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                The War Room <span className="text-[9px] bg-red-500 text-black px-1.5 rounded font-mono">V2</span>
                            </h2>
                            <p className="text-[10px] text-life-muted font-mono">Raid Operations Protocol</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch.setModal('none')} className="text-life-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* TABS */}
                <div className="flex border-b border-life-muted/20 bg-life-paper/30">
                    <button 
                        onClick={() => setActiveTab('basics')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'basics' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' : 'text-life-muted hover:text-white'}`}
                    >
                        <Layers size={14} /> Basics
                    </button>
                    <button 
                        onClick={() => setActiveTab('advanced')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'advanced' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' : 'text-life-muted hover:text-white'}`}
                    >
                        <Zap size={14} /> Advanced
                    </button>
                    <button 
                        onClick={() => setActiveTab('append')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'append' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' : 'text-life-muted hover:text-white'}`}
                    >
                        <PlusSquare size={14} /> Smart Append
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    
                    {/* INSTRUCTIONS */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
                        <div className="text-red-500 mt-1"><ScrollText size={18} /></div>
                        <div>
                            <h3 className="text-xs font-bold text-red-500 uppercase mb-1">How to Initialize</h3>
                            <ol className="text-[10px] text-life-muted space-y-1 list-decimal list-inside marker:text-red-500">
                                <li>Select the part you want to use (Basics, Advanced, or Smart Append).</li>
                                <li>Copy the System Prompt below.</li>
                                <li>Paste it into your AI's <strong>"System Instructions"</strong>.</li>
                                <li>Command the AI to plan complex projects.</li>
                                <li>Copy the JSON output and paste it into <strong>Data Injection</strong>.</li>
                            </ol>
                        </div>
                    </div>

                    {/* PROMPT DISPLAY */}
                    <div className="relative group">
                        <div className="absolute top-2 right-2 z-10">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg ${copied ? 'bg-green-500 text-black' : 'bg-red-500 text-black hover:bg-red-400'}`}
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy Protocol'}
                            </button>
                        </div>
                        
                        <div className="bg-black border border-life-muted/20 rounded-xl p-4 font-mono text-[10px] text-life-muted/80 whitespace-pre-wrap leading-relaxed overflow-x-auto h-96 custom-scrollbar selection:bg-red-500/30 selection:text-white">
                            {getActiveText()}
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-life-muted/20 bg-life-paper/30 rounded-b-2xl flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[9px] text-life-muted opacity-50">
                        <Terminal size={12} />
                        <span>Compatible with Gemini 1.5+, GPT-4, Claude 3</span>
                    </div>
                    <button 
                        onClick={() => dispatch.setModal('none')}
                        className="px-4 py-2 rounded-lg bg-life-muted/10 hover:bg-life-muted/20 text-xs font-bold text-life-muted transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RaidProtocolModal;
