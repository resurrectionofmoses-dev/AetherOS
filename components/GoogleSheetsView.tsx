import React, { useState, useEffect, useMemo } from 'react';
import { 
  googleSignIn, 
  googleSignOut, 
  initAuth 
} from '../services/firebaseAuthService';
import { User } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileSpreadsheet, 
  Lock, 
  RefreshCw, 
  Plus, 
  Check, 
  ChevronDown, 
  LogOut, 
  ArrowRight, 
  Table, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  CheckCircle2,
  FileText,
  AlertTriangle,
  Flame,
  Binary,
  TrendingUp,
  BarChart2,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  CartesianGrid
} from 'recharts';

interface GoogleSheetsViewProps {
  onAddLog?: (msg: string, type: 'INFO' | 'WARN' | 'SUCCESS') => void;
}

interface SpreadsheetMetadata {
  id: string;
  title: string;
  url: string;
  sheets: string[];
}

export const GoogleSheetsView: React.FC<GoogleSheetsViewProps> = ({ onAddLog }) => {
  const { user } = useAuth();
  // Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Sheets states
  const [spreadsheetUrlOrId, setSpreadsheetUrlOrId] = useState('');
  const [activeSpreadsheet, setActiveSpreadsheet] = useState<SpreadsheetMetadata | null>(() => {
    const saved = localStorage.getItem('aetheros_active_spreadsheet');
    return saved ? JSON.parse(saved) : null;
  });
  const [sheetsList, setSheetsList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number; originalValue: string; value: string } | null>(null);

  // New Row fields
  const [newRowValues, setNewRowValues] = useState<string[]>(['', '', '', '', '']);

  // Dynamic Data-Driven Calculations for Sheet Metrics
  const analyticsData = useMemo(() => {
    if (!sheetData || sheetData.length === 0) {
      return {
        hasData: false,
        rowCount: 0,
        columnCount: 0,
        numericMetrics: [],
        characterDensityMetrics: [],
        categoryDistribution: []
      };
    }

    const headers = sheetData[0] || [];
    const rows = sheetData.slice(1);
    const rowCount = rows.length;
    const columnCount = headers.length;

    // 1. Calculate Numeric Averages
    const numericMetrics: Array<{ column: string; average: number; min: number; max: number; count: number }> = [];
    // 2. Calculate Character density
    const characterDensityMetrics: Array<{ column: string; avgLength: number }> = [];
    // 3. Category distribution (typically column index 1 is Category)
    const categoryCounts: Record<string, number> = {};

    headers.forEach((header, colIdx) => {
      let numericSum = 0;
      let numericCount = 0;
      let minVal = Infinity;
      let maxVal = -Infinity;
      
      let charLengthSum = 0;

      rows.forEach((row) => {
        const cellValue = row[colIdx];
        if (cellValue !== undefined && cellValue !== null) {
          const strVal = String(cellValue);
          charLengthSum += strVal.length;

          // Strip typical formatting and try parsing clean floating value
          const cleaned = strVal.replace(/[^\d.-]/g, '');
          const num = parseFloat(cleaned);
          if (!isNaN(num) && cleaned !== '') {
            numericSum += num;
            numericCount++;
            if (num < minVal) minVal = num;
            if (num > maxVal) maxVal = num;
          }

          // If mapping Category column
          if (colIdx === 1) {
            const cat = strVal.trim() || 'UNSPECIFIED';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          }
        }
      });

      const avgCharLength = rowCount > 0 ? charLengthSum / rowCount : 0;
      characterDensityMetrics.push({
        column: header || `Col ${String.fromCharCode(65 + colIdx)}`,
        avgLength: parseFloat(avgCharLength.toFixed(1))
      });

      if (numericCount > 0) {
        numericMetrics.push({
          column: header || `Col ${String.fromCharCode(65 + colIdx)}`,
          average: parseFloat((numericSum / numericCount).toFixed(2)),
          min: minVal,
          max: maxVal,
          count: numericCount
        });
      }
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));

    return {
      hasData: true,
      rowCount,
      columnCount,
      numericMetrics,
      characterDensityMetrics,
      categoryDistribution
    };
  }, [sheetData]);

  // Log templates lists (to simulate loading system milestones & threat logs for export)
  const systemEventsTemplate = [
    { type: 'MILESTONE', title: 'Sovereign Attunement', info: 'Layer 1/2 stabilized at 1.33GB limit', pow: '7_IN_OUT_COMPROMISE' },
    { type: 'THREAT', title: 'Exotic Decoupler Purge', info: 'VECT_S-1290 neutralized successfully', pow: 'ENTROPY_RELECT_SHIELD' },
    { type: 'BACKUP', title: 'Disk [D:] Backup Synclink', info: 'All core parameters compressed & encrypted', pow: 'COMPRESSED_AES_256' },
    { type: 'MILESTONE', title: 'F:[node] Golden Delivery', info: 'Resurrection master module synchrony completed', pow: 'MOCK_API_WORLD_HACK' }
  ];

  // Listener for user Auth state changes
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

  // Save spreadsheet to localStorage
  useEffect(() => {
    if (activeSpreadsheet) {
      localStorage.setItem('aetheros_active_spreadsheet', JSON.stringify(activeSpreadsheet));
    } else {
      localStorage.removeItem('aetheros_active_spreadsheet');
    }
  }, [activeSpreadsheet]);

  // Google Sign In Trigger
  const handleConnect = async () => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        if (onAddLog) onAddLog(`Sovereign Google Sheets link active for user: ${res.user.displayName}`, 'SUCCESS');
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'OAuth Connection Refused');
      if (onAddLog) onAddLog(`Sheets connection error: ${err.message}`, 'WARN');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign Out Trigger
  const handleDisconnect = async () => {
    if (window.confirm("Disconnect Sovereign Google Sheets ledger? The connection token will be voided in memory.")) {
      try {
        await googleSignOut();
        setCurrentUser(null);
        setAccessToken(null);
        setSheetData([]);
        setActiveSpreadsheet(null);
        if (onAddLog) onAddLog('Google Workspace Sheets session terminated.', 'INFO');
      } catch (err: any) {
        setErrorText(err.message);
      }
    }
  };

  // Extracts ID from standard sheets URLs
  const parseSpreadsheetId = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.startsWith('https://')) {
      const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : trimmed;
    }
    return trimmed;
  };

  // Creates a beautiful, template-bound sheet
  const handleCreateNewSpreadsheet = async () => {
    if (!accessToken) return;
    setIsDataLoading(true);
    setErrorText(null);

    const title = prompt("Specify Sovereign Ledger Title:", "AetherOS System Log Ledger");
    if (!title) {
      setIsDataLoading(false);
      return;
    }

    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title },
          sheets: [
            {
              properties: { title: 'Security Log Ledger' }
            }
          ]
        })
      });

      if (!res.ok) {
        throw new Error(`Create Failed: HTTP ${res.status}`);
      }

      const data = await res.json();
      const newId = data.spreadsheetId;
      const meta: SpreadsheetMetadata = {
        id: newId,
        title: data.properties.title,
        url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${newId}/edit`,
        sheets: data.sheets?.map((s: any) => s.properties.title) || ['Security Log Ledger']
      };

      setActiveSpreadsheet(meta);
      setSelectedSheet(meta.sheets[0]);
      
      if (onAddLog) onAddLog(`Created and mounted Sovereign Sheet: ${meta.title}`, 'SUCCESS');

      // Initialize columns in new sheet (Needs confirmation)
      await initializeSheetColumns(newId, meta.sheets[0]);
    } catch (err: any) {
      console.error(err);
      setErrorText(`Creation fault: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Mounts an existing sheet using path URL or ID
  const handleLoadSpreadsheet = async () => {
    if (!accessToken || !spreadsheetUrlOrId) {
      setErrorText("Input spreadsheet credentials or spreadsheet URL");
      return;
    }

    setIsDataLoading(true);
    setErrorText(null);
    const id = parseSpreadsheetId(spreadsheetUrlOrId);

    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        throw new Error(`Import Failed: HTTP ${res.status}. Verify spreadsheet is accessible to your Google account.`);
      }

      const data = await res.json();
      const meta: SpreadsheetMetadata = {
        id: data.spreadsheetId,
        title: data.properties.title,
        url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}/edit`,
        sheets: data.sheets?.map((s: any) => s.properties.title) || ['Sheet1']
      };

      setActiveSpreadsheet(meta);
      setSheetsList(meta.sheets);
      if (meta.sheets.length > 0) {
        setSelectedSheet(meta.sheets[0]);
      }
      if (onAddLog) onAddLog(`Mounted Sovereign Spreadsheet: ${meta.title}`, 'SUCCESS');
    } catch (err: any) {
      console.error(err);
      setErrorText(`Import failure: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Loads active worksheet values
  const loadSheetData = async (sheetName?: string) => {
    const targetSheet = sheetName || selectedSheet;
    if (!accessToken || !activeSpreadsheet || !targetSheet) return;

    setIsDataLoading(true);
    setErrorText(null);

    // Fetch range A1:Z100
    const range = `${encodeURIComponent(targetSheet)}!A1:Z100`;
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${activeSpreadsheet.id}/values/${range}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        throw new Error(`Fetch failed: HTTP ${res.status}`);
      }

      const data = await res.json();
      setSheetData(data.values || []);
    } catch (err: any) {
      console.error(err);
      setErrorText(`Read error on range: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (activeSpreadsheet && selectedSheet && accessToken) {
      loadSheetData();
    }
  }, [activeSpreadsheet?.id, selectedSheet, accessToken]);

  // Sets up system ledger headers inside the sheets
  const initializeSheetColumns = async (id: string, name: string) => {
    if (!accessToken) return;
    
    // Auto populate template column headers: Timestamp | Category | Title / Details | Proof of Work | Security Node Code
    const range = `${encodeURIComponent(name)}!A1:E1`;
    const body = {
      values: [['Timestamp (UTC)', 'Category', 'Description/Metrics', 'PoW Certificate', 'Network Source Node']]
    };

    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      loadSheetData();
    } catch (e) {
      console.error("Column header allocation error", e);
    }
  };

  // Modifies a single cell value. MANDATORY confirmation is requested
  const handleCellModifySubmit = async () => {
    if (!accessToken || !activeSpreadsheet || !selectedSheet || !editingCell) return;

    // MANDATORY explicit user confirmation prior to data mutation
    const confirmText = `MUTATE SHEETS DATA VECTORS?
You are rewriting coordinates at Row ${editingCell.row + 1}, Column ${editingCell.col + 1}
from "${editingCell.originalValue}" to "${editingCell.value}".
This will commit immediately to live Google Sheets.`;

    if (!window.confirm(confirmText)) {
      setEditingCell(null);
      return;
    }

    setIsDataLoading(true);
    setErrorText(null);

    // Calculate sheet range format (A1 index)
    const colLetter = String.fromCharCode(65 + editingCell.col); // A, B, C...
    const cellRange = `${selectedSheet}!${colLetter}${editingCell.row + 1}`;
    
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${activeSpreadsheet.id}/values/${cellRange}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [[editingCell.value]]
        })
      });

      if (!res.ok) {
        throw new Error(`Write failed with HTTP code ${res.status}`);
      }

      if (onAddLog) onAddLog(`Committed cell coordinate changes at ${colLetter}${editingCell.row + 1}`, 'SUCCESS');
      setEditingCell(null);
      await loadSheetData();
    } catch (err: any) {
      console.error(err);
      setErrorText(`Cell save error: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Appends raw custom values. MANDATORY confirmation requested.
  const handleAppendRow = async () => {
    if (!accessToken || !activeSpreadsheet || !selectedSheet) return;

    const rowText = newRowValues.map(v => v || '-').join(' | ');
    if (!window.confirm(`APPEND LIVE LEDGER ITEM RECORD? \n\nTarget metrics:\n${rowText}\n\nProceed with Google Sheets update?`)) {
      return;
    }

    setIsDataLoading(true);
    setErrorText(null);

    const range = `${selectedSheet}!A1`;
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${activeSpreadsheet.id}/values/${range}:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [newRowValues]
        })
      });

      if (!res.ok) {
        throw new Error(`Append failed with HTTP code ${res.status}`);
      }

      setNewRowValues(['', '', '', '', '']);
      if (onAddLog) onAddLog(`Successfully appended custom record to sheet ledger.`, 'SUCCESS');
      await loadSheetData();
    } catch (err: any) {
      console.error(err);
      setErrorText(`Row append error: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Injects preloaded system events into Google Sheets. MANDATORY validation checks applied.
  const handleInjectSystemEvent = async (event: { type: string; title: string; info: string; pow: string }) => {
    if (!accessToken || !activeSpreadsheet || !selectedSheet) {
      alert("Authenticate and link spreadsheet first!");
      return;
    }

    const timestamp = new Date().toISOString();
    const sourceNode = user?.machineId || 'AETHER_NODE_Z_77';
    const valuesList = [timestamp, event.type, `${event.title} - ${event.info}`, event.pow, sourceNode];

    if (!window.confirm(`SOVEREIGN INTEGRATION RECORD TRANSMISSION: \n\nWill push concrete system milestone directly:\nCategory: [${event.type}]\nTitle: ${event.title}\nProof of Work: ${event.pow}\n\nApply synchrony link?`)) {
      return;
    }

    setIsDataLoading(true);
    setErrorText(null);

    const range = `${selectedSheet}!A1`;
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${activeSpreadsheet.id}/values/${range}:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [valuesList]
        })
      });

      if (!res.ok) {
        throw new Error(`Injection failed with status ${res.status}`);
      }

      if (onAddLog) onAddLog(`Milestone log synchronized onto live sheet.`, 'SUCCESS');
      await loadSheetData();
    } catch (err: any) {
      console.error(err);
      setErrorText(`Transmission fault: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  return (
    <div id="aetheros-google-sheets-dashboard" className="flex-1 flex flex-col p-6 bg-zinc-950 font-sans text-zinc-300 overflow-y-auto selection:bg-red-950 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-red-500 font-extrabold uppercase text-xs tracking-widest">
            <Binary className="w-3.5 h-3.5" />
            Sovereign Ledger Conduction
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight font-sans mt-1">Google Sheets Workspace</h1>
          <p className="text-zinc-500 text-xs mt-1 leading-normal max-w-2xl">
            Read, audit, write, and trace absolute system records across secure spreadsheets via the Google Workspace API.
            Synchronize AetherOS threat mitigation files and cryptographic concrete milestones in real-time.
          </p>
        </div>

        {/* Integration Status Label / Toggle */}
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-zinc-900/60 p-2.5 border border-zinc-800 rounded-xl">
              {currentUser.photoURL && (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-red-500/50"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">{currentUser.displayName || 'Operator Connected'}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">{currentUser.email}</p>
              </div>
              <button 
                onClick={handleDisconnect}
                className="ml-3 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-950/20 rounded transition-colors"
                title="Disconnect Workspace"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleConnect}
              className="gsi-material-button text-xs py-2 px-4 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl border border-zinc-700 flex items-center gap-2 hover:border-red-500/50 transition-all font-semibold font-sans cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {errorText && (
        <div className="mb-6 p-4 bg-red-950/20 border-2 border-red-900/50 text-red-400 rounded-xl text-xs flex items-start gap-2 select-text font-mono">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="font-bold">CONDUCTION ANOMALY DETECTED:</span> {errorText}
          </div>
        </div>
      )}

      {/* Main Panel Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Control Board (Authentication block + file details) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* File mount controller */}
          <div className="bg-zinc-900/40 border-2 border-zinc-900 rounded-2xl p-5 text-left">
            <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              Ledger Allocation
            </h2>

            {currentUser ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase block mb-1">Spreadsheet URL / ID</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="flex-1 bg-black border border-zinc-800 rounded-lg py-2 px-3 text-xs placeholder:text-zinc-700 focus:outline-none focus:border-red-500 select-text"
                      placeholder="Input Spreadsheet ID or URL"
                      value={spreadsheetUrlOrId}
                      onChange={(e) => setSpreadsheetUrlOrId(e.target.value)}
                    />
                    <button 
                      onClick={handleLoadSpreadsheet}
                      className="px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-xs font-black transition-colors"
                      disabled={isDataLoading}
                    >
                      LOAD
                    </button>
                  </div>
                  <span className="text-[9px] text-zinc-500 block mt-1 leading-normal">
                    Pasting a file URL extracts the target sheet id instantly.
                  </span>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-900"></div>
                  <span className="flex-shrink mx-4 text-zinc-650 text-[9px] font-black uppercase tracking-widest">OR</span>
                  <div className="flex-grow border-t border-zinc-900"></div>
                </div>

                <button 
                  onClick={handleCreateNewSpreadsheet}
                  className="w-full py-2.5 bg-emerald-950/20 hover:bg-emerald-900/20 text-emerald-400 border border-emerald-900/60 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:border-emerald-500/50"
                  disabled={isDataLoading}
                >
                  <Plus className="w-4 h-4" />
                  INITIATE NEW SPREADSHEET
                </button>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Lock className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                <p className="text-xs text-zinc-650 font-bold mb-4">Awaiting security clearance from user.</p>
                <p className="text-[10px] text-zinc-600 leading-normal">
                  You must confirm Google Account linkage inside the sovereign portal to fetch spreadheet models through the sandboxed client.
                </p>
              </div>
            )}
          </div>

          {/* Connected Spreadsheet metadata details */}
          {activeSpreadsheet && (
            <div className="bg-zinc-900/40 border-2 border-zinc-900 rounded-2xl p-5 text-left animate-in fade-in">
              <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                Active Document Details
              </h2>
              
              <div className="space-y-3.5">
                <div>
                  <span className="text-[9px] text-zinc-600 block font-bold uppercase mb-0.5">Spreadsheet Name</span>
                  <span className="text-white text-sm font-extrabold select-text">{activeSpreadsheet.title}</span>
                </div>

                <div>
                  <span className="text-[9px] text-zinc-600 block font-bold uppercase mb-0.5">Google Sheets URL</span>
                  <a 
                    href={activeSpreadsheet.url}
                    target="_blank"
                    className="text-[11px] text-red-400 inline-flex items-center gap-1 hover:underline select-text truncate break-all max-w-full"
                    referrerPolicy="no-referrer"
                  >
                    View spreadsheet on Google Drive
                    <ArrowRight className="w-3 h-3 block shrink-0" />
                  </a>
                </div>

                <div>
                  <label className="text-[9px] text-zinc-600 font-extrabold uppercase block mb-1">Target Worksheet (Tab)</label>
                  <div className="relative">
                    <select 
                      value={selectedSheet}
                      onChange={(e) => setSelectedSheet(e.target.value)}
                      className="w-full bg-black border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-red-500 appearance-none"
                    >
                      {activeSpreadsheet.sheets.map((title) => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-500 absolute top-2.5 right-3 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => loadSheetData()}
                    className="flex-1 py-1 px-3 bg-zinc-900 hover:bg-zinc-800 text-[10px] border border-zinc-800 hover:border-zinc-700 text-white rounded-lg flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider transition-colors"
                    disabled={isDataLoading}
                  >
                    <RefreshCw className={`w-3 h-3 ${isDataLoading ? 'animate-spin' : ''}`} />
                    Sync Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System event trace stream injector */}
          <div className="bg-zinc-900/20 border-2 border-zinc-900 rounded-2xl p-5 text-left">
            <h2 className="text-xs font-black text-white uppercase tracking-widest mb-3.5 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              Trace Transmissions
            </h2>
            <p className="text-[10px] text-zinc-500 leading-normal mb-4">
              Export concrete milestones or threat radar incident parameters directly into the connected Google Sheet.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {systemEventsTemplate.map((evt, id) => (
                <div 
                  key={id}
                  className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-xl flex items-center justify-between group hover:border-zinc-800 transition-colors"
                >
                  <div className="text-left w-2/3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[7px] font-black px-1.5 rounded p-[1px] uppercase ${evt.type === 'THREAT' ? 'bg-red-950 border border-red-900 text-red-400' : 'bg-zinc-900 text-zinc-400' }`}>
                        {evt.type}
                      </span>
                      <span className="text-[10px] font-bold text-white truncate">{evt.title}</span>
                    </div>
                    <p className="text-[8px] text-zinc-500 mt-1 truncate">{evt.info}</p>
                  </div>
                  <button 
                    onClick={() => handleInjectSystemEvent(evt)}
                    className="p-1 px-2.5 bg-zinc-900 text-zinc-400 text-[9px] font-black rounded border border-zinc-800 hover:border-red-500/50 hover:text-white transition-all flex items-center gap-1 shrink-0"
                    title="Transmit log on Google Sheet ledger"
                  >
                    <Upload className="w-2.5 h-2.5" />
                    PUSH
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Active Grid Table Cell */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-zinc-900/40 border-2 border-zinc-900 rounded-2xl p-5 text-left flex flex-col min-h-[300px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-3 mb-4 gap-2">
              <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <Table className="w-4 h-4 text-emerald-500" />
                Spreadsheet Live Ledger Table [A1:E100]
              </h2>
              {isDataLoading && (
                <div className="text-[10px] text-emerald-400 uppercase font-black tracking-widest flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Updating Cell Matrix...
                </div>
              )}
            </div>

            {/* Editing Overlay Cell popup */}
            {editingCell && (
              <div className="mb-4 bg-zinc-950 p-3.5 border border-red-500/50 rounded-xl relative text-left">
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold mb-2">
                  <Edit3 className="w-3 h-3 text-red-400" />
                  CELL MATRIX MODIFICATION GATEWAY: Row {editingCell.row + 1}, Col {editingCell.col + 1}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-black text-white border border-zinc-800 py-1.5 px-3 rounded-md text-xs select-text focus:outline-none focus:border-red-500"
                    value={editingCell.value}
                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                  />
                  <button 
                    onClick={handleCellModifySubmit}
                    className="px-3 py-1.5 bg-red-950 border border-red-900 rounded-md text-red-400 text-xs font-extrabold uppercase"
                  >
                    Mutate
                  </button>
                  <button 
                    onClick={() => setEditingCell(null)}
                    className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 text-xs"
                  >
                    Abort
                  </button>
                </div>
              </div>
            )}

            {/* Grid Table */}
            <div className="flex-1 overflow-x-auto select-none">
              {!currentUser ? (
                <div className="py-20 text-center text-zinc-650 flex flex-col items-center justify-center">
                  <ShieldAlert className="w-12 h-12 mb-3.5 text-zinc-800" />
                  <p className="text-sm font-extrabold text-white uppercase tracking-tight">Access Token Rejected</p>
                  <p className="text-[10px] text-zinc-600 mt-1 max-w-sm leading-normal">
                    Secure spreadsheet interactions are disabled until Google authorization handles the security handshake in the toolbar above.
                  </p>
                </div>
              ) : !activeSpreadsheet ? (
                <div className="py-20 text-center text-zinc-650 flex flex-col items-center justify-center">
                  <FileSpreadsheet className="w-12 h-12 mb-3.5 text-zinc-800 animate-pulse" />
                  <p className="text-sm font-extrabold text-zinc-500 uppercase tracking-tight">No Sovereign Ledger Selected</p>
                  <p className="text-[10px] text-zinc-600 mt-1 max-w-sm leading-normal">
                    Enter an existing Google spreadsheet link or initialize a brand new document using our cryptographic allocation template panel.
                  </p>
                </div>
              ) : sheetData.length === 0 ? (
                <div className="py-20 text-center text-zinc-650 flex flex-col items-center justify-center">
                  <Table className="w-12 h-12 mb-3.5 text-zinc-800" />
                  <p className="text-xs font-extrabold text-zinc-500 uppercase">Sheet is Empty or Loading</p>
                  <button 
                    className="mt-3.5 px-3 py-1.5 text-[9px] font-black border border-emerald-900 bg-emerald-950/20 text-emerald-400 rounded-lg hover:border-emerald-500 transition-all uppercase tracking-wide"
                    onClick={() => initializeSheetColumns(activeSpreadsheet.id, selectedSheet)}
                  >
                    Auto-Fill Standard AetherOS Columns
                  </button>
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse select-text">
                  <thead>
                    <tr className="bg-zinc-950 text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold">
                      {sheetData[0].slice(0, 5).map((col, idx) => (
                        <th key={idx} className="p-3 border-b-2 border-zinc-900 truncate max-w-[120px]">{col}</th>
                      ))}
                      <th className="p-3 border-b-2 border-zinc-900 text-right">Gate Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheetData.slice(1).map((row, rIdx) => (
                      <tr 
                        key={rIdx} 
                        className="border-b border-zinc-900/60 hover:bg-zinc-900/20 transition-colors"
                      >
                        {Array.from({ length: 5 }).map((_, cIdx) => {
                          const val = row[cIdx] || '';
                          return (
                            <td key={cIdx} className="p-3 truncate max-w-[150px] font-mono pr-2" title={val}>
                              {val}
                            </td>
                          );
                        })}
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => setEditingCell({
                              row: rIdx + 1, // Skip header row
                              col: 0,
                              originalValue: row[0] || '',
                              value: row[0] || ''
                            })}
                            className="text-[9px] font-black text-red-500 px-2 py-1 bg-red-950/20 border border-red-900/30 hover:border-red-500 hover:bg-red-950/40 rounded transition-all mr-1.5"
                          >
                            Edit Row
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick append row panel (Requires explicit secure confirmation) */}
            {activeSpreadsheet && sheetData.length > 0 && (
              <div className="mt-6 pt-4 border-t border-zinc-900 text-left animate-in fade-in">
                <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest block mb-3.5 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  Sovereign Document Line Append Tool
                </span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-3.5">
                  <input 
                    type="text" 
                    className="bg-black text-[11px] font-mono border border-zinc-850 p-2 rounded-lg py-1.5 select-text focus:outline-none focus:border-red-500"
                    placeholder="Timestamp/Metric"
                    value={newRowValues[0]}
                    onChange={(e) => {
                      const updated = [...newRowValues];
                      updated[0] = e.target.value;
                      setNewRowValues(updated);
                    }}
                  />
                  <input 
                    type="text" 
                    className="bg-black text-[11px] font-mono border border-zinc-855 p-2 rounded-lg py-1.5 select-text focus:outline-none focus:border-red-500"
                    placeholder="Category"
                    value={newRowValues[1]}
                    onChange={(e) => {
                      const updated = [...newRowValues];
                      updated[1] = e.target.value;
                      setNewRowValues(updated);
                    }}
                  />
                  <input 
                    type="text" 
                    className="bg-black text-[11px] font-mono border border-zinc-855 p-2 rounded-lg py-1.5 select-text focus:outline-none focus:border-red-500"
                    placeholder="Details/Description"
                    value={newRowValues[2]}
                    onChange={(e) => {
                      const updated = [...newRowValues];
                      updated[2] = e.target.value;
                      setNewRowValues(updated);
                    }}
                  />
                  <input 
                    type="text" 
                    className="bg-black text-[11px] font-mono border border-zinc-855 p-2 rounded-lg py-1.5 select-text focus:outline-none focus:border-red-500"
                    placeholder="Proof of Work Code"
                    value={newRowValues[3]}
                    onChange={(e) => {
                      const updated = [...newRowValues];
                      updated[3] = e.target.value;
                      setNewRowValues(updated);
                    }}
                  />
                  <input 
                    type="text" 
                    className="bg-black text-[11px] font-mono border border-zinc-855 p-2 rounded-lg py-1.5 select-text focus:outline-none focus:border-red-500"
                    placeholder="Node Key / Machine ID"
                    value={newRowValues[4]}
                    onChange={(e) => {
                      const updated = [...newRowValues];
                      updated[4] = e.target.value;
                      setNewRowValues(updated);
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => {
                      const updated = [...newRowValues];
                      updated[0] = new Date().toISOString();
                      updated[1] = 'MILESTONE';
                      updated[4] = user?.machineId || 'AETHER_NODE';
                      setNewRowValues(updated);
                    }}
                    className="px-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold uppercase"
                  >
                    Load Live Metrics
                  </button>
                  <button 
                    onClick={handleAppendRow}
                    className="px-4 py-2 bg-emerald-950 border border-emerald-900 text-emerald-400 hover:text-white hover:border-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    APPEND NEW LINE ENTRY
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Structured Sovereign Analytic Dashboard Panel */}
      <div className="mt-8 bg-zinc-900/30 border-2 border-zinc-900 rounded-3xl p-6 text-left animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 mb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold uppercase text-[10px] tracking-widest">
              <BarChart2 className="w-3.5 h-3.5" />
              Sovereign Ledger Analytic Dashboard
            </div>
            <h3 className="text-base font-black text-white tracking-tight mt-1">Data-Driven Quality Profile</h3>
          </div>
          {analyticsData.hasData && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">
                <span className="text-zinc-500 font-bold uppercase text-[9px]">ROWS LOADED:</span>{' '}
                <span className="text-white font-black">{analyticsData.rowCount}</span>
              </div>
              <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">
                <span className="text-zinc-500 font-bold uppercase text-[9px]">COLUMNS DETECTED:</span>{' '}
                <span className="text-emerald-400 font-black">{analyticsData.columnCount}</span>
              </div>
            </div>
          )}
        </div>

        {!currentUser ? (
          <div className="py-12 text-center text-zinc-650 flex flex-col items-center justify-center">
            <Lock className="w-8 h-8 mb-2.5 text-zinc-800" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Metric Calculations Sandboxed</p>
            <p className="text-[10px] text-zinc-600 max-w-md mt-1 leading-normal">
              Authorize account session to decrypt spreadsheet metadata counters and execute real-time statistical analytics.
            </p>
          </div>
        ) : !activeSpreadsheet ? (
          <div className="py-12 text-center text-zinc-650 flex flex-col items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 mb-2.5 text-zinc-800" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Waiting for Document Load</p>
            <p className="text-[10px] text-zinc-600 max-w-md mt-1 leading-normal">
              Mount an absolute ledger above to query database size distribution, numerical means, and character densities.
            </p>
          </div>
        ) : !analyticsData.hasData || analyticsData.rowCount === 0 ? (
          <div className="py-12 text-center text-zinc-650 flex flex-col items-center justify-center">
            <Table className="w-8 h-8 mb-2.5 text-zinc-800" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">No Worksheet Records Found</p>
            <p className="text-[10px] text-zinc-600 max-w-sm mt-1 leading-normal">
              Populate cells with logging vectors or sync template milestones to render historical analytics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Visual breakdown widget 1: Quick stats */}
            <div className="lg:col-span-4 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider mb-3">Live Document Metadata</span>
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-900/50">
                    <span className="text-zinc-400 font-sans">Total Rows Loaded:</span>
                    <span className="text-white font-bold">{analyticsData.rowCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-900/50">
                    <span className="text-zinc-400 font-sans">Total Columns:</span>
                    <span className="text-white font-bold">{analyticsData.columnCount}</span>
                  </div>
                  {analyticsData.numericMetrics.length > 0 ? (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-900/50">
                      <span className="text-zinc-400 font-sans">Numeric Columns:</span>
                      <span className="text-emerald-400 font-bold">{analyticsData.numericMetrics.length}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-900/50">
                      <span className="text-zinc-400 font-sans">Numeric Columns:</span>
                      <span className="text-zinc-500 italic font-sans text-[10px]">None detected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category distribution if present */}
              {analyticsData.categoryDistribution.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-900">
                  <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider mb-2">Category Frequency Breakdown</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {analyticsData.categoryDistribution.map((item, idx) => {
                      const percentage = analyticsData.rowCount > 0 ? Math.round((item.value / analyticsData.rowCount) * 100) : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                            <span className="text-zinc-300 font-bold truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 font-semibold shrink-0">
                            <span>{item.value} entries</span>
                            <span className="text-zinc-400">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Visual breakdown widget 2: Graphical Column Average Values (Numerical Averages or Fallback character density averages) */}
            <div className="lg:col-span-8 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider">Average Values Distribution</span>
                  <p className="text-[9px] text-zinc-500 font-sans mt-0.5">
                    {analyticsData.numericMetrics.length > 0 
                      ? "Calculated mathematical mean values from numeric worksheet columns." 
                      : "Calculated fallback average text length (character density) per column."}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900/40 p-1 rounded-md border border-zinc-900 shrink-0">
                  <span className="text-[8px] px-1.5 py-0.5 rounded uppercase font-black font-mono bg-zinc-950 text-emerald-400 border border-zinc-900">
                    {analyticsData.numericMetrics.length > 0 ? 'Pure Metrics' : 'Char Length Fallback'}
                  </span>
                </div>
              </div>

              {/* Bar Chart representing data averages */}
              <div className="flex-1 min-h-[160px] h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(analyticsData.numericMetrics.length > 0 ? analyticsData.numericMetrics : analyticsData.characterDensityMetrics) as any[]}
                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="column" 
                      stroke="#52525b" 
                      fontSize={8} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={8} 
                      tickLine={false} 
                      axisLine={false}
                      domain={[0, 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                      labelClassName="text-white text-[10px] font-mono font-bold"
                      itemStyle={{ color: '#10b981', fontSize: '9px', fontFamily: 'monospace' }}
                      formatter={(value: any) => [value, analyticsData.numericMetrics.length > 0 ? "Average Value" : "Avg Characters"]}
                    />
                    <Bar 
                      dataKey={analyticsData.numericMetrics.length > 0 ? "average" : "avgLength"} 
                      fill="#ef4444" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={32}
                    >
                      {(analyticsData.numericMetrics.length > 0 ? analyticsData.numericMetrics : analyticsData.characterDensityMetrics).map((entry, index) => {
                        const colors = ['#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary / legend card */}
              <div className="mt-4 pt-3 border-t border-zinc-900 grid grid-cols-2 lg:grid-cols-4 gap-2 text-[10px] font-mono">
                {(analyticsData.numericMetrics.length > 0 ? analyticsData.numericMetrics : analyticsData.characterDensityMetrics).slice(0, 4).map((m, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-900 text-left">
                    <span className="text-zinc-500 block truncate">{m.column}</span>
                    <span className="text-white font-extrabold text-[11px] block mt-0.5">
                      {'average' in m ? m.average : ('avgLength' in m ? m.avgLength : 0)}
                      <span className="text-[8px] text-zinc-500 font-normal ml-1">
                        {'average' in m ? 'mean' : 'char avg'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Audit notes */}
      <div className="mt-8 pt-4 border-t border-zinc-900 text-[10px] text-zinc-600 flex flex-col md:flex-row md:items-center justify-between font-mono gap-2 text-left">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>F:[integrity_conduction] status secure, logic compromise verified</span>
        </div>
        <span>AetherOS Version 7.1.1 - Conformance Verified</span>
      </div>

    </div>
  );
};
