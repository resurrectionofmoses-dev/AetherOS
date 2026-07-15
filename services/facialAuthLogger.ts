export interface FacialAuthLog {
  id: number;
  timestamp: string; // ISO string
  localTime: string; // Readable local time
  targetProfileId: string;
  targetEmail: string;
  status: 'SUCCESS' | 'FAILURE' | 'INITIALIZED' | 'SCANNING' | 'CAMERA_ERROR';
  errorMessage?: string;
  details: {
    browserAgent: string;
    cameraAccessible: boolean;
    hasCameraError: boolean;
    confidenceScore: number;
    landmarkPoints: number;
    executionTimeMs: number;
    viewport: string;
    screenResolution: string;
    connectionType?: string;
    hardwareConcurrency?: number;
    deviceMemory?: number;
  };
}

export interface ForensicLog {
  id: number;
  raw: string;
  timestamp: string;
  domain: 'QUANTUM' | 'BOOT' | 'SYSTEM' | 'ERROR' | 'INFO';
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Appends a log to both the dedicated facial authentication log repository
 * and the system's global forensic logs in localStorage.
 */
export const logFaceAuthAttempt = (
  targetProfileId: string,
  targetEmail: string,
  status: 'SUCCESS' | 'FAILURE' | 'INITIALIZED' | 'SCANNING' | 'CAMERA_ERROR',
  errorMessage?: string,
  customDetails?: Partial<FacialAuthLog['details']>
): FacialAuthLog => {
  const now = new Date();
  const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  
  const viewportWidth = window.innerWidth || 0;
  const viewportHeight = window.innerHeight || 0;
  
  const details: FacialAuthLog['details'] = {
    browserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    cameraAccessible: !customDetails?.hasCameraError,
    hasCameraError: !!customDetails?.hasCameraError,
    confidenceScore: customDetails?.confidenceScore ?? (status === 'SUCCESS' ? 98.4 : status === 'FAILURE' ? 12.3 : 0),
    landmarkPoints: customDetails?.landmarkPoints ?? (status === 'SUCCESS' ? 128 : status === 'FAILURE' ? 14 : 0),
    executionTimeMs: customDetails?.executionTimeMs ?? 1500,
    viewport: `${viewportWidth}x${viewportHeight}`,
    screenResolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'Unknown',
    connectionType: typeof (navigator as any)?.connection?.effectiveType === 'string' 
      ? (navigator as any).connection.effectiveType 
      : 'Unknown',
    hardwareConcurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined,
    deviceMemory: typeof (navigator as any)?.deviceMemory === 'number' 
      ? (navigator as any).deviceMemory 
      : undefined,
    ...customDetails
  };

  const localTimeStr = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const logEntry: FacialAuthLog = {
    id,
    timestamp: now.toISOString(),
    localTime: localTimeStr,
    targetProfileId,
    targetEmail,
    status,
    errorMessage,
    details
  };

  // 1. Store in dedicated face auth logs array
  try {
    const existingLogsStr = localStorage.getItem('aetheros_face_auth_logs');
    const existingLogs: FacialAuthLog[] = existingLogsStr ? JSON.parse(existingLogsStr) : [];
    // Limit to 100 entries to prevent memory swelling
    const updatedLogs = [logEntry, ...existingLogs].slice(0, 100);
    localStorage.setItem('aetheros_face_auth_logs', JSON.stringify(updatedLogs));
  } catch (e) {
    console.warn('Failed to store dedicated face auth logs in localStorage', e);
  }

  // 2. Append to system diagnostic/forensic logs ('aetheros_forensic_logs')
  try {
    const existingForensicStr = localStorage.getItem('aetheros_forensic_logs');
    const existingForensic: ForensicLog[] = existingForensicStr ? JSON.parse(existingForensicStr) : [];
    
    // Create equivalent system forensic log entry
    let prefix = '[BIOMETRIC_FACE_ID]';
    let level: ForensicLog['level'] = 'info';
    let rawMsg = '';

    if (status === 'SUCCESS') {
      level = 'success';
      rawMsg = `${prefix} [OK] Facial signature matched for profile: ${targetProfileId.toUpperCase()} (${targetEmail}). Confidence: ${details.confidenceScore}%. Landmarks aligned: ${details.landmarkPoints}.`;
    } else if (status === 'FAILURE') {
      level = 'error';
      rawMsg = `${prefix} [FAIL] Facial recognition failed for profile: ${targetProfileId.toUpperCase()} (${targetEmail}). Error: ${errorMessage || 'Lattice mismatch'}. Confidence: ${details.confidenceScore}%.`;
    } else if (status === 'CAMERA_ERROR') {
      level = 'error';
      rawMsg = `${prefix} [FAIL] Camera access denied or hardware error. Initializing Synthetic Optical Lattice override. Error: ${errorMessage || 'DeviceNotFound'}.`;
    } else if (status === 'SCANNING') {
      level = 'info';
      rawMsg = `${prefix} [SCANNING] Initializing optical mesh. Projecting ${details.landmarkPoints} facial landmark nodes...`;
    } else {
      level = 'info';
      rawMsg = `${prefix} [INIT] Camera sensor synchronized. Resolution: ${details.viewport}. Target: ${targetProfileId.toUpperCase()}.`;
    }

    const forensicEntry: ForensicLog = {
      id,
      raw: rawMsg,
      timestamp: localTimeStr,
      domain: status === 'FAILURE' || status === 'CAMERA_ERROR' ? 'ERROR' : 'SYSTEM',
      message: rawMsg.replace(`${prefix} `, ''),
      level
    };

    // Limit to 100 entries
    const updatedForensic = [forensicEntry, ...existingForensic].slice(0, 100);
    localStorage.setItem('aetheros_forensic_logs', JSON.stringify(updatedForensic));
  } catch (e) {
    console.warn('Failed to append to global forensic logs in localStorage', e);
  }

  return logEntry;
};

/**
 * Retrieves all facial authentication attempt logs.
 */
export const getFaceAuthLogs = (): FacialAuthLog[] => {
  try {
    const existingLogsStr = localStorage.getItem('aetheros_face_auth_logs');
    return existingLogsStr ? JSON.parse(existingLogsStr) : [];
  } catch {
    return [];
  }
};

/**
 * Clears facial authentication logs.
 */
export const clearFaceAuthLogs = () => {
  try {
    localStorage.removeItem('aetheros_face_auth_logs');
  } catch (e) {
    console.warn('Failed to clear face auth logs', e);
  }
};
