import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  googleSignOut, 
  initAuth 
} from '../services/firebaseAuthService';
import { User } from 'firebase/auth';
import { CheckCircleIcon, SpinnerIcon } from './icons';

// Self-contained Video Camera Icon
const VideoIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z" />
  </svg>
);

// Self-contained LogOut Exit Icon
const LogOut = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

interface GoogleMeetWarRoomProps {
  onAddLog: (msg: string, type: 'INFO' | 'WARN' | 'SUCCESS') => void;
}

interface MeetSpaceDetail {
  name: string;
  meetingUri: string;
  meetingCode: string;
  objective: string;
  timestamp: string;
}

export const GoogleMeetWarRoom: React.FC<GoogleMeetWarRoomProps> = ({ onAddLog }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnLoading, setIsConnLoading] = useState(false);
  const [isSpaceCreating, setIsSpaceCreating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [activeSpace, setActiveSpace] = useState<MeetSpaceDetail | null>(null);
  const [spaceHistory, setSpaceHistory] = useState<MeetSpaceDetail[]>([]);
  
  const [peaceAccordActive, setPeaceAccordActive] = useState(false);

  useEffect(() => {
    const checkPeace = () => {
      setPeaceAccordActive(localStorage.getItem('aetheros_energy_peace_accord') === 'true');
    };
    checkPeace();
    const interval = setInterval(checkPeace, 1000);
    window.addEventListener('storage', checkPeace);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkPeace);
    };
  }, []);

  const [selectedObjective, setSelectedObjective] = useState('Critical Grid Incursion Review');

  // Sync selected objective on peaceAccordActive changes
  useEffect(() => {
    if (peaceAccordActive) {
      setSelectedObjective('🕊️ Global Energy Transition & Decarbonization Sync');
    } else {
      setSelectedObjective('Critical Grid Incursion Review');
    }
  }, [peaceAccordActive]);

  const OBJECTIVES = peaceAccordActive ? [
    '🕊️ Global Energy Transition & Decarbonization Sync',
    '🕊️ Swords into Plowshares Regional Planning Session',
    '🕊️ Equitable Solar Resource Allocations',
    '🕊️ Interfaith Energy Cooperation Council',
    '🕊️ Post-Carbon Defense Coalition Alignments'
  ] : [
    'Critical Grid Incursion Review',
    'Sovereign Core Incident Response',
    'Tactical Perimeter Re-alignment',
    'Routine Cognitive Sync',
    'Emergency Defense Debrief'
  ];

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setErrorText(null);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsConnLoading(true);
    setErrorText(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        onAddLog(`Google Workspace authorized successfully for ${result.user.displayName || 'Operator'}.`, 'SUCCESS');
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Google Auth rejected.');
      onAddLog('Failed to authorize Google Workspace API access.', 'WARN');
    } finally {
      setIsConnLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setCurrentUser(null);
      setAccessToken(null);
      setActiveSpace(null);
      onAddLog('Google Workspace account logged out.', 'INFO');
    } catch (err) {
      console.error(err);
    }
  };

  // Google Meet space creation API call is done on the client side using fetch
  const handleCreateMeetSpace = async () => {
    if (!accessToken) {
      setErrorText('Authorization token is missing. Please re-authenticate.');
      return;
    }

    setIsSpaceCreating(true);
    setErrorText(null);
    onAddLog(`Creating Google Meet space for [${selectedObjective}]...`, 'INFO');

    try {
      // POST to Google Meet API
      const response = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errDetails = await response.text();
        throw new Error(`Google Meet API failed: ${response.status} ${response.statusText}. ${errDetails}`);
      }

      const data = await response.json();
      
      const newSpace: MeetSpaceDetail = {
        name: data.name || 'spaces/unknown',
        meetingUri: data.meetingUri || `https://meet.google.com/${data.meetingCode || 'unknown'}`,
        meetingCode: data.meetingCode || 'unknown',
        objective: selectedObjective,
        timestamp: new Date().toLocaleTimeString()
      };

      setActiveSpace(newSpace);
      setSpaceHistory(prev => [newSpace, ...prev]);
      
      onAddLog(`Google Meet Space created: ${newSpace.meetingCode}`, 'SUCCESS');
      onAddLog(`War Room Link broadcasted successfully.`, 'SUCCESS');

    } catch (err: any) {
      console.error('[Meet Creation Fail]', err);
      setErrorText(err.message || 'Error occurred calling Google Meet v2 endpoint.');
      onAddLog('Failed to generate Google Meet space. Ensure scopes are allowed.', 'WARN');
    } finally {
      setIsSpaceCreating(false);
    }
  };

  return (
    <div className={`flex flex-col rounded-2xl border-2 p-4 space-y-4 shadow-xl select-none font-mono max-w-sm w-full transition-all duration-500 ${
      peaceAccordActive 
        ? 'border-amber-500/40 bg-zinc-950/95 shadow-[0_0_20px_rgba(245,158,11,0.15)] shadow-amber-950/30' 
        : 'border-zinc-800 bg-black/90'
    }`}>
      {/* Header */}
      <div className={`flex justify-between items-center border-b pb-2 ${peaceAccordActive ? 'border-amber-950/40' : 'border-zinc-900'}`}>
        <div className="flex items-center gap-2">
          {peaceAccordActive ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400 animate-pulse">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <VideoIcon className="w-4 h-4 text-emerald-500 animate-pulse" />
          )}
          <div>
            <span className={`text-[10px] font-black uppercase block tracking-widest ${peaceAccordActive ? 'text-amber-400' : 'text-emerald-500'}`}>
              {peaceAccordActive ? '🕊️ GLOBAL PEACE ASSEMBLY' : 'SOVEREIGN WAR ROOM CONTROLS'}
            </span>
            <span className="text-[7.5px] text-zinc-500 uppercase font-bold">
              {peaceAccordActive ? 'Google Meet Global Harmony Council Sync' : 'Google Meet Real-time Workspace Sync'}
            </span>
          </div>
        </div>
        {currentUser && (
          <button
            onClick={handleGoogleLogout}
            className="p-1 text-zinc-600 hover:text-rose-500 rounded border border-transparent hover:border-zinc-800 transition-all cursor-pointer flex items-center justify-center"
            title="Disconnect Google"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {errorText && (
        <div className="bg-red-950/40 border border-red-900 p-2.5 rounded text-[8px] text-red-400 capitalize whitespace-normal leading-relaxed">
          <span className="font-extrabold text-[9px] block">CRITICAL RETRIEVAL FAILURE</span>
          {errorText}
        </div>
      )}

      {/* Connection State */}
      {!currentUser ? (
        <div className="space-y-3 py-1">
          <p className="text-[8px] text-zinc-400 leading-relaxed uppercase">
            {peaceAccordActive 
              ? 'Sovereign peace ambassadors can launch joint harmony syncs via Google Meet. Authorize Google Workspace access to spin up secure rooms.'
              : 'Sovereign Shield operators can launch joint defense briefings via Google Meet. Authorize Google Workspace access to spin up secure rooms.'
            }
          </p>

          {/* Genuine Material-Styled Google Auth Button */}
          <button 
            type="button"
            onClick={handleGoogleLogin} 
            disabled={isConnLoading}
            className="w-full h-10 border border-zinc-700 bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-900 text-zinc-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-3 px-4 shadow transition-all duration-75 select-none font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnLoading ? (
              <SpinnerIcon className="w-4 h-4 animate-spin text-zinc-400" />
            ) : (
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
            )}
            <span className="truncate">{isConnLoading ? 'Connecting Network...' : 'Integrate Google Workspace'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Authenticated user banner */}
          <div className="flex items-center gap-2 bg-zinc-950 p-2 border border-zinc-900 rounded-lg">
            <img 
              src={currentUser.photoURL || 'https://www.transparenttextures.com/patterns/carbon-fibre.png'} 
              alt="Operator Profile" 
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full border border-zinc-800 shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'%3E%3C/path%3E%3C/svg%3E";
              }}
            />
            <div className="min-w-0 flex-1 leading-tight">
              <span className={`text-[8px] font-black block tracking-wider truncate uppercase ${peaceAccordActive ? 'text-amber-400' : 'text-emerald-400'}`}>
                {currentUser.displayName || (peaceAccordActive ? 'Sovereign Peace Ambassador' : 'Sovereign Operator')}
              </span>
              <span className="text-[6.5px] text-zinc-500 font-mono truncate block">
                {currentUser.email}
              </span>
            </div>
            <div className={`flex h-4 items-center gap-1 border px-1.5 rounded ${
              peaceAccordActive ? 'bg-amber-950/60 border-amber-900 text-amber-400 font-bold' : 'bg-emerald-950/60 border-emerald-900 text-emerald-400 font-bold'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${peaceAccordActive ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-[6px] font-black font-sans tracking-wide uppercase">
                {peaceAccordActive ? 'PEACE ACTIVE' : 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* Meeting config & trigger */}
          <div className="space-y-2">
            <div>
              <label className="text-[7.5px] font-black uppercase text-zinc-400 tracking-wider">
                {peaceAccordActive ? 'Peace Assembly Objective' : 'Defense War Room Objective'}
              </label>
              <select
                value={selectedObjective}
                onChange={(e) => setSelectedObjective(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-200 text-[8.5px] font-semibold font-mono rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {OBJECTIVES.map((obj, i) => (
                  <option key={i} value={obj}>{obj}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateMeetSpace}
              disabled={isSpaceCreating}
              className={`w-full h-9 border font-black text-[8.5px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 text-white ${
                peaceAccordActive 
                  ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-650 border-amber-500 hover:border-amber-400' 
                  : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-650 border-emerald-500 hover:border-emerald-400'
              }`}
            >
              {isSpaceCreating ? (
                <>
                  <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                  <span>{peaceAccordActive ? 'INITIALIZING HARMONY ASSEMBLY...' : 'INITIALIZING MEETING...'}</span>
                </>
              ) : (
                <>
                  {peaceAccordActive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <VideoIcon className="w-3.5 h-3.5" />
                  )}
                  <span>{peaceAccordActive ? 'ESTABLISH PEACE ASSEMBLY SPACE' : 'LAUNCH GOOGLE MEET SPACE'}</span>
                </>
              )}
            </button>
          </div>

          {/* Active Space Detail Box */}
          {activeSpace && (
            <div className={`border-2 p-3 rounded-xl space-y-2.5 shadow-md animate-in slide-in-from-bottom duration-200 ${
              peaceAccordActive ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' : 'bg-emerald-950/20 border-emerald-500/40 text-zinc-400'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[6.5px] font-black text-zinc-500 uppercase block tracking-wider leading-none">Space ID:</span>
                  <span className="text-[8px] font-bold text-zinc-300 font-mono leading-none">{activeSpace.name}</span>
                </div>
                <div className={`flex items-center gap-1 border px-1 rounded ${
                  peaceAccordActive ? 'bg-amber-950/60 border-amber-500/30 text-amber-400' : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${peaceAccordActive ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="text-[6px] font-black">{activeSpace.meetingCode}</span>
                </div>
              </div>
              
              <div className={`border-t border-dashed pt-2 space-y-1 text-[7px] ${peaceAccordActive ? 'border-amber-900/40 text-amber-300' : 'border-emerald-900/40 text-zinc-400'}`}>
                <p className="truncate"><span className="text-zinc-500 font-bold block pb-0.5 uppercase text-[6.5px]">{peaceAccordActive ? 'PEACE COUNCIL PLAN:' : 'MISSION BRIEFING:'}</span> {activeSpace.objective}</p>
                <p className="truncate text-zinc-300 font-bold"><span className="text-zinc-500 uppercase text-[6.5px]">{peaceAccordActive ? 'HARMONY PORTAL:' : 'LAUNCH ROOM:'}</span> <a href={activeSpace.meetingUri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">{activeSpace.meetingUri}</a></p>
              </div>

              <div className="pt-1 select-all">
                <a 
                  href={activeSpace.meetingUri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`w-full h-7 bg-zinc-950 hover:bg-zinc-900 border text-[8px] font-black rounded flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    peaceAccordActive ? 'border-amber-500 hover:border-amber-400 text-amber-400' : 'border-emerald-500 hover:border-emerald-400 text-emerald-400'
                  }`}
                >
                  {peaceAccordActive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400 shrink-0">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <VideoIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                  {peaceAccordActive ? 'JOIN PEACE ASSEMBLY ROOM' : 'JOIN GOOGLE MEET ROOM'}
                </a>
              </div>
            </div>
          )}

          {/* Space Creation History */}
          {spaceHistory.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest pl-1">
                {peaceAccordActive ? 'Active Peace Assembly Registry' : 'Active Space Registry'} ({spaceHistory.length})
              </p>
              <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                {spaceHistory.map((sh, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 p-1.5 rounded flex items-center justify-between text-[7px] font-mono leading-none">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-bold text-zinc-300 block truncate">{sh.objective}</span>
                      <a href={sh.meetingUri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 select-all font-semibold overflow-hidden">{sh.meetingCode} (Launched {sh.timestamp})</a>
                    </div>
                    <a 
                      href={sh.meetingUri} 
                      target="_blank"  
                      rel="noopener noreferrer"
                      className={`p-1 border rounded shrink-0 cursor-pointer ${
                        peaceAccordActive ? 'border-zinc-800 hover:border-amber-500/40 text-zinc-500 hover:text-amber-400' : 'border-zinc-800 hover:border-emerald-500/40 text-zinc-500 hover:text-emerald-400'
                      }`}
                    >
                      {peaceAccordActive ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      ) : (
                        <VideoIcon className="w-3 h-3" />
                      )}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
