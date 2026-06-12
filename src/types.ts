export interface AppSettings {
  gridSensorEntity: string;
  wallboxSwitchEntity: string;
  wallboxAmpsEntity: string;
  wallboxChargeEntity: string;
  maxAmps: number;
  cloudToleranceMinutes: number;
}

export type ChargeMode = 'OFF' | 'ECO' | 'MANUAL';

export interface SimState {
  gridPowerW: number; // Valore negativo = immissione in rete (eccedenza PV)
  isNight: boolean;
  isCarPlugged: boolean;
}

export interface WallboxState {
  isUnlocked: boolean; // Pulsar Max necessita di essere sbloccata
  targetAmps: number;
  actualPowerW: number;
}
