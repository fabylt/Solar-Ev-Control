import React from 'react';
import { ChargeMode, AppSettings, WallboxState } from '../types';
import { Power, Sun, Settings2, Zap, AlertCircle } from 'lucide-react';

interface DashboardProps {
  mode: ChargeMode;
  onModeChange: (mode: ChargeMode) => void;
  ecoExtraAmps: number;
  onEcoExtraChange: (amps: number) => void;
  manualAmps: number;
  onManualAmpsChange: (amps: number) => void;
  settings: AppSettings;
  wallboxState: WallboxState;
  effectiveTarget: number;
}

export function Dashboard({
  mode,
  onModeChange,
  ecoExtraAmps,
  onEcoExtraChange,
  manualAmps,
  onManualAmpsChange,
  settings,
  wallboxState,
  effectiveTarget
}: DashboardProps) {
  
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col justify-center items-center text-center">
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Stato Wallbox</span>
          {wallboxState.isUnlocked ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <Zap className="animate-pulse" size={24} />
              <span className="text-2xl font-bold">Ricarica Attiva</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <Power size={24} />
              <span className="text-2xl font-bold">In Attesa</span>
            </div>
          )}
          <div className="mt-4 flex gap-4 text-sm font-mono bg-slate-900 rounded-lg py-2 px-4 border border-slate-700">
            <div className="flex flex-col text-slate-300">
              <span className="text-slate-500 text-xs">SetPoint</span>
              <span>{Math.round(wallboxState.targetAmps)}A</span>
            </div>
            <div className="w-px bg-slate-700"></div>
            <div className="flex flex-col text-slate-300">
              <span className="text-slate-500 text-xs">Potenza</span>
              <span>{(wallboxState.targetAmps * 230).toFixed(0)}W</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4 block">Modalità</span>
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => onModeChange('OFF')}
              className={`flex-1 py-3 px-2 rounded-md font-medium text-sm transition-all flex justify-center items-center gap-2 ${
                mode === 'OFF' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Power size={18} /> Off
            </button>
            <button
              onClick={() => onModeChange('ECO')}
              className={`flex-1 py-3 px-2 rounded-md font-medium text-sm transition-all flex justify-center items-center gap-2 ${
                mode === 'ECO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun size={18} /> Solare (Eco)
            </button>
            <button
              onClick={() => onModeChange('MANUAL')}
              className={`flex-1 py-3 px-2 rounded-md font-medium text-sm transition-all flex justify-center items-center gap-2 ${
                mode === 'MANUAL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings2 size={18} /> Manuale
            </button>
          </div>
        </div>
      </div>

      {/* Mode Settings */}
      {mode !== 'OFF' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 animate-in fade-in zoom-in-95 duration-200">
          
          {mode === 'ECO' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-700">
                <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-lg">
                  <Sun size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Ricarica Solare</h3>
                  <p className="text-sm text-slate-400">Ricarica usando fotovoltaico. Minimo garantito 6A. Aggiunta grid manuale opzionale.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <label className="text-slate-300">Potenza di rete aggiuntiva (Boost)</label>
                  <span className="text-emerald-400 font-mono text-lg">+{ecoExtraAmps} A</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={ecoExtraAmps}
                  onChange={(e) => onEcoExtraChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>0A (Solo Sole)</span>
                  <span>+10A (Mix Rete)</span>
                </div>
                
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mt-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Il sistema controllerà l'immissione in rete per superare i 6A minimi. 
                    Target attuale calcolato: <strong className="text-white bg-slate-800 px-1 py-0.5 rounded">{effectiveTarget}A</strong>.
                    Non partirà in assenza di un minimo fotovoltaico per non scaricare batterie di casa o consumare inutilmente dalla rete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {mode === 'MANUAL' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-700">
                <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Ricarica Manuale</h3>
                  <p className="text-sm text-slate-400">Forza la ricarica indipendentemente dalla produzione solare.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <label className="text-slate-300">Corrente Forzata</label>
                  <span className="text-blue-400 font-mono text-lg">{manualAmps} A</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max={settings.maxAmps}
                  step="1"
                  value={manualAmps}
                  onChange={(e) => onManualAmpsChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>6A (Min)</span>
                  <span>{settings.maxAmps}A (Max configurato)</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
