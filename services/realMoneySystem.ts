import { v4 as uuidv4 } from 'uuid';

export interface ResourceAsset {
  type: 'energy' | 'materials' | 'food' | 'labor';
  subtype: string; // e.g., 'coal_power', 'iron_ore', 'steel', 'grain', 'skilled_labor'
  quantity: number; // For non-labor: kg or kWh or hrs
  unit: string; // 'kWh', 'kg', 'hours'
  cphPerUnit: number; // Integer representation (multiply by 100 or keep flat, let's use flat or precise cents where 1 CPH = 100 cents, or integer)
  totalValue: number; // quantity * cphPerUnit
  depreciationRate: number; // e.g. 50 = 5% per week
  remainingLifeWeeks: number;
}

export interface ResourceReserve {
  reserves: ResourceAsset[];
  totalBackedCPH: number;
  cphInCirculation: number;
  cphInStorage: number;
  
  // Conservation stats
  resourcesExtractedCPH: number;
  resourcesConsumedCPH: number;
  valueAddedCPH: number;
  depreciationCPH: number;
  netResourceBalance: number;
}

export class RealMoneySystem {
  static instantiateReserve(): ResourceReserve {
    return {
      reserves: [
        {
          type: 'energy',
          subtype: 'solar_power',
          quantity: 200,
          unit: 'kWh',
          cphPerUnit: 1, // 1 kWh = 1 CPH
          totalValue: 200,
          depreciationRate: 50, // 5% per week if unused
          remainingLifeWeeks: 4,
        },
        {
          type: 'food',
          subtype: 'grain',
          quantity: 100,
          unit: 'kg',
          cphPerUnit: 5, // 1 kg food = 5 CPH
          totalValue: 500,
          depreciationRate: 100, // 10% per week
          remainingLifeWeeks: 2,
        },
        {
          type: 'materials',
          subtype: 'iron_ore',
          quantity: 300,
          unit: 'kg',
          cphPerUnit: 2, // 1 kg = 2 CPH
          totalValue: 600,
          depreciationRate: 5, // 0.5% per week
          remainingLifeWeeks: 200,
        }
      ],
      totalBackedCPH: 1300,
      cphInCirculation: 800,
      cphInStorage: 500,
      resourcesExtractedCPH: 1300,
      resourcesConsumedCPH: 0,
      valueAddedCPH: 0,
      depreciationCPH: 0,
      netResourceBalance: 1300,
    };
  }

  static runExtraction(reserve: ResourceReserve, type: 'energy' | 'materials' | 'food', subtype: string, quantity: number, cphPerUnit: number, unit: string): { reserve: ResourceReserve; moneyCreated: number } {
    const existingIndex = reserve.reserves.findIndex(r => r.type === type && r.subtype === subtype);
    const value = quantity * cphPerUnit;
    
    if (existingIndex >= 0) {
      reserve.reserves[existingIndex].quantity += quantity;
      reserve.reserves[existingIndex].totalValue = reserve.reserves[existingIndex].quantity * reserve.reserves[existingIndex].cphPerUnit;
    } else {
      reserve.reserves.push({
        type,
        subtype,
        quantity,
        unit,
        cphPerUnit,
        totalValue: value,
        depreciationRate: type === 'food' ? 100 : type === 'energy' ? 50 : 5,
        remainingLifeWeeks: type === 'food' ? 2 : type === 'energy' ? 4 : 200
      });
    }

    reserve.totalBackedCPH += value;
    reserve.cphInStorage += value;
    reserve.resourcesExtractedCPH += value;
    reserve.netResourceBalance = reserve.totalBackedCPH;

    return { reserve, moneyCreated: value };
  }

  static runTransformation(
    reserve: ResourceReserve,
    inputs: { subtype: string; quantity: number }[],
    output: { type: 'energy' | 'materials' | 'food'; subtype: string; quantity: number; cphPerUnit: number; unit: string },
    laborHours: number,
    laborCostPerHour: number
  ): { reserve: ResourceReserve; valueAdded: number; success: boolean; error?: string } {
    // 1. Verify inputs exist
    let totalInputCost = 0;
    for (const input of inputs) {
      const existing = reserve.reserves.find(r => r.subtype === input.subtype);
      if (!existing || existing.quantity < input.quantity) {
        return { reserve, valueAdded: 0, success: false, error: `Insufficient input: ${input.subtype}` };
      }
      totalInputCost += input.quantity * existing.cphPerUnit;
    }

    // 2. Add labor
    const totalLaborCost = laborHours * laborCostPerHour;
    const totalResourceInvested = totalInputCost + totalLaborCost;

    // 3. Subtract inputs from reserves
    for (const input of inputs) {
      const existing = reserve.reserves.find(r => r.subtype === input.subtype)!;
      existing.quantity -= input.quantity;
      existing.totalValue = existing.quantity * existing.cphPerUnit;
    }

    // 4. Calculate output value
    const outputValue = output.quantity * output.cphPerUnit;
    const netValueAdded = outputValue - totalResourceInvested;

    // 5. Add outputs
    const outputIndex = reserve.reserves.findIndex(r => r.type === output.type && r.subtype === output.subtype);
    if (outputIndex >= 0) {
      reserve.reserves[outputIndex].quantity += output.quantity;
      reserve.reserves[outputIndex].totalValue = reserve.reserves[outputIndex].quantity * reserve.reserves[outputIndex].cphPerUnit;
    } else {
      reserve.reserves.push({
        type: output.type,
        subtype: output.subtype,
        quantity: output.quantity,
        unit: output.unit,
        cphPerUnit: output.cphPerUnit,
        totalValue: outputValue,
        depreciationRate: output.type === 'food' ? 100 : output.type === 'energy' ? 50 : 5,
        remainingLifeWeeks: output.type === 'food' ? 2 : output.type === 'energy' ? 4 : 200
      });
    }

    // Adjust accounting
    // The inputs are gone (destructed), but output is added. Net change is outputValue - inputValues
    const originalMaterialValue = totalResourceInvested - totalLaborCost;
    reserve.totalBackedCPH = reserve.totalBackedCPH - originalMaterialValue + outputValue;
    reserve.cphInStorage = reserve.cphInStorage - originalMaterialValue + outputValue;
    reserve.valueAddedCPH += Math.max(0, netValueAdded);
    reserve.netResourceBalance = reserve.totalBackedCPH;

    return { reserve, valueAdded: netValueAdded, success: true };
  }

  static runConsumption(reserve: ResourceReserve, subtype: string, quantity: number): { reserve: ResourceReserve; moneyDestroyed: number; success: boolean; error?: string } {
    const existing = reserve.reserves.find(r => r.subtype === subtype);
    if (!existing || existing.quantity < quantity) {
      return { reserve, moneyDestroyed: 0, success: false, error: `Insufficient resource to consume: ${subtype}` };
    }

    const value = quantity * existing.cphPerUnit;
    existing.quantity -= quantity;
    existing.totalValue = existing.quantity * existing.cphPerUnit;

    reserve.totalBackedCPH -= value;
    reserve.cphInStorage = Math.max(0, reserve.cphInStorage - value);
    reserve.resourcesConsumedCPH += value;
    reserve.netResourceBalance = reserve.totalBackedCPH;

    return { reserve, moneyDestroyed: value, success: true };
  }

  static runDepreciation(reserve: ResourceReserve): { reserve: ResourceReserve; totalDepreciated: number } {
    let totalDepreciated = 0;
    for (const res of reserve.reserves) {
      // e.g. depreciationRate of 50 = 5% decay per week
      const decayFraction = res.depreciationRate / 1000; // 0.05
      const decayValue = Math.min(res.totalValue, Math.round(res.totalValue * decayFraction));
      
      if (decayValue > 0) {
        res.totalValue -= decayValue;
        res.quantity = Number((res.totalValue / res.cphPerUnit).toFixed(2));
        totalDepreciated += decayValue;
      }
    }

    reserve.totalBackedCPH -= totalDepreciated;
    reserve.cphInStorage = Math.max(0, reserve.cphInStorage - totalDepreciated);
    reserve.depreciationCPH += totalDepreciated;
    reserve.netResourceBalance = reserve.totalBackedCPH;

    return { reserve, totalDepreciated };
  }

  static validateConservation(reserve: ResourceReserve): { isValid: boolean; formulaDiscrepancy: number } {
    // Equation: totalBackedCPH must equal sum of values of currently stored reserves
    const actualSumOfAssets = reserve.reserves.reduce((s, r) => s + r.totalValue, 0);
    const discrepancy = reserve.totalBackedCPH - actualSumOfAssets;
    return {
      isValid: discrepancy === 0,
      formulaDiscrepancy: discrepancy
    };
  }
}
