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
    this.messageText.setText("カードを選んで行動してください");

      this.messageText.setText("エナジーが足りません");
      this.messageText.setText(`${card.name}：${finalDamage}ダメージ`);

      this.messageText.setText(`${card.name}：ブロック+${card.block}`);
      this.messageText.setText(`${card.name}：脆弱を付与`);
    }

    if (card.heal) {
      this.playerHp = Math.min(40, this.playerHp + card.heal);
      this.messageText.setText(`${card.name}：HPを${card.heal}回復`);
    }

    if (card.draw) {
      this.drawCards(card.draw);
      this.messageText.setText(`${card.name}：${card.draw}枚ドロー`);
      const y = height / 2 + 50;

      const panel = this.add.rectangle(x, y, 190, 240, Phaser.Display.Color.HexStringToColor(card.color).color, 0.95)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true });
      panel.setData("reward-ui", true);

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

      const frame = this.add.rectangle(x, y, 158, 208, 0xf8f0e3, 1).setStrokeStyle(4, 0xd4af37);
      const box = this.add.rectangle(x, y, 146, 196, Phaser.Display.Color.HexStringToColor(card.color).color, 0.96)
        .setStrokeStyle(2, 0xffffff)
      const cost = this.add.circle(x - 52, y - 80, 22, 0xffffff, 0.95).setStrokeStyle(3, 0xd4af37);
      const costLabel = this.add.text(x - 52, y - 80, `${card.cost}`, { fontSize: "24px", color: "#333" }).setOrigin(0.5);
      const label = this.add.text(x, y - 52, card.name, { fontSize: "18px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
      const category = this.add.text(x, y + 64, card.category, { fontSize: "18px", color: "#fff3bf", backgroundColor: "#00000055" }).setOrigin(0.5);
      const effect = this.add.text(x, y + 20, this.cardEffectLabel(card), { fontSize: "16px", color: "#f8f9fa", align: "center", wordWrap: { width: 130 } }).setOrigin(0.5);
      const desc = this.add.text(x, y + 94, card.description, { fontSize: "13px", color: "#f1f3f5", align: "center", wordWrap: { width: 132 } }).setOrigin(0.5);
      [frame, box, cost, costLabel, label, category, effect, desc].forEach((ui) => ui.setData("hand-ui", true));
    return [card.damage ? `ダメージ ${card.damage}` : null, card.block ? `ブロック ${card.block}` : null, card.applyVulnerable ? `脆弱 ${card.applyVulnerable}` : null, card.draw ? `ドロー ${card.draw}` : null, card.heal ? `回復 ${card.heal}` : null]
      .filter(Boolean)
      .join(" | ");
    this.energyText.setText(`エナジー: ${this.energy}   山札: ${this.drawPile.length}   捨て札: ${this.discardPile.length}`);
    this.intentText.setText(`敵の行動予告: 攻撃 ${intentDamage}`);
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#4b5563" }));
    btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#374151" }));
    btn.on("pointerup", onClick);

    return btn;
  }
}
