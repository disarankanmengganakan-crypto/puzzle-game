import Phaser from "phaser";

type MapNodeType = "battle" | "rest" | "elite" | "boss";

type MapNode = {
  id: string;
  x: number;
  y: number;
  type: MapNodeType;
  next: string[];
};

const nodes: MapNode[] = [
  { id: "n1", x: 280, y: 620, type: "battle", next: ["n2", "n3"] },
  { id: "n2", x: 460, y: 500, type: "battle", next: ["n4"] },
  { id: "n3", x: 760, y: 500, type: "rest", next: ["n4", "n5"] },
  { id: "n4", x: 600, y: 380, type: "elite", next: ["n6"] },
  { id: "n5", x: 900, y: 360, type: "battle", next: ["n6"] },
  { id: "n6", x: 740, y: 220, type: "boss", next: [] },
];

export class MapScene extends Phaser.Scene {
  constructor() {
    super("map");
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x12131f);

    this.add.text(40, 28, "World Map", {
      fontSize: "40px",
      color: "#f6d77c",
      fontStyle: "bold",
    });

    this.add.text(40, 78, "ノードをクリックして進む（まずは戦闘ノードのみ遷移）", {
      fontSize: "22px",
      color: "#d3d6e7",
    });

    this.drawPaths();
    this.drawNodes();
  }

  private drawPaths(): void {
    const g = this.add.graphics();
    g.lineStyle(5, 0x5f6b8b, 0.9);

    nodes.forEach((node) => {
      node.next.forEach((nextId) => {
        const next = nodes.find((n) => n.id === nextId);
        if (!next) return;

        g.beginPath();
        g.moveTo(node.x, node.y);
        g.lineTo(next.x, next.y);
        g.strokePath();
      });
    });
  }

  private drawNodes(): void {
    const colorMap: Record<MapNodeType, number> = {
      battle: 0x7bc8ff,
      rest: 0x8ff0a4,
      elite: 0xff7f7f,
      boss: 0xffd166,
    };

    nodes.forEach((node) => {
      const circle = this.add.circle(node.x, node.y, 28, colorMap[node.type]).setStrokeStyle(4, 0xffffff, 0.9);
      const label = this.add
        .text(node.x, node.y + 44, node.type.toUpperCase(), {
          fontSize: "18px",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      if (node.type === "battle") {
        circle.setInteractive({ useHandCursor: true });
        circle.on("pointerup", () => {
          this.scene.start("battle", { nodeId: node.id });
        });

        this.tweens.add({ targets: [circle, label], alpha: { from: 1, to: 0.5 }, duration: 800, yoyo: true, repeat: -1 });
      } else {
        circle.setAlpha(0.8);
      }
    });
  }
}
