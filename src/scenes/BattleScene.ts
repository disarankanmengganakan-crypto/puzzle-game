import Phaser from "phaser";

export class BattleScene extends Phaser.Scene {
  private playerHp = 40;
  private enemyHp = 32;

  constructor() {
    super("battle");
  }

  create(data: { nodeId?: string }): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1326);

    this.add.text(36, 24, `Battle Prototype (${data.nodeId ?? "unknown"})`, {
      fontSize: "36px",
      color: "#ffd166",
      fontStyle: "bold",
    });

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
}
