// dataPrep.js
export function shapePantry(stockDocs) {
  return stockDocs.map(s => ({
    name: s.name.toLowerCase().trim(),
    quantity: s.quantity,
    unit: s.unit,
    brand: s.brand || undefined,
    expiryDate: s.expiryDate || undefined
  }));
}

export function expiringSoon(pantry, days = 2) {
  const now = Date.now();
  return pantry
    .filter(p => p.expiryDate)
    .map(p => {
      const left = Math.ceil((new Date(p.expiryDate).getTime() - now) / (1000*60*60*24));
      return { name: p.name, daysLeft: left };
    })
    .filter(e => e.daysLeft <= days);
}
