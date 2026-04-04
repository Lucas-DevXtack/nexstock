import { productMetrics } from './pro.metrics.service.js';

export async function proHealth(tenantId: string, days: number = 30) {
  const metrics = await productMetrics(tenantId, days);

  const immobilized = metrics.reduce((acc, p) => acc + (p.immobilizedValue || 0), 0);

  const ruptureSeries = metrics
    .filter((p) => p.lowStockThreshold != null && p.ruptureDaysPct != null)
    .map((p) => p.ruptureDaysPct as number);

  const ruptureRate = ruptureSeries.length
    ? ruptureSeries.reduce((a, b) => a + b, 0) / ruptureSeries.length / 100
    : 0;

  const weighted = metrics
    .filter((p) => p.turnoverDays != null && (p.immobilizedValue || 0) > 0)
    .reduce((acc, p) => acc + (p.turnoverDays as number) * (p.immobilizedValue as number), 0);

  const immTotal = metrics
    .filter((p) => p.turnoverDays != null && (p.immobilizedValue || 0) > 0)
    .reduce((acc, p) => acc + (p.immobilizedValue as number), 0);

  const avgTurnoverDays = immTotal > 0 ? weighted / immTotal : null;

  const revenue = metrics.reduce((acc, p) => acc + (p.revenue || 0), 0);
  const cogs = metrics.reduce((acc, p) => acc + (p.cogs || 0), 0);
  const margin = revenue - cogs;
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;

  const recommendations: string[] = [];

  const idle = metrics
    .filter((p) => (p.turnoverDays ?? 0) > 90 && (p.immobilizedValue ?? 0) > 0)
    .sort((a, b) => (b.immobilizedValue || 0) - (a.immobilizedValue || 0))
    .slice(0, 5);
  if (idle.length) recommendations.push(`Reduzir compra / limpar excesso: ${idle.map((x) => x.name).join(', ')}.`);

  const ruptureWorst = metrics
    .filter((p) => (p.ruptureDaysPct ?? 0) > 0)
    .sort((a, b) => (b.ruptureDaysPct || 0) - (a.ruptureDaysPct || 0))
    .slice(0, 5);
  if (ruptureWorst.length) recommendations.push(`Ajustar mínimo / repor: ${ruptureWorst.map((x) => `${x.name} (${Number(x.ruptureDaysPct).toFixed(1)}%)`).join(', ')}.`);

  const lowMargin = metrics
    .filter((p) => (p.revenue || 0) > 0)
    .sort((a, b) => (a.marginPct || 0) - (b.marginPct || 0))
    .slice(0, 5);
  if (lowMargin.length) recommendations.push(`Preço x custo apertado: ${lowMargin.map((x) => `${x.name} (${Number(x.marginPct).toFixed(1)}%)`).join(', ')}.`);

  let unlockEstimate: number | null = null;
  if (avgTurnoverDays != null && avgTurnoverDays > 30 && immobilized > 0) {
    unlockEstimate = immobilized * (1 - 30 / avgTurnoverDays);
  }

  const topImmobilized = metrics
    .filter((p) => (p.immobilizedValue || 0) > 0)
    .sort((a, b) => (b.immobilizedValue || 0) - (a.immobilizedValue || 0))
    .slice(0, 10)
    .map((p) => ({
      productId: p.productId,
      name: p.name,
      immobilizedValue: p.immobilizedValue,
      turnoverDays: p.turnoverDays,
      ruptureDaysPct: p.ruptureDaysPct,
    }));

  return {
    windowDays: days,
    immobilized,
    avgTurnoverDays,
    ruptureRate, // 0..1
    revenue,
    cogs,
    margin,
    marginPct,
    unlockEstimate,
    recommendations,
    topImmobilized,
  };
}
