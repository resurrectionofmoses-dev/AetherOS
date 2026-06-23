import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Vehicle } from '../types';
import { ShieldIcon, ServerIcon, ActivityIcon, WrenchIcon, PlusIcon, TrashIcon, CheckIcon } from './icons';
import { EngineTuningInterface } from './EngineTuningInterface';

interface VehicleManagementViewProps {
    vehicles: Vehicle[];
    onAddVehicle: (vehicle: Vehicle) => void;
    onUpdateVehicle: (vehicle: Vehicle) => void;
    onDeleteVehicle: (id: string) => void;
    onSetActiveVehicle: (id: string) => void;
    availableCPH?: number;
}

export const VehicleManagementView: React.FC<VehicleManagementViewProps> = ({
    vehicles,
    onAddVehicle,
    onUpdateVehicle,
    onDeleteVehicle,
    onSetActiveVehicle,
    availableCPH = 715
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newMake, setNewMake] = useState('');
    const [newModel, setNewModel] = useState('');
    const [newYear, setNewYear] = useState(new Date().getFullYear());
    const [newVin, setNewVin] = useState('');
    const [newLicensePlate, setNewLicensePlate] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const handleAddVehicle = () => {
        if (!newMake || !newModel || !newYear) return;
        
        const newVehicle: Vehicle = {
            id: uuidv4(),
            make: newMake,
            model: newModel,
            year: newYear,
            vin: newVin.toUpperCase(),
            licensePlate: newLicensePlate.toUpperCase(),
            isActive: vehicles.length === 0, // Make active if it's the first one
            systemStatus: {
                engine: 'OK',
                battery: 'OK',
                navigation: 'OK'
            }
        };

        onAddVehicle(newVehicle);
        setIsAdding(false);
        setNewMake('');
        setNewModel('');
        setNewYear(new Date().getFullYear());
        setNewVin('');
        setNewLicensePlate('');
    };

    return (
        <div className="flex-1 flex flex-col bg-black text-gray-200 overflow-hidden font-mono relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,255,128,0.05)_0%,_transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="p-6 border-b-4 border-green-900/50 bg-black/80 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600/10 border-2 border-green-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,128,0.2)]">
                        <ServerIcon className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Garage Protocol</h1>
                        <p className="text-[10px] text-green-500 font-bold tracking-[0.2em] uppercase">Fleet Management & Telemetry</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 border border-green-500/50 rounded hover:bg-green-600/40 transition-colors uppercase text-xs font-bold tracking-wider"
                >
                    <PlusIcon className="w-4 h-4" />
                    Register Vehicle
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 z-10 custom-scrollbar">
                {isAdding && (
                    <div className="mb-8 bg-black/60 border-2 border-green-500/30 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,128,0.1)]">
                        <h2 className="text-sm font-black text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4" />
                            New Vehicle Registration
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Make</label>
                                <input 
                                    type="text" 
                                    value={newMake} 
                                    onChange={(e) => setNewMake(e.target.value)}
                                    className="w-full bg-black border border-green-900/50 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                                    placeholder="e.g. Tesla"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Model</label>
                                <input 
                                    type="text" 
                                    value={newModel} 
                                    onChange={(e) => setNewModel(e.target.value)}
                                    className="w-full bg-black border border-green-900/50 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                                    placeholder="e.g. Model 3"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Year</label>
                                <input 
                                    type="number" 
                                    value={newYear} 
                                    onChange={(e) => setNewYear(parseInt(e.target.value))}
                                    className="w-full bg-black border border-green-900/50 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">VIN (Optional)</label>
                                <input 
                                    type="text" 
                                    value={newVin} 
                                    onChange={(e) => setNewVin(e.target.value)}
                                    className="w-full bg-black border border-green-900/50 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors uppercase"
                                    placeholder="17-Character VIN"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">License Plate (Optional)</label>
                                <input 
                                    type="text" 
                                    value={newLicensePlate} 
                                    onChange={(e) => setNewLicensePlate(e.target.value)}
                                    className="w-full bg-black border border-green-900/50 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors uppercase"
                                    placeholder="e.g. AETHER1"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddVehicle}
                                disabled={!newMake || !newModel || !newYear}
                                className="px-6 py-2 bg-green-600 text-black text-xs font-black rounded hover:bg-green-500 transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {vehicles.length === 0 && !isAdding && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-green-900/30 rounded-xl bg-black/40">
                            <WrenchIcon className="w-12 h-12 text-green-900/50 mb-4" />
                            <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">No vehicles registered</p>
                            <p className="text-gray-600 text-xs mt-2">Initialize garage protocol to begin telemetry tracking</p>
                        </div>
                    )}

                    {vehicles.map(vehicle => {
                        const engineStatus = vehicle.systemStatus?.engine || 'OK';
                        const batteryStatus = vehicle.systemStatus?.battery || 'OK';
                        const navStatus = vehicle.systemStatus?.navigation || 'OK';

                        const getStatusColor = (status: string) => {
                            if (status === 'OK') return 'bg-green-500';
                            if (status === 'WARNING') return 'bg-yellow-500';
                            return 'bg-red-500';
                        };

                        return (
                        <div 
                            key={vehicle.id} 
                            onClick={() => setSelectedVehicle(vehicle)}
                            className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                                vehicle.isActive 
                                ? 'bg-green-950/20 border-green-500 shadow-[0_0_20px_rgba(0,255,128,0.15)]' 
                                : 'bg-black/60 border-zinc-800 hover:border-green-900/50'
                            }`}
                        >
                            {vehicle.isActive && (
                                <div className="absolute top-0 right-0 bg-green-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                                    <ActivityIcon className="w-3 h-3" />
                                    Active Telemetry
                                </div>
                            )}

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                            {vehicle.year} {vehicle.make}
                                        </h3>
                                        <p className="text-green-400 text-sm font-bold uppercase tracking-wider">{vehicle.model}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">VIN</span>
                                        <span className="text-xs text-gray-300 font-mono">{vehicle.vin || 'UNREGISTERED'}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Plate</span>
                                        <span className="text-xs text-gray-300 font-mono">{vehicle.licensePlate || 'UNREGISTERED'}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Status</span>
                                        <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                                            <ShieldIcon className="w-3 h-3" />
                                            SECURED
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6 px-2">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(engineStatus)} shadow-[0_0_8px_currentColor]`} />
                                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">ENG</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(batteryStatus)} shadow-[0_0_8px_currentColor]`} />
                                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">BAT</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(navStatus)} shadow-[0_0_8px_currentColor]`} />
                                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">NAV</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!vehicle.isActive && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSetActiveVehicle(vehicle.id);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-green-900/30 text-gray-300 hover:text-green-400 rounded transition-colors text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-green-500/50"
                                        >
                                            <CheckIcon className="w-3 h-3" />
                                            Set Active
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteVehicle(vehicle.id);
                                        }}
                                        className={`${vehicle.isActive ? 'w-full' : 'w-10'} flex items-center justify-center py-2 bg-red-950/30 hover:bg-red-900/50 text-red-500 rounded transition-colors border border-red-900/30 hover:border-red-500/50`}
                                        title="Delete Vehicle"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        {vehicle.isActive && <span className="ml-2 text-[10px] font-black uppercase tracking-widest">Decommission</span>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            </div>

            {selectedVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-black border-2 border-green-500/50 rounded-xl shadow-[0_0_30px_rgba(0,255,128,0.2)] max-w-5xl w-full overflow-hidden flex flex-col my-8">
                        <div className="p-6 border-b border-green-900/50 flex justify-between items-center bg-green-950/20">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-600/10 border border-green-600 rounded-lg flex items-center justify-center">
                                    <ActivityIcon className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                                    </h2>
                                    <p className="text-green-400 text-xs font-bold uppercase tracking-wider">ROM Modification Protocol</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedVehicle(null)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 max-h-[70vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-green-500 uppercase tracking-widest border-b border-green-900/30 pb-2">Identification</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500 uppercase tracking-widest">VIN</span>
                                            <span className="text-xs text-white font-mono">{selectedVehicle.vin || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500 uppercase tracking-widest">License Plate</span>
                                            <span className="text-xs text-white font-mono">{selectedVehicle.licensePlate || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-500 uppercase tracking-widest">Status</span>
                                            <span className="text-xs text-green-500 font-bold uppercase">{selectedVehicle.isActive ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-green-500 uppercase tracking-widest border-b border-green-900/30 pb-2">System Status</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 uppercase tracking-widest">Engine</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${selectedVehicle.systemStatus?.engine === 'OK' ? 'bg-green-500' : selectedVehicle.systemStatus?.engine === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                                <span className="text-xs text-white font-mono">{selectedVehicle.systemStatus?.engine || 'OK'}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 uppercase tracking-widest">Battery</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${selectedVehicle.systemStatus?.battery === 'OK' ? 'bg-green-500' : selectedVehicle.systemStatus?.battery === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                                <span className="text-xs text-white font-mono">{selectedVehicle.systemStatus?.battery || 'OK'}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 uppercase tracking-widest">Navigation</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${selectedVehicle.systemStatus?.navigation === 'OK' ? 'bg-green-500' : selectedVehicle.systemStatus?.navigation === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                                <span className="text-xs text-white font-mono">{selectedVehicle.systemStatus?.navigation || 'OK'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-green-500 uppercase tracking-widest border-b border-green-900/30 pb-2">Live Telemetry</h3>
                                <div className="grid grid-cols-3 gap-4 pb-4">
                                    <div className="bg-black/40 border border-green-900/30 rounded-lg p-4 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-white">0</span>
                                        <span className="text-[10px] text-green-500 uppercase tracking-widest mt-1">MPH</span>
                                    </div>
                                    <div className="bg-black/40 border border-green-900/30 rounded-lg p-4 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-white">100</span>
                                        <span className="text-[10px] text-green-500 uppercase tracking-widest mt-1">% BATT</span>
                                    </div>
                                    <div className="bg-black/40 border border-green-900/30 rounded-lg p-4 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-white">72</span>
                                        <span className="text-[10px] text-green-500 uppercase tracking-widest mt-1">°F TEMP</span>
                                    </div>
                                </div>

                                <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest border-b border-rose-950/40 pt-4 pb-2">ECU ROM Tuning Connection</h3>
                                <EngineTuningInterface 
                                    vin={selectedVehicle.vin || "VIN123456789"}
                                    availableCPH={availableCPH}
                                    onApplyTuning={(newSpec, cphCost) => {
                                        console.log("ECU update received:", newSpec, "CPH: ", cphCost);
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-green-900/50 bg-black flex justify-end">
                            <button 
                                onClick={() => setSelectedVehicle(null)}
                                className="px-6 py-2 bg-green-900/30 hover:bg-green-800/50 text-green-400 border border-green-500/50 rounded transition-colors text-xs font-bold uppercase tracking-widest"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
