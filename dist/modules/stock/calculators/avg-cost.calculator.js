export function computeNewAvgCost(currentQty, currentAvg, inQty, inUnitCost) { const total = currentQty * currentAvg + inQty * inUnitCost; const newQty = currentQty + inQty; if (newQty <= 0)
    return currentAvg; return total / newQty; }
