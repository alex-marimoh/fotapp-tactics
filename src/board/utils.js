export const attackerSlot = (slots) => (slots.find((s) => s.type === 'ST') || slots[0]).id;
