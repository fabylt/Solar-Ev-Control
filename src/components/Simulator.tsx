import React from 'react';
import { SimState } from '../types';
import { Settings2, Sun, Moon, PlugZap, Unplug } from 'lucide-react';

interface SimulatorProps {
  simState: SimState;
  onSimChange: (newState: SimState) => void;
  cloudTimerActive: boolean;
  cloudTimerSeconds: number;
}

export function Simulator({ simState, onSimChange, cloudTimerActive, cloudTimerSeconds }: SimulatorProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Settings2 size={18} className="text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Simulatore Sensori</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-400">Scambio Rete (W)</label>
            <span className={`font-mono font-medium ${simState.gridPowerW < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {simState.gridPowerW > 0 ? '+' : ''}{simState.gridPowerW} W
            </span>
          </div>
          <input
            type="range"
            min="-5000"
            max="3000"
            step="100"
            value={simState.gridPowerW}
            onChange={(e) => onSimChange({ ...simState, gridPowerW: parseInt(e.target.value) })}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>-5kW (Immissione)</span>
            <span>+3kW (Prelievo)</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Giorno / Notte</span>
            <button
              onClick={() => onSimChange({ ...simState, isNight: !simState.isNight })}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                simState.isNight ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-800' : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
              }`}
            >
              {simState.isNight ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Cavo Auto</span>
            <button
              onClick={() => onSimChange({ ...simState, isCarPlugged: !simState.isCarPlugged })}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                simState.isCarPlugged ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {simState.isCarPlugged ? <PlugZap size={20} /> : <Unplug size={20} />}
            </button>
          </div>
        </div>
      </div>

      {cloudTimerActive && (
        <div className="bg-rose-900/30 border border-rose-900/50 rounded-lg p-3 flex justify-between items-center text-sm">
          <span className="text-rose-400">Nuvola rilevata! Attendendo ripresa FV...</span>
          <span className="font-mono text-rose-300 font-bold">{cloudTimerSeconds}s</span>
        </div>
      )}
    </div>
  );
}
