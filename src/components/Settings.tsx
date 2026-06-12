import React from 'react';
import { AppSettings } from '../types';
import { Save } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

export function Settings({ settings, onSettingsChange }: SettingsProps) {
  const handleChange = (field: keyof AppSettings, value: string | number) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="border-b border-slate-700 px-6 py-4 bg-slate-800/50">
          <h2 className="text-xl font-medium text-white">Entità Home Assistant</h2>
          <p className="text-sm text-slate-400 mt-1">Configura gli ID delle entità per la comunicazione con il sistema.</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="gridSensor" className="block text-sm font-medium text-slate-300">
              Sensore Scambio Rete (W)
            </label>
            <input
              id="gridSensor"
              type="text"
              value={settings.gridSensorEntity}
              onChange={(e) => handleChange('gridSensorEntity', e.target.value)}
              placeholder="es. sensor.power_meter_active_power"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-slate-500">Valori negativi = immissione (produzione FV &gt; consumi).</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="wbSwitch" className="block text-sm font-medium text-slate-300">
              Switch Sblocco Wallbox
            </label>
            <input
              id="wbSwitch"
              type="text"
              value={settings.wallboxSwitchEntity}
              onChange={(e) => handleChange('wallboxSwitchEntity', e.target.value)}
              placeholder="es. switch.pulsar_max_locked"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="wbAmps" className="block text-sm font-medium text-slate-300">
              Controllo Corrente Wallbox (A)
            </label>
            <input
              id="wbAmps"
              type="text"
              value={settings.wallboxAmpsEntity}
              onChange={(e) => handleChange('wallboxAmpsEntity', e.target.value)}
              placeholder="es. number.pulsar_max_maximum_current"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="wbCharge" className="block text-sm font-medium text-slate-300">
              Avvio/Fermo Ricarica
            </label>
            <input
              id="wbCharge"
              type="text"
              value={settings.wallboxChargeEntity}
              onChange={(e) => handleChange('wallboxChargeEntity', e.target.value)}
              placeholder="es. switch.wallbox_pulsar_charging_enable"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="border-b border-slate-700 px-6 py-4 bg-slate-800/50">
          <h2 className="text-xl font-medium text-white">Parametri Automa</h2>
          <p className="text-sm text-slate-400 mt-1">Impostazioni per l'algoritmo di gestione solare ed ecosistema.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="maxAmps" className="block text-sm font-medium text-slate-300">
              Corrente Massima (A)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="maxAmps"
                type="range"
                min="6"
                max="32"
                step="1"
                value={settings.maxAmps}
                onChange={(e) => handleChange('maxAmps', parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-lg font-mono text-white w-12 text-right">{settings.maxAmps}A</span>
            </div>
            <p className="text-xs text-slate-500">Limite configurabile del contatore / impianto (max standard richiesto 16A).</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="cloudToll" className="block text-sm font-medium text-slate-300">
              Tolleranza Nuvole (minuti)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="cloudToll"
                type="range"
                min="0"
                max="30"
                step="1"
                value={settings.cloudToleranceMinutes}
                onChange={(e) => handleChange('cloudToleranceMinutes', parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-lg font-mono text-white w-12 text-right">{settings.cloudToleranceMinutes}m</span>
            </div>
            <p className="text-xs text-slate-500">Tempo di attesa prima di bloccare la Wallbox se il FV scende sotto i 6A.</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
          onClick={() => alert("Impostazioni salvate nel browser!")}
        >
          <Save size={18} />
          Salva Configurazione
        </button>
      </div>
    </div>
  );
}
