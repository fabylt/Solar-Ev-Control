import React, { useState, useEffect } from 'react';
import { ChargeMode, AppSettings, SimState, WallboxState } from './types';
import { Settings } from './components/Settings';
import { Dashboard } from './components/Dashboard';
import { Simulator } from './components/Simulator';
import { LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';

const VOLTAGE = 230;
// Il minimo consentito per la ricarica standard è 6A
const MIN_AMPS = 6;
const MIN_POWER_W = MIN_AMPS * VOLTAGE;

export default function App() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SETTINGS'>('DASHBOARD');
  
  const [settings, setSettings] = useState<AppSettings>({
    gridSensorEntity: 'sensor.prism_grid_energy',
    wallboxSwitchEntity: 'lock.wallbox_pulsar_lock',
    wallboxAmpsEntity: 'number.wallbox_pulsar_max_charging_current',
    wallboxChargeEntity: 'switch.wallbox_pulsar_charging_enable',
    maxAmps: 16,
    cloudToleranceMinutes: 5,
  });

  const [mode, setMode] = useState<ChargeMode>('OFF');
  const [ecoExtraAmps, setEcoExtraAmps] = useState(0);
  const [manualAmps, setManualAmps] = useState(16);

  const [simState, setSimState] = useState<SimState>({
    gridPowerW: 0,
    isNight: false,
    isCarPlugged: true,
  });

  const [wallboxState, setWallboxState] = useState<WallboxState>({
    isUnlocked: false,
    targetAmps: 0,
    actualPowerW: 0,
  });

  const [cloudTimerActive, setCloudTimerActive] = useState(false);
  const [cloudTimerSeconds, setCloudTimerSeconds] = useState(0);

  // In un caso reale, questa availablePower calcola (Produzione - ConsumiCasa) -> che è esattamente -Grid
  // Il simulatore permette di impostare il GridPower *escluso* il carico auto.
  const pvExcessW = simState.gridPowerW < 0 ? Math.abs(simState.gridPowerW) : 0;

  useEffect(() => {
    // Questo è il cuore dell'algoritmo
    // Nel sistema reale andrebbe sostituito con gli eventi di stato di Home Assistant
    const tick = setInterval(() => {
      
      if (mode === 'OFF' || !simState.isCarPlugged) {
        setWallboxState({ isUnlocked: false, targetAmps: 0, actualPowerW: 0 });
        setCloudTimerActive(false);
        setCloudTimerSeconds(0);
        return;
      }

      if (mode === 'MANUAL') {
        const clamptedManual = Math.min(settings.maxAmps, Math.max(MIN_AMPS, manualAmps));
        setWallboxState({
          isUnlocked: true,
          targetAmps: clamptedManual,
          actualPowerW: clamptedManual * VOLTAGE
        });
        setCloudTimerActive(false);
        setCloudTimerSeconds(0);
        return;
      }

      if (mode === 'ECO') {
        // Regola 1: Mai di notte. Blocca ricarica se accesa.
        if (simState.isNight) {
          setWallboxState({ isUnlocked: false, targetAmps: 0, actualPowerW: 0 });
          setCloudTimerActive(false);
          setCloudTimerSeconds(0);
          return;
        }

        // Calcoliamo gli Ampere solari base
        const pvAmps = Math.floor(pvExcessW / VOLTAGE);
        
        if (pvAmps >= MIN_AMPS) {
          // Condizione normale: Sole bello
          setCloudTimerActive(false);
          setCloudTimerSeconds(0);

          const totalTargetAmps = Math.min(settings.maxAmps, pvAmps + ecoExtraAmps);
          setWallboxState({
            isUnlocked: true,
            targetAmps: totalTargetAmps,
            actualPowerW: totalTargetAmps * VOLTAGE
          });
        } else {
          // C'è una nuvola o calo di potenza (< 6A)
          if (!wallboxState.isUnlocked) {
            // Eravamo spenti, quindi aspettiamo che torni il sole, non accendiamo
            setCloudTimerActive(false);
            setCloudTimerSeconds(0);
            return;
          }

          if (wallboxState.isUnlocked) {
            // Eravamo accesi! Iniziamo il timer di tolleranza o lo incrementiamo
            if (!cloudTimerActive) {
              setCloudTimerActive(true);
              setCloudTimerSeconds(0);
            } else {
              setCloudTimerSeconds(prev => prev + 1);
            }

            // In simulation scale, 1 sec = 1 min real
            const tolleranzaScaduta = cloudTimerSeconds >= settings.cloudToleranceMinutes;

            if (tolleranzaScaduta) {
              // Tolleranza finita, spegniamo!
              setWallboxState({ isUnlocked: false, targetAmps: 0, actualPowerW: 0 });
              setCloudTimerActive(false);
              setCloudTimerSeconds(0);
            } else {
              // Teniamo al minimo (6A) + extraDurante la nuvola
              // oppure manteniamo l'ultimo valore per non fare stacca/attacca, 
              // di solito in caso di mancanza FV si tiene al minimo se non si spegne.
              const minTarget = Math.min(settings.maxAmps, MIN_AMPS + ecoExtraAmps);
              setWallboxState(prev => ({
                ...prev,
                targetAmps: minTarget,
                actualPowerW: minTarget * VOLTAGE
              }));
            }
          }
        }
      }
    }, 1000); // Check ogni secondo

    return () => clearInterval(tick);
  }, [mode, simState, settings, ecoExtraAmps, manualAmps, pvExcessW, wallboxState.isUnlocked, cloudTimerActive, cloudTimerSeconds]);

  // Calcolo per la dashboard visiva
  const getEffectiveTargetForDashboard = () => {
    if (mode === 'OFF') return 0;
    if (mode === 'MANUAL') return manualAmps;
    if (mode === 'ECO') {
      const pAmps = Math.floor(pvExcessW / VOLTAGE);
      if (pAmps >= MIN_AMPS) return Math.min(settings.maxAmps, pAmps + ecoExtraAmps);
      if (wallboxState.isUnlocked) return Math.min(settings.maxAmps, MIN_AMPS + ecoExtraAmps);
      return 0; // Se spenta ed in attesa di sole
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Top Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Solar EV Control</h1>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'DASHBOARD' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'SETTINGS' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SettingsIcon size={16} /> Setup
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'DASHBOARD' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Dashboard 
                mode={mode}
                onModeChange={setMode}
                ecoExtraAmps={ecoExtraAmps}
                onEcoExtraChange={setEcoExtraAmps}
                manualAmps={manualAmps}
                onManualAmpsChange={setManualAmps}
                settings={settings}
                wallboxState={wallboxState}
                effectiveTarget={getEffectiveTargetForDashboard()}
              />
            </div>
            
            <div className="lg:col-span-1 border-l border-slate-800 pl-0 lg:pl-8 pt-8 lg:pt-0">
               <Simulator 
                 simState={simState}
                 onSimChange={setSimState}
                 cloudTimerActive={cloudTimerActive}
                 cloudTimerSeconds={cloudTimerSeconds}
               />
            </div>
          </div>
        ) : (
          <Settings 
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}
      </main>
    </div>
  );
}
