export type CardData = {
  id: string;
  name: string;
  cost: number;
  damage?: number;
  block?: number;
  applyVulnerable?: number;
  color: string;
};

const STARTER_DECK: CardData[] = [
  { id: "s1", name: "Strike", cost: 1, damage: 6, color: "#4f83cc" },
  { id: "s2", name: "Strike", cost: 1, damage: 6, color: "#4f83cc" },
  { id: "s3", name: "Strike", cost: 1, damage: 6, color: "#4f83cc" },
  { id: "d1", name: "Defend", cost: 1, block: 5, color: "#2f9e44" },
  { id: "d2", name: "Defend", cost: 1, block: 5, color: "#2f9e44" },
  { id: "b1", name: "Bash", cost: 2, damage: 8, applyVulnerable: 1, color: "#d9480f" },
];

export const REWARD_POOL: CardData[] = [
  { id: "r1", name: "Heavy Blade", cost: 2, damage: 14, color: "#5f3dc4" },
  { id: "r2", name: "Guard Up", cost: 1, block: 8, color: "#2b8a3e" },
  { id: "r3", name: "Jab", cost: 0, damage: 4, color: "#1c7ed6" },
  { id: "r4", name: "Skull Bash", cost: 2, damage: 10, applyVulnerable: 2, color: "#e8590c" },
  { id: "r5", name: "Shield Slam", cost: 1, damage: 7, block: 4, color: "#0c8599" },
];

class RunState {
  public deck: CardData[] = [...STARTER_DECK];

  reset(): void {
    this.deck = [...STARTER_DECK];
  }

  addCard(card: CardData): void {
    this.deck.push({ ...card, id: `${card.id}_${Date.now()}` });
  }
}

export const runState = new RunState();
