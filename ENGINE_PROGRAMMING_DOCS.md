# Programmable Engine System - Complete Documentation

## 🏎️ Overview

A **cryptographically secure** vehicle engine programming system where AI agents can modify real engine parameters - but only with proper authorization via master keys.

**Zero Room for Error** - All calculations use exact integer math with fixed decimal places. No floating point errors.

---

## Core Concept

```
User owns: 2015 Honda Civic
├─ Engine: 1998cc 4-cylinder
├─ Max RPM: 7000
├─ Current Setup: Stock exhaust, conservative timing
└─ Goal: Sound like a race car

AI Agent: "Mechanic Mike"
├─ Permission: sound_tuning
├─ Tool: EngineTuningInterface
└─ Action: Modify exhaust sound profile

Security Layer:
├─ Master Key Required: ✓ (cryptographic)
├─ VIN Verification: ✓ (Honda Civic match)
├─ Permission Check: ✓ (sound_tuning allowed)
└─ Modification Applied: ✓ (18 CPH cost)
```

---

## Exact Math System

### Why No Floating Point?

Floating point arithmetic has precision errors:
```javascript
// ❌ WRONG (floating point)
0.1 + 0.2 === 0.3  // false! (0.30000000000000004)

// ✅ RIGHT (fixed decimal integers)
baseTone: 850  // Represents 85.0 Hz (× 10)
```

---

## Master Key Security

### Hierarchical Permissions

```typescript
type EnginePermission =
  | 'read_only'              // View only
  | 'sound_tuning'           // Exhaust sound
  | 'performance_basic'      // Throttle, rev limiter
  | 'performance_advanced'   // Fuel maps, timing
  | 'full_access'            // Everything
  | 'emergency_lockout'      // Disable all mods
```

---

## Validation System

### Safety Limits

```typescript
// Rev limiter
MIN: 2000 RPM
MAX: maxRPM + 500 (safety margin)

// Ignition timing
MIN: -10.0° (retard)
MAX: +40.0° (advance)

// Fuel map cells
MIN: 50 (5ms pulse - prevents too lean)
MAX: 240 (24ms pulse - prevents too rich)

// Throttle response
MIN: 100 (10% - prevents sluggishness)
MAX: 1000 (100% - instant)

// Exhaust volume
MAX: 950 (95% - hearing protection)
```

---

## Summary

### Key Innovations

✅ **Exact Math** - No floating point errors
✅ **Cryptographic Security** - HMAC + SHA-256
✅ **Hierarchical Permissions** - Granular access control
✅ **Full Audit Trail** - Every modification logged
✅ **Tamper Detection** - Checksum verification
✅ **Rollback Support** - Undo any modification
✅ **CPH Integration** - Costs compute resources

### Files

1. `engineProgramming.ts` - Core engine + security
2. `EngineTuningInterface.tsx` - UI component
3. `ENGINE_PROGRAMMING_DOCS.md` - This file
