# ダーククイーン・パズルバトル

提示画像の構図を参考に、**縦画面のパズルRPG風 UI** をブラウザで再現したプロトタイプです。

## 特徴

- 7x6 の 1マス移動パズル（隣接オーブのみ入れ替え）
- ボスHPバー、残りターン、コンボ・ダメージ演出
- 下部キャラパネル、スキルボタン、メニュー帯
- 画像素材に依存しないよう、現状は CSS で擬似アセットを描画

## 実行

`index.html` をブラウザで開くだけで遊べます。

## Image-gen アセット差し替え案

以下の要素は Image-gen 画像に差し替えると、提示画像へより忠実になります。

- `boss-portrait`（敵キャラと背景エフェクト）
- `hero-art`（味方キャラ立ち絵）
- 各属性オーブ（火/水/木/光/闇/回復）
- UI フレーム装飾（金枠、バッジ、吹き出し）

### 推奨プロンプト例

- 敵キャラ: 「anime dark queen boss, fantasy RPG battle UI, purple aura, dynamic pose, high detail」
- 味方キャラ: 「anime pink-haired healer mage, cheerful, fantasy RPG portrait, high detail」
- オーブ: 「match-3 elemental orb icon set, fire water wood light dark heart, glossy game UI」
