
import React, { useState, useEffect } from 'react';
import { ChevronRight, Award, Download, Upload, ShieldCheck, Skull, X } from 'lucide-react';
import { useLifeOS } from '../../contexts/LifeOSContext';
import { useShop } from '../../contexts/ShopContext';
import { useSkills } from '../../contexts/SkillContext';
import { useBadges } from '../../contexts/BadgeContext';
import { useTasks } from '../../contexts/TaskContext'; 
import { useHabits } from '../../contexts/HabitContext'; 
import { useRaids } from '../../contexts/RaidContext'; 
import { useCampaign } from '../../contexts/CampaignContext'; 
import { StoreItem } from '../../types/shopTypes';
import { playSound } from '../../utils/audio';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, linkWithPopup, User as FirebaseUser } from 'firebase/auth';

// 🟢 NEW COMPONENTS
import { IdentityCard } from './profile/IdentityCard';
import { AttributeAnalysis } from './profile/AttributeAnalysis';
import { InventoryGrid } from './profile/InventoryGrid';
import { ItemIcon } from './profile/ItemIcon';

const ProfileView: React.FC = () => {
  const { state, dispatch } = useLifeOS();
  const { shopState } = useShop(); 
  const { skillState } = useSkills(); 
  const { taskState } = useTasks(); 
  const { habitState } = useHabits(); 
  const { raidState } = useRaids(); 
  const { campaignState } = useCampaign(); 
  const { getAllBadges } = useBadges(); 

  const { user } = state;
  const { storeItems } = shopState; 

  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => setCurrentUser(u));
    return () => unsubscribe();
  }, []);
  
  // 🧠 CALCULATE DYNAMIC TITLE
  const skills = skillState?.skills || [];
  const highestSkill = skills.length > 0 
    ? skills.reduce((prev, current) => (prev.level > current.level) ? prev : current, skills[0])
    : null;

  const dynamicTitle = highestSkill 
    ? `${highestSkill.rank} ${highestSkill.title}` 
    : user.title;

  const badgesCount = user.badges?.length || 0;
  const allBadges = getAllBadges();
  const featuredBadgesData = (user.featuredBadges || [])
    .map(id => allBadges.find(b => b.badge.id === id))
    .filter(Boolean);

  const inventoryItems = user.inventory
    .map(id => storeItems.find(item => item.id === id))
    .filter(Boolean) as StoreItem[];

  const handleUseItem = () => {
      if (selectedItem) {
          dispatch.useItem(selectedItem.id); 
          setSelectedItem(null);
      }
  };

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

  return (
    <div className="pb-24 animate-in fade-in zoom-in-95 duration-500 relative">
      
      {/* 🟢 IDENTITY */}
      <IdentityCard 
          user={user}
          dynamicTitle={dynamicTitle}
          featuredBadgesData={featuredBadgesData as any}
      />

      {/* 🟢 HALL OF FAME SHORTCUT */}
      <button 
        onClick={() => dispatch.setView('hall_of_fame')}
        className="w-full mb-6 bg-life-black border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-life-gold/50 hover:bg-life-gold/5 transition-all group shadow-lg"
      >
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-life-crimson/10 flex items-center justify-center text-life-crimson border border-life-crimson/20 group-hover:scale-110 transition-transform">
                  <Award size={20} />
              </div>
              <div className="text-left">
                  <h3 className="text-xs font-black text-life-text uppercase tracking-widest group-hover:text-life-gold transition-colors">Hall of Glory</h3>
                  <p className="text-[9px] text-life-muted uppercase tracking-[0.2em]">{badgesCount} Medals Secured</p>
              </div>
          </div>
          <ChevronRight size={20} className="text-life-muted group-hover:text-life-gold" />
      </button>

      {/* 🟢 ATTRIBUTE ANALYSIS (NEW) */}
      <AttributeAnalysis user={user} />

      {/* 🟢 INVENTORY GRID */}
      <InventoryGrid 
          items={inventoryItems} 
          onSelectItem={setSelectedItem} 
      />

      {/* 📥 DATA MANAGEMENT GROUP */}
      <div className="bg-life-black border border-zinc-800 rounded-xl p-4 space-y-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
              <Download size={14} className="text-life-muted" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-life-muted">Data Persistence</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <button 
                  onClick={handleExport} 
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-zinc-800 hover:border-life-gold/50 transition-all group"
              >
                  <Download size={20} className="text-life-gold group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Backup System</span>
              </button>
              
              <button 
                  onClick={handleImport} 
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-life-paper border border-zinc-800 hover:border-life-easy/50 transition-all group"
              >
                  <Upload size={20} className="text-life-easy group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-life-text">Restore Data</span>
              </button>
          </div>

          <button 
              onClick={() => dispatch.setModal('resetConfirm')} 
              className="w-full flex items-center justify-between p-4 rounded-xl bg-red-950/10 border border-red-900/30 hover:bg-red-900/20 transition-all group"
          >
              <div className="flex items-center gap-3">
                  <Skull size={16} className="text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Rebirth Protocol</span>
              </div>
              <span className="text-[8px] font-mono text-red-900 font-bold">DANGER_ZONE</span>
          </button>

          <div className="flex items-center justify-center gap-2 pt-2 opacity-50">
              <ShieldCheck size={10} className="text-life-easy" />
              <span className="text-[8px] text-life-muted uppercase font-bold">Local Storage Protocol Active</span>
          </div>
      </div>

      {/* 🟢 ITEM MODAL */}
      {selectedItem && (
          <div 
            onClick={() => setSelectedItem(null)} 
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          >
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-life-paper w-full max-w-xs rounded-xl border border-zinc-800 p-5 shadow-2xl relative"
              >
                  <button onClick={() => setSelectedItem(null)} className="absolute top-3 right-3 text-life-muted hover:text-life-text"><X size={20} /></button>
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-life-black border border-zinc-800 flex items-center justify-center mb-3 text-life-gold shadow-inner">
                          <ItemIcon icon={selectedItem.icon} size={40} />
                      </div>
                      <h3 className="font-black uppercase tracking-widest text-life-text">{selectedItem.title}</h3>
                      <p className="text-[10px] text-life-muted mt-2 leading-relaxed uppercase">{selectedItem.description}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                      {selectedItem.type === 'artifact' ? (
                          <button 
                            onClick={() => {
                                dispatch.toggleEquip(selectedItem.id);
                                setSelectedItem(null);
                            }}
                            className={`w-full py-4 font-black uppercase text-xs rounded-xl shadow-lg transition-all active:scale-95 ${user.equippedItems.includes(selectedItem.id) ? 'bg-life-muted/20 text-life-muted hover:bg-life-muted/30' : 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-life-gold/20'}`}
                          >
                              {user.equippedItems.includes(selectedItem.id) ? 'Unequip Artifact' : 'Equip Artifact'}
                          </button>
                      ) : (
                          <button 
                            onClick={handleUseItem}
                            className="w-full py-4 bg-life-gold text-life-black font-black uppercase text-xs rounded-xl hover:bg-yellow-400 shadow-lg shadow-life-gold/20 transition-all active:scale-95"
                          >
                              Consume Item
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ProfileView;
