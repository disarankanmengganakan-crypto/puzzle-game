import Phaser from "phaser";
import { type CardData, REWARD_POOL, runState } from "../game/runState";

type Card = CardData;
  private rewardPhase = false;
    const playerHpText = this.add.text(100, 140, `Player HP: ${this.playerHp}`, { fontSize: "28px", color: "#e7f5ff" });
    const enemyHpText = this.add.text(width - 320, 140, `Enemy HP: ${this.enemyHp}`, { fontSize: "28px", color: "#ffe3e3" });

    this.drawCharacter(220, 370, 0x4dabf7, "PLAYER");
    this.drawCharacter(width - 220, 340, 0xff6b6b, "ENEMY");

    const strikeBtn = this.makeButton(width / 2, height - 170, "Strike (6)", () => {
      this.enemyHp = Math.max(0, this.enemyHp - 6);
      enemyHpText.setText(`Enemy HP: ${this.enemyHp}`);
      this.enemyTurn(playerHpText);
    });

    const defendBtn = this.makeButton(width / 2, height - 100, "Defend (+5 block)", () => {
      this.playerHp = Math.min(40, this.playerHp + 2);
      playerHpText.setText(`Player HP: ${this.playerHp}`);
      this.enemyTurn(playerHpText, 2);
    });

    const backBtn = this.makeButton(130, height - 52, "← Map", () => this.scene.start("map"));
    backBtn.setScale(0.8);

    this.events.on("update", () => {
      strikeBtn.setAlpha(this.enemyHp > 0 ? 1 : 0.4);
      defendBtn.setAlpha(this.enemyHp > 0 ? 1 : 0.4);
      if (this.enemyHp <= 0) {
        this.add.text(width / 2, 86, "Victory! Press ← Map", { fontSize: "30px", color: "#8ff0a4" }).setOrigin(0.5);
      }
    });
  }

  private enemyTurn(playerHpText: Phaser.GameObjects.Text, blocked = 0): void {
    if (this.enemyHp <= 0) return;
    const enemyDamage = Math.max(0, 5 - blocked);
    this.playerHp = Math.max(0, this.playerHp - enemyDamage);
    playerHpText.setText(`Player HP: ${this.playerHp}`);
  }

  private drawCharacter(x: number, y: number, color: number, label: string): void {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - 70, y - 110, 140, 190, 24);
    this.rewardPhase = false;
    this.drawPile = this.shuffle([...runState.deck]);
    if (this.enemyHp <= 0 || this.playerHp <= 0 || this.rewardPhase) return;

    if (!card || this.enemyHp <= 0 || this.playerHp <= 0 || this.rewardPhase) return;
      this.enemyHp = 0;
      this.openRewardSelection();

  private openRewardSelection(): void {
    this.rewardPhase = true;
    this.messageText.setText("Victory! カードを1枚選んでください");

    const rewardCandidates = this.shuffle([...REWARD_POOL]).slice(0, 3);
    const { width, height } = this.scale;

    rewardCandidates.forEach((card, index) => {
      const x = width / 2 - 230 + index * 230;
      const y = height / 2 + 50;

      const panel = this.add.rectangle(x, y, 190, 240, Phaser.Display.Color.HexStringToColor(card.color).color, 0.95)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true });
      panel.setData("reward-ui", true);

      const name = this.add.text(x, y - 65, card.name, { fontSize: "24px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
      const cost = this.add.text(x, y - 100, `Cost ${card.cost}`, { fontSize: "18px", color: "#fff3bf" }).setOrigin(0.5);
      const effect = this.add
        .text(x, y + 25, this.cardEffectLabel(card), { fontSize: "18px", color: "#f8f9fa", align: "center" })
        .setOrigin(0.5);

      [name, cost, effect].forEach((ui) => ui.setData("reward-ui", true));

      panel.on("pointerup", () => {
        runState.addCard(card);
        this.clearRewardUI();
        this.messageText.setText(`${card.name} を獲得！ デッキ枚数: ${runState.deck.length}`);
        this.time.delayedCall(450, () => this.scene.start("map"));
      });
    });
  }

      const effect = this.add.text(x, y + 32, this.cardEffectLabel(card), { fontSize: "20px", color: "#f8f9fa" }).setOrigin(0.5);
    this.children.list.filter((obj) => obj.getData("hand-ui")).forEach((obj) => obj.destroy());
  }

  private clearRewardUI(): void {
    this.children.list.filter((obj) => obj.getData("reward-ui")).forEach((obj) => obj.destroy());
  }

  private cardEffectLabel(card: Card): string {
    return [card.damage ? `DMG ${card.damage}` : null, card.block ? `BLK ${card.block}` : null, card.applyVulnerable ? "VULN" : null]
      .filter(Boolean)
      .join(" | ");
    this.turnText.setText(`Turn ${this.turn}  Deck: ${runState.deck.length}`);
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#4b5563" }));
    btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#374151" }));
    btn.on("pointerup", onClick);

    return btn;
  }
}
