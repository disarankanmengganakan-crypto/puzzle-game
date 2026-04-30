export type CardData = {
  id: string;
  name: string;
  cost: number;
  damage?: number;
  block?: number;
  applyVulnerable?: number;
  draw?: number;
  heal?: number;
  category: "攻撃" | "防御" | "補助" | "魔法";
  color: string;
  description: string;
};

const STARTER_DECK: CardData[] = [
  { id: "s1", name: "きらめく斬撃", cost: 1, damage: 6, color: "#ff7aa2", category: "攻撃", description: "敵単体に6ダメージ" },
  { id: "s2", name: "きらめく斬撃", cost: 1, damage: 6, color: "#ff7aa2", category: "攻撃", description: "敵単体に6ダメージ" },
  { id: "s3", name: "きらめく斬撃", cost: 1, damage: 6, color: "#ff7aa2", category: "攻撃", description: "敵単体に6ダメージ" },
  { id: "d1", name: "瞬きの守り", cost: 1, block: 5, color: "#72b7ff", category: "防御", description: "ブロックを5得る" },
  { id: "d2", name: "瞬きの守り", cost: 1, block: 5, color: "#72b7ff", category: "防御", description: "ブロックを5得る" },
  { id: "b1", name: "流星の破砕", cost: 2, damage: 8, applyVulnerable: 1, color: "#c084fc", category: "魔法", description: "8ダメージ。脆弱1を付与" },
];

export const REWARD_POOL: CardData[] = [
  { id: "r1", name: "スターライトカスケード", cost: 2, damage: 12, color: "#c084fc", category: "魔法", description: "敵全体に12ダメージ" },
  { id: "r2", name: "やさしい花風", cost: 1, heal: 8, color: "#86efac", category: "補助", description: "HPを8回復" },
  { id: "r3", name: "幸運のひらめき", cost: 1, draw: 2, color: "#67e8f9", category: "補助", description: "カードを2枚引く" },
  { id: "r4", name: "上昇する意志", cost: 1, draw: 1, block: 3, color: "#fbbf24", category: "補助", description: "1枚引き、ブロック3" },
  { id: "r5", name: "きらめく盾", cost: 1, block: 10, color: "#60a5fa", category: "防御", description: "ブロックを10得る" },
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
