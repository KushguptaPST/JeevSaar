export * from './config/app';
export * from './config/hospital';
export * from './types/languages';
export * from './schemas/explanation';
export * from './types/report';
export * from './types/auth';
export * from './types/tts';
export * from './types/appointment';

import criticalThresholds from './config/critical-thresholds.json';
import medicineDenylist from './config/medicine-denylist.json';

export { criticalThresholds, medicineDenylist };
