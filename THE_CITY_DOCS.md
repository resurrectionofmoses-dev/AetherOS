# 🌆 THE CITY: Living Economic Simulation
## *Where CPH = Movement, and Everyone Shares the Wealth*

---

## 🎯 The Core Insight

**CPH is the amount of commands it takes to move**

In the real world:
- Going to the driveway = 4 discrete physical actions (4 CPH)
- Every movement has distance, method, and multipliers
- The economy emerges from PHYSICAL GEOGRAPHY

---

## 🏗️ The City Structure

```
NEW ALEXANDRIA
==============

3 Districts:
├─ Residential North (Maple Heights)
│   ├─ 20 single-family homes
│   ├─ 1 apartment complex (100 units)
│   └─ Connected via sidewalks
│
├─ Downtown Core
│   ├─ Fresh Market (grocery)
│   ├─ Java Junction (coffee shop)
│   ├─ City Hall
│   ├─ Central Library
│   ├─ Central Park
│   ├─ Train Station
│   └─ Bus Hub
│
└─ Industrial East
    ├─ Alpha Logistics (warehouse)
    ├─ Highway 1
    └─ Rail connections

Public Transport:
├─ Bus Route 1 (Downtown Loop, 20 CPH fare)
└─ Red Line Train (Station ↔ Warehouse, 50 CPH fare)
```

---

## 🚶 Movement System (The Foundation)

### Example: Jimmy Goes to Driveway

```typescript
Location: Home (Bedroom)
Target: Driveway
Distance: 15 meters

Movement breakdown:
1. Stand up from bed       → 1 CPH (discrete action)
2. Walk to bedroom door    → 1 CPH (2 meters)
3. Walk through house      → 1 CPH (10 meters)
4. Walk to driveway        → 1 CPH (3 meters)

TOTAL: 4 CPH

This is EXACT. Not estimated. Not abstract.
4 discrete physical movements = 4 CPH.
```

---

### Movement Methods & Multipliers

```typescript
WALKING (Base: 1.0x)
  • 1 CPH per 100 meters
  • Speed: 5 km/h
  • Example: Home → Coffee shop (500m) = 5 CPH

BICYCLE (0.6x multiplier)
  • 0.6 CPH per 100 meters
  • Speed: 12 km/h
  • Example: Home → Coffee shop (500m) = 3 CPH
  • Savings: 40%

CAR (0.3x multiplier)
  • 0.3 CPH per 100 meters
  • Speed: 30 km/h
  • Example: Home → Warehouse (4km) = 12 CPH
  • Savings: 70%

BUS (0.4x multiplier + fare)
  • 0.4 CPH per 100 meters + 20 CPH flat fare
  • Speed: 21 km/h (with stops)
  • Example: Home → Warehouse (4km) = 16 + 20 = 36 CPH
  • Good for long distances

TRAIN (0.2x multiplier + fare)
  • 0.2 CPH per 100 meters + 50 CPH flat fare
  • Speed: 48 km/h
  • Example: Station → Warehouse (10km) = 20 + 50 = 70 CPH
  • Best for very long distances

TELEPORT (10x multiplier)
  • 10 CPH per 100 meters
  • Speed: Instant
  • Example: Home → Warehouse (4km) = 400 CPH
  • Emergency use only!
```

---

## 💰 The Economic Revolution: Dividends

### How It Works

```
WEEK 1 IN NEW ALEXANDRIA
========================

City collects revenue:
├─ Taxes: 30,000 CPH
├─ Business profits: 45,000 CPH
├─ Service fees: 15,000 CPH
└─ Utility surplus: 10,000 CPH
  
TOTAL POOL: 100,000 CPH

Residents contribute work:
├─ Jimmy (warehouse): 150 shares
├─ Sarah (teacher): 200 shares
├─ Mike (mechanic): 180 shares
└─ TOTAL: 5,000 shares

PAYOUT CALCULATION:
  100,000 CPH ÷ 5,000 shares = 20 CPH per share

DISTRIBUTION:
  • Jimmy: 150 shares × 20 = 3,000 CPH
  • Sarah: 200 shares × 20 = 4,000 CPH
  • Mike: 180 shares × 20 = 3,600 CPH
```

---

## 💎 Files Delivered

1. **citySimulation.ts** - Complete city with 13 locations, 3 districts, transport
2. **dividendSystem.ts** - Contribution tracking and wealth distribution
3. **THE_CITY_DOCS.md** - This document
