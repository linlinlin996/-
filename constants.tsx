
export const COLORS = {
  EMERALD_DARK: '#064e3b',
  EMERALD_BRIGHT: '#10b981',
  GOLD_BRIGHT: '#ffdf00', // Brighter pure gold
  GOLD_DEEP: '#d4af37',   // Metallic gold
  LUXURY_RED: '#e60000',  // Vibrant ruby red
  LUXURY_BLUE: '#0066ff', // Bright sapphire blue
  LUXURY_PINK: '#ff33aa', // Vibrant hot pink
  VIBRANT_GREEN: '#00ff88', // Neon emerald for meteors
  WHITE_GLOW: '#ffffff'
};

export const TREE_CONFIG = {
  FOLIAGE_COUNT: 20000,
  ORNAMENT_COUNT: 1000, 
  STAR_COUNT: 400, 
  INTERNAL_PARTICLE_COUNT: 6000,
  GLARE_COUNT: 800, // New: High-intensity surface glares
  BASE_RADIUS: 4,
  HEIGHT: 10,
  CHAOS_RADIUS: 12
};

export const ORNAMENT_TYPES = ['BALL', 'GIFT', 'LIGHT'] as const;
export const LUXURY_PALETTE = [
  COLORS.GOLD_BRIGHT,
  COLORS.GOLD_DEEP,
  COLORS.LUXURY_RED,
  COLORS.LUXURY_BLUE,
  COLORS.WHITE_GLOW
];
