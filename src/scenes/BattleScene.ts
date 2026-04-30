import Phaser from "phaser";
import { type CardData, REWARD_POOL, runState } from "../game/runState";

type Card = CardData;

const INTENT_PATTERN = [6, 7, 5, 8];

export class BattleScene extends Phaser.Scene {
  private playerHp = 40;
  private enemyHp = 40;
  private playerBlock = 0;
  private energy = 3;
  private turn = 1;
  private intentIndex = 0;

  private enemyVulnerable = 0;
  private rewardPhase = false;

  private drawPile: Card[] = [];
  private discardPile: Card[] = [];
  private hand: Card[] = [];

  private playerHpText!: Phaser.GameObjects.Text;
  private enemyHpText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private intentText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super("battle");
  }

  preload(): void {
    this.load.image("card-frame", "/assets/cards/card-frame.svg");
    this.load.image("art-attack", "/assets/cards/art-attack.svg");
    this.load.image("art-skill", "/assets/cards/art-skill.svg");
    this.load.image("art-support", "/assets/cards/art-support.svg");
  }

  create(data: { nodeId?: string }): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1326);

    this.add.text(36, 24, `Battle Prototype (${data.nodeId ?? "unknown"})`, {
      fontSize: "36px",
      color: "#ffd166",
      fontStyle: "bold",
    });

    this.playerHpText = this.add.text(70, 120, "", { fontSize: "28px", color: "#e7f5ff" });
    this.enemyHpText = this.add.text(width - 420, 120, "", { fontSize: "28px", color: "#ffe3e3" });
    this.energyText = this.add.text(70, 165, "", { fontSize: "26px", color: "#ffe066" });
    this.turnText = this.add.text(width - 300, 165, "", { fontSize: "26px", color: "#ced4da" });
    this.intentText = this.add.text(width - 420, 210, "", { fontSize: "24px", color: "#ff922b" });

    this.drawCharacter(220, 370, 0x4dabf7, "PLAYER");
    this.drawCharacter(width - 220, 340, 0xff6b6b, "ENEMY");

    this.messageText = this.add.text(width / 2, 220, "", { fontSize: "24px", color: "#ffd8a8" }).setOrigin(0.5);

    const endTurnBtn = this.makeButton(width - 180, height - 55, "End Turn", () => this.endTurn());
    endTurnBtn.setScale(0.9);

    const backBtn = this.makeButton(130, height - 55, "← Map", () => this.scene.start("map"));
    backBtn.setScale(0.85);

    this.resetBattle();
  }

  private resetBattle(): void {
    this.playerHp = 40;
    this.enemyHp = 40;
    this.playerBlock = 0;
    this.turn = 1;
    this.energy = 3;
    this.intentIndex = 0;
    this.enemyVulnerable = 0;
    this.rewardPhase = false;
    this.drawPile = this.shuffle([...runState.deck]);
    this.discardPile = [];
    this.hand = [];
    this.startPlayerTurn();
  }

  private startPlayerTurn(): void {
    this.playerBlock = 0;
    this.energy = 3;
    this.messageText.setText("カードを選んで行動してください");
    this.drawCards(4);
    this.renderHand();
    this.updateStatusTexts();
  }

  private endTurn(): void {
    if (this.enemyHp <= 0 || this.playerHp <= 0 || this.rewardPhase) return;

    this.discardPile.push(...this.hand);
    this.hand = [];
    this.clearHandUI();

    const intentDamage = INTENT_PATTERN[this.intentIndex % INTENT_PATTERN.length];
    const dealt = Math.max(0, intentDamage - this.playerBlock);
    this.playerHp = Math.max(0, this.playerHp - dealt);
    this.messageText.setText(`Enemy attacks for ${dealt}`);

    if (this.playerHp <= 0) {
      this.updateStatusTexts();
      this.messageText.setText("Defeat... ← Map で戻れます");
      return;
    }

    this.turn += 1;
    this.intentIndex += 1;
    this.time.delayedCall(350, () => this.startPlayerTurn());
  }

  private playCard(index: number): void {
    const card = this.hand[index];
    if (!card || this.enemyHp <= 0 || this.playerHp <= 0 || this.rewardPhase) return;

    if (card.cost > this.energy) {
      this.messageText.setText("エナジーが足りません");
      return;
    }

    this.energy -= card.cost;

    if (card.damage) {
      const bonus = this.enemyVulnerable > 0 ? 2 : 0;
      const finalDamage = card.damage + bonus;
      this.enemyHp = Math.max(0, this.enemyHp - finalDamage);
      this.messageText.setText(`${card.name}：${finalDamage}ダメージ`);
    }

    if (card.block) {
      this.playerBlock += card.block;
      this.messageText.setText(`${card.name}：ブロック+${card.block}`);
    }

    if (card.applyVulnerable) {
      this.enemyVulnerable += card.applyVulnerable;
      this.messageText.setText(`${card.name}：脆弱を付与`);
    }

    if (card.heal) {
      this.playerHp = Math.min(40, this.playerHp + card.heal);
      this.messageText.setText(`${card.name}：HPを${card.heal}回復`);
    }

    if (card.draw) {
      this.drawCards(card.draw);
      this.messageText.setText(`${card.name}：${card.draw}枚ドロー`);
    }

    const [used] = this.hand.splice(index, 1);
    this.discardPile.push(used);

    if (this.enemyHp <= 0) {
      this.enemyHp = 0;
      this.clearHandUI();
      this.updateStatusTexts();
      this.openRewardSelection();
      return;
    }

    this.renderHand();
    this.updateStatusTexts();
  }

  private openRewardSelection(): void {
    this.rewardPhase = true;
    this.messageText.setText("Victory! カードを1枚選んでください");

    const rewardCandidates = this.shuffle([...REWARD_POOL]).slice(0, 3);
    const { width, height } = this.scale;

    rewardCandidates.forEach((card, index) => {
      const x = width / 2 - 230 + index * 230;
      const y = height / 2 + 50;

      const frame = this.add.image(x, y, "card-frame").setDisplaySize(196, 248);
      const panel = this.add.rectangle(x, y, 184, 236, Phaser.Display.Color.HexStringToColor(card.color).color, 0.9)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });
      const art = this.add.image(x, y - 22, this.cardArtPath(card)).setDisplaySize(150, 108);
      [frame, panel, art].forEach((ui) => ui.setData("reward-ui", true));

      const name = this.add.text(x, y - 72, card.name, { fontSize: "22px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
      const cost = this.add.text(x, y - 103, `コスト ${card.cost}`, { fontSize: "17px", color: "#fff3bf" }).setOrigin(0.5);
      const category = this.add.text(x, y + 70, card.category, { fontSize: "18px", color: "#fff", backgroundColor: "#00000066" }).setOrigin(0.5);
      const effect = this.add
        .text(x, y + 12, this.cardEffectLabel(card), { fontSize: "16px", color: "#f8f9fa", align: "center", wordWrap: { width: 160 } })
        .setOrigin(0.5);
      const desc = this.add
        .text(x, y + 42, card.description, { fontSize: "13px", color: "#f1f3f5", align: "center", wordWrap: { width: 165 } })
        .setOrigin(0.5);

      [name, cost, category, effect, desc].forEach((ui) => ui.setData("reward-ui", true));

      panel.on("pointerup", () => {
        runState.addCard(card);
        this.clearRewardUI();
        this.messageText.setText(`${card.name} を獲得！ デッキ枚数: ${runState.deck.length}`);
        this.time.delayedCall(450, () => this.scene.start("map"));
      });
    });
  }

  private drawCards(count: number): void {
    for (let i = 0; i < count; i += 1) {
      if (this.drawPile.length === 0) {
        this.drawPile = this.shuffle([...this.discardPile]);
        this.discardPile = [];
      }
      const card = this.drawPile.pop();
      if (!card) break;
      this.hand.push(card);
    }
  }

  private renderHand(): void {
    this.clearHandUI();
    const { width, height } = this.scale;
    const spacing = 180;
    const startX = width / 2 - ((this.hand.length - 1) * spacing) / 2;

    this.hand.forEach((card, index) => {
      const x = startX + index * spacing;
      const y = height - 165;

      const frame = this.add.image(x, y, "card-frame").setDisplaySize(158, 208);
      const box = this.add.rectangle(x, y, 146, 196, Phaser.Display.Color.HexStringToColor(card.color).color, 0.96)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });
      const art = this.add.image(x, y - 10, this.cardArtPath(card)).setDisplaySize(118, 86);

      const cost = this.add.circle(x - 52, y - 80, 22, 0xffffff, 0.95).setStrokeStyle(3, 0xd4af37);
      const costLabel = this.add.text(x - 52, y - 80, `${card.cost}`, { fontSize: "24px", color: "#333" }).setOrigin(0.5);
      const label = this.add.text(x, y - 52, card.name, { fontSize: "18px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
      const category = this.add.text(x, y + 64, card.category, { fontSize: "18px", color: "#fff3bf", backgroundColor: "#00000055" }).setOrigin(0.5);
      const effect = this.add.text(x, y + 20, this.cardEffectLabel(card), { fontSize: "16px", color: "#f8f9fa", align: "center", wordWrap: { width: 130 } }).setOrigin(0.5);
      const desc = this.add.text(x, y + 94, card.description, { fontSize: "13px", color: "#f1f3f5", align: "center", wordWrap: { width: 132 } }).setOrigin(0.5);

      box.on("pointerup", () => this.playCard(index));
      box.on("pointerover", () => box.setScale(1.06));
      box.on("pointerout", () => box.setScale(1));

      [frame, box, art, cost, costLabel, label, category, effect, desc].forEach((ui) => ui.setData("hand-ui", true));
    });
  }

  private clearHandUI(): void {
    this.children.list.filter((obj) => obj.getData("hand-ui")).forEach((obj) => obj.destroy());
  }

  private clearRewardUI(): void {
    this.children.list.filter((obj) => obj.getData("reward-ui")).forEach((obj) => obj.destroy());
  }


  private cardArtPath(card: Card): string {
    if (card.category === "攻撃") return "art-attack";
    if (card.category === "防御") return "art-skill";
    return "art-support";
  }

  private cardEffectLabel(card: Card): string {
    return [card.damage ? `ダメージ ${card.damage}` : null, card.block ? `ブロック ${card.block}` : null, card.applyVulnerable ? `脆弱 ${card.applyVulnerable}` : null, card.draw ? `ドロー ${card.draw}` : null, card.heal ? `回復 ${card.heal}` : null]
      .filter(Boolean)
      .join(" | ");
  }

  private updateStatusTexts(): void {
    const intentDamage = INTENT_PATTERN[this.intentIndex % INTENT_PATTERN.length];
    this.playerHpText.setText(`Player HP: ${this.playerHp}  Block: ${this.playerBlock}`);
    this.enemyHpText.setText(`Enemy HP: ${this.enemyHp}  Vulnerable: ${this.enemyVulnerable}`);
    this.energyText.setText(`エナジー: ${this.energy}   山札: ${this.drawPile.length}   捨て札: ${this.discardPile.length}`);
    this.turnText.setText(`Turn ${this.turn}  Deck: ${runState.deck.length}`);
    this.intentText.setText(`敵の行動予告: 攻撃 ${intentDamage}`);
  }

  private drawCharacter(x: number, y: number, color: number, label: string): void {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - 70, y - 110, 140, 190, 24);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(x, y - 130, 44);

    this.add.text(x, y + 98, label, { fontSize: "24px", color: "#ffffff" }).setOrigin(0.5);
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, label, {
        fontSize: "28px",
        color: "#ffffff",
        backgroundColor: "#374151",
        padding: { left: 18, right: 18, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#4b5563" }));
    btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#374151" }));
    btn.on("pointerup", onClick);
    return btn;
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
