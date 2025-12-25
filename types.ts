
export type AppState = 'CHAOS' | 'FORMED';

export interface ParticleData {
  chaosPos: [number, number, number];
  targetPos: [number, number, number];
  size: number;
  weight: number;
}

export interface OrnamentData extends ParticleData {
  type: 'BALL' | 'GIFT' | 'LIGHT';
  color: string;
}
