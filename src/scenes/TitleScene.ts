import Phaser from "phaser";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("title");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x101520);

    const title = this.add
      .text(width / 2, height * 0.3, "CARD CLIMB", {
        fontSize: "96px",
        fontFamily: "Georgia, serif",
        color: "#f4d35e",
        stroke: "#3a2d0a",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: title.y - 12,
      duration: 1600,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(width / 2, height * 0.48, "A deckbuilding roguelike prototype", {
        fontSize: "30px",
        color: "#d7dbe6",
      })
      .setOrigin(0.5);

    const startLabel = this.add
      .text(width / 2, height * 0.72, "▶ CLICK OR PRESS SPACE TO START", {
        fontSize: "36px",
        color: "#ffffff",
        backgroundColor: "#243047",
        padding: { left: 24, right: 24, top: 14, bottom: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    let started = false;
    const startGame = (): void => {
      if (started) return;
      started = true;
      this.cameras.main.flash(280, 255, 255, 255);
      this.time.delayedCall(300, () => this.scene.start("map"));
    };

    startLabel.on("pointerup", startGame);
    this.input.keyboard?.on("keydown-SPACE", startGame);

    this.tweens.add({
      targets: startLabel,
      alpha: { from: 1, to: 0.35 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });
  }
}
