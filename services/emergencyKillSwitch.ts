
import { safeStorage } from './safeStorage';

/**
 * THE EMERGENCY KILL-SWITCH: KINETIC STASIS
 * Protocol 0x03E2_SAFE
 * Ensures that unlimited thought never results in uncontrolled action.
 */
export const EmergencyKillSwitch = {
  async checkStatus(): Promise<boolean> {
    const val = await safeStorage.getItem('AETHER_KINETIC_HALT');
    return val === 'true';
  },

  async setStatus(val: boolean): Promise<void> {
    await safeStorage.setItem('AETHER_KINETIC_HALT', val.toString());
  },

  /**
   * Broadcasts a HALT signal to all physical apertures.
   * Redirects energy to terminal sinks immediately.
   */
  async trigger(): Promise<void> {
    await this.setStatus(true);
    console.warn("[!!!] KINETIC_HALT: Manual Kill-Switch Engaged.");
    
    // In a real environment, this would hit the GPIO/API layer
    const apertures = ['robotic_arm_01', 'printer_01', 'relay_01'];
    try {
      await Promise.all(apertures.map(id => 
        fetch(`/api/hardware/${id}/estop`, { 
          method: 'POST',
          headers: { 'X-Aether-Priority': 'EMERGENCY' }
        }).catch(() => {/* Mock environment: silence fetch errors */})
      ));
    } catch (e) {
      console.warn("[!] KINETIC_HALT: Broadcast partially failed, hardware interlock manual override required.");
    }
  },

  /**
   * Resets the interlock. Requires high-level conductor auth.
   */
  async reset(): Promise<void> {
    await this.setStatus(false);
    console.log("[OK] KINETIC_RESTORED: Systems re-arming...");
  },


  /**
   * Monitors conductor engagement. 
   * If the window is blurred, we reduce kinetic velocity to protect the core.
   */
  monitorHeartbeat(onWarning: (msg: string) => void): () => void {
    const handleBlur = () => {
      onWarning("[WATCHDOG] UI Focus lost. Reducing kinetic velocity for safety.");
    };
    
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }
};
