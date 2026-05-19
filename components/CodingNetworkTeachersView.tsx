
import React, { useState } from 'react';
import { UserIcon, LogicIcon, FireIcon, ActivityIcon, ZapIcon, StarIcon, ShieldIcon, BookOpenIcon, TerminalIcon, XIcon } from './icons';
import type { MainView, TeacherProfile } from '../types';
import { Modal } from './Modal';

interface CodingNetworkTeachersViewProps {
  onNavigateToLab: (view: MainView) => void;
  teachers: TeacherProfile[];
  onDeleteTeacher: (id: string) => void;
}

export const CodingNetworkTeachersView: React.FC<CodingNetworkTeachersViewProps> = ({ onNavigateToLab, teachers, onDeleteTeacher }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

  const iconMap: Record<string, React.FC<{ className?: string }>> = {
    LogicIcon, FireIcon, ActivityIcon, UserIcon, ZapIcon, StarIcon
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      onDeleteTeacher(teacherToDelete);
      setTeacherToDelete(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050510] text-gray-200 font-mono overflow-hidden">
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-violet-600/10 border-4 border-violet-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <UserIcon className="w-10 h-10 text-violet-400" />
          </div>
          <div>
            <h2 className="font-comic-header text-5xl text-violet-400 wisdom-glow italic tracking-tighter uppercase">Faculty of Conjunction</h2>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1 italic">Gifted Mentors of the Reliable Series</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map((teacher) => {
            const IconComp = iconMap[teacher.icon] || UserIcon;
            return (
              <div 
                key={teacher.id} 
                onClick={() => setSelectedTeacher(teacher)}
                className="aero-panel bg-black/60 border-4 border-black p-6 flex flex-col group hover:border-violet-500/50 transition-all duration-500 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_20px_rgba(139,92,246,0.2)] cursor-pointer relative"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setTeacherToDelete(teacher.id);
                    }}
                    className="text-gray-600 hover:text-red-500 transition-colors p-1"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl bg-white/5 border-2 border-black ${teacher.color}`}>
                    <IconComp className="w-8 h-8" />
                  </div>
                  <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest bg-black px-2 py-1 rounded border border-white/5">Faculty_ID: 0x{teacher.id.slice(0, 4).toUpperCase()}</span>
                </div>
                <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-2">{teacher.name}</h3>
                <p className={`text-[10px] font-black uppercase mb-4 tracking-widest ${teacher.color}`}>{teacher.specialty}</p>
                <div className="flex-1 bg-black/40 p-4 rounded-xl border border-white/5 mb-6 italic text-gray-400 text-xs leading-relaxed">
                  "{teacher.wisdom}"
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToLab('enlightenment_pool');
                  }}
                  className="vista-button w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[4px_4px_0_0_#000] active:translate-y-1"
                >
                  Request Consultation
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Faculty Status: DISPENSING WISDOM</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.2em]">The Maestro's Faculty: Absolute Know-How.</p>
      </div>

      {selectedTeacher && (
        <Modal
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onConfirm={() => {
            onNavigateToLab('enlightenment_pool');
            setSelectedTeacher(null);
          }}
          title={selectedTeacher.name}
          confirmText="Consult Now"
          cancelText="Close"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className={`p-3 rounded-xl bg-black border border-white/10 ${selectedTeacher.color}`}>
                {(() => {
                  const Icon = iconMap[selectedTeacher.icon] || UserIcon;
                  return <Icon className="w-8 h-8" />;
                })()}
              </div>
              <div>
                <p className={`text-xs font-black uppercase tracking-widest ${selectedTeacher.color}`}>{selectedTeacher.specialty}</p>
                {selectedTeacher.clearanceLevel && (
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldIcon className="w-3 h-3 text-gray-500" />
                    <span className="text-[9px] font-mono text-gray-400">Clearance: {selectedTeacher.clearanceLevel}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedTeacher.description && (
              <div className="bg-black/30 p-4 rounded-lg border-l-2 border-violet-500">
                <p className="text-sm text-gray-300 leading-relaxed">{selectedTeacher.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {selectedTeacher.capabilities && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                    <ZapIcon className="w-3 h-3" /> Capabilities
                  </h4>
                  <ul className="space-y-1">
                    {selectedTeacher.capabilities.map((cap, i) => (
                      <li key={i} className="text-xs text-gray-400 font-mono flex items-center gap-2">
                        <div className="w-1 h-1 bg-violet-500 rounded-full" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTeacher.modules && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                    <TerminalIcon className="w-3 h-3" /> Core Modules
                  </h4>
                  <ul className="space-y-1">
                    {selectedTeacher.modules.map((mod, i) => (
                      <li key={i} className="text-xs text-gray-400 font-mono flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full" />
                        {mod}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-violet-900/10 p-4 rounded-xl border border-violet-500/20 italic text-center">
              <p className="text-violet-300 text-sm">"{selectedTeacher.wisdom}"</p>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={!!teacherToDelete}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={confirmDelete}
        title="Dismiss Faculty Member?"
        confirmText="Dismiss"
        cancelText="Retain"
        confirmVariant="danger"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-400">
            Are you sure you want to dismiss this faculty member? Their wisdom and guidance will no longer be available to the network.
          </p>
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
            <p className="text-xs text-red-400 font-mono">
              WARNING: This action is irreversible. The agent's neural patterns will be purged.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
