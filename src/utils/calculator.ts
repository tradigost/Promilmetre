import { ConsumedDrink, Gender, StomachState, UserProfile, BacStatus } from '../types';

export const ALCOHOL_DENSITY = 0.789; // g/ml
export const ELIMINATION_RATE = 0.15; // Promil per hour

export function getWidmarkR(gender: Gender): number {
  return gender === 'female' ? 0.55 : 0.68;
}

export function getAbsorptionTimeHours(stomach: StomachState): number {
  switch (stomach) {
    case 'empty':
      return 0.30; // ~18 mins
    case 'medium':
      return 0.50; // 30 mins
    case 'full':
      return 0.75; // 45 mins
    default:
      return 0.50;
  }
}

export function calculatePureAlcoholGrams(ml: number, percent: number): number {
  return ml * (percent / 100) * ALCOHOL_DENSITY;
}

/**
 * Calculates instantaneous BAC (Promil, g/L) at a given timestamp `targetTime`
 * using continuous numerical integration to ensure BAC never goes below 0
 * during intervals between drinks, and accurately handles absorption curves.
 */
export function calculateBacAtTime(
  targetTime: number,
  sessionStartTime: number,
  drinks: ConsumedDrink[],
  profile: UserProfile
): number {
  if (!drinks || drinks.length === 0) return 0;

  const validDrinks = drinks.filter(d => d.time <= targetTime);
  if (validDrinks.length === 0) return 0;

  const r = getWidmarkR(profile.gender);
  const weight = Math.max(30, profile.weight);
  const absTimeHours = getAbsorptionTimeHours(profile.stomach);
  const absTimeMs = absTimeHours * 3600 * 1000;

  // Find the earliest event
  const firstTime = Math.min(sessionStartTime, ...validDrinks.map(d => d.time));
  if (targetTime <= firstTime) return 0;

  // Step size: 1 minute (60,000 ms) for high precision simulation
  const stepMs = 60 * 1000;
  const stepHours = stepMs / (3600 * 1000);
  let currentBac = 0;

  for (let t = firstTime; t < targetTime; t += stepMs) {
    // 1. Calculate incoming alcohol absorbed during this time step
    let stepAbsorbedGrams = 0;
    for (const d of validDrinks) {
      if (t >= d.time && t < d.time + absTimeMs) {
        // Absorbed fraction per step
        const frac = stepMs / absTimeMs;
        stepAbsorbedGrams += d.grams * frac;
      }
    }

    const bacIncrease = stepAbsorbedGrams / (weight * r);
    currentBac += bacIncrease;

    // 2. Eliminate alcohol (0.15 promil / hour)
    if (currentBac > 0) {
      currentBac = Math.max(0, currentBac - ELIMINATION_RATE * stepHours);
    }
  }

  return Math.max(0, currentBac);
}

/**
 * Returns the estimated sober timestamp (when BAC reaches 0.00)
 */
export function calculateSoberTime(currentBac: number, fromTime: number = Date.now()): number {
  if (currentBac <= 0.001) return fromTime;
  const hoursNeeded = currentBac / ELIMINATION_RATE;
  return fromTime + hoursNeeded * 3600 * 1000;
}

/**
 * Returns estimated time when BAC drops below Turkey legal limit for private cars (0.50 promil)
 */
export function calculateLegalLimitSafeTime(currentBac: number, fromTime: number = Date.now()): number | null {
  if (currentBac <= 0.50) return null;
  const hoursNeeded = (currentBac - 0.50) / ELIMINATION_RATE;
  return fromTime + hoursNeeded * 3600 * 1000;
}

/**
 * Status details and Turkish traffic law information
 */
export function getBacStatus(bac: number): BacStatus {
  if (bac < 0.20) {
    return {
      bac,
      color: '#10b981', // emerald-500
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      statusText: 'GÜVENLİ DÜZEY',
      severity: 'safe',
      drivingAdvice: 'Etki minimal düzeydedir. Ancak sıfır promil her zaman en güvenlisidir.',
      effects: 'Duygusal rahatlama, belirgin koordinasyon kaybı beklenmez.',
    };
  }

  if (bac < 0.50) {
    return {
      bac,
      color: '#84cc16', // lime-500
      badgeClass: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
      statusText: 'YASAL SINIR ALTI (DİKKAT)',
      severity: 'low',
      drivingAdvice: 'Hususi otomobil yasal sınırının (0.50) altındasınız. DİKKAT: Ticari araç ve stajyer sürücüler için yasal sınır 0.00 promildir!',
      effects: 'Reflekslerde hafif gecikme, mesafe algısında azalma ve aşırı özgüven başlangıcı.',
    };
  }

  if (bac < 1.00) {
    return {
      bac,
      color: '#f59e0b', // amber-500
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse',
      statusText: 'YASAL SINIR AŞILDI — ARAÇ KULLANMAYIN',
      severity: 'warning',
      drivingAdvice: 'Hususi araç yasal sınırı (0.50) aşıldı! Kesinlikle direksiyon başına geçmeyin. Ehliyete el koyma ve idari para cezası uygulanır.',
      effects: 'Denge kaybı, görme alanında daralma, ani tepki verememe, yavaşlayan karar mekanizması.',
    };
  }

  if (bac < 2.00) {
    return {
      bac,
      color: '#ef4444', // red-500
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
      statusText: 'TEHLİKELİ SEVİYE (ADLİ İŞLEM)',
      severity: 'danger',
      drivingAdvice: 'TCK 179/3 kapsamında "Trafik Güvenliğini Tehlikeye Sokma" suçu (1.00 promil üzeri adli vaka ve 2 yıla kadar hapis istemi). Lütfen taksi çağırın.',
      effects: 'Ciddi sarhoşluk, belirgin konuşma bozukluğu, çift görme, hafıza ve yön duygusu kaybı.',
    };
  }

  return {
    bac,
    color: '#a855f7', // purple-500
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse',
    statusText: 'KRİTİK SEVİYE — SAĞLIK RİSKİ',
    severity: 'critical',
    drivingAdvice: 'Kritik alkol zehirlenmesi riski! Bol su için, yalnız kalmayın ve gerekirse 112 Acil Yardım çağırın.',
    effects: 'Koma riski, bilinç kaybı, motor fonksiyonların çökmesi, nefes alma refleksinde zayıflama.',
  };
}

export interface ProjectionPoint {
  timeMs: number;
  timeLabel: string;
  bac: number;
}

/**
 * Generates projection timeline points for the next 8 hours
 */
export function generateProjection(
  nowMs: number,
  sessionStartTime: number,
  drinks: ConsumedDrink[],
  profile: UserProfile
): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  const currentBac = calculateBacAtTime(nowMs, sessionStartTime, drinks, profile);

  // If already zero and no drinks, return flatline
  if (currentBac <= 0.001 && drinks.length === 0) {
    for (let i = 0; i <= 6; i++) {
      const t = nowMs + i * 3600 * 1000;
      const d = new Date(t);
      points.push({
        timeMs: t,
        timeLabel: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        bac: 0,
      });
    }
    return points;
  }

  // Calculate points every 30 minutes for up to 8 hours or until sober
  const maxHours = Math.max(4, Math.min(12, Math.ceil(currentBac / ELIMINATION_RATE) + 1));
  const stepMs = 30 * 60 * 1000;
  const totalSteps = maxHours * 2;

  for (let s = 0; s <= totalSteps; s++) {
    const t = nowMs + s * stepMs;
    const date = new Date(t);
    const bac = calculateBacAtTime(t, sessionStartTime, drinks, profile);
    points.push({
      timeMs: t,
      timeLabel: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      bac: Number(bac.toFixed(2)),
    });
  }

  return points;
}
