# モンスター娘ローグライク - 深淵の迷宮

ブラウザで遊べる、**1F〜30F のターン制ローグライク**です。

## 実装内容

- 18x18 グリッドのランダム生成ダンジョン
- 地下 1F から 30F までの階層進行
- 視界・未踏破マス・探索率・ミニマップ
- モンスター娘系の敵のみ出現（ドラゴン娘/スライム娘/ウルフ娘/スパイダー娘/ゴースト娘/サキュバス娘）
- アイテム（ゴールド/回復薬）、階段、SPスキル
- 近接戦闘 + 敵AI + 防御/索敵/範囲攻撃スキル

## 起動方法

`index.html` をブラウザで開くだけでプレイできます。

## 操作

- 移動: `WASD` または 矢印キー
- 待機: `Space` または `ターン終了`
- スキル: 左パネルのボタン

## アセットについて

本リポジトリは著作権・利用規約に配慮し、既存作品の画像を直接コピーせず、
絵文字と CSS でプロトタイプ表示しています。

必要なら以下方針で差し替えてください。

- 立ち絵 / UI 枠 / 床タイル / ミニアイコンを独自生成
- 画像生成時は「全年齢向け・露出控えめ・ファンタジーRPG UI」を明記
- 生成アセットの商用可否とライセンスを必ず確認

## PR が Conflict したときの解消手順

GitHub で `This branch has conflicts that must be resolved` と出た場合は、
`main` の最新を取り込んで競合を解消してから push してください。

```bash
git fetch origin
git checkout <your-branch>
git merge origin/main
# 競合ファイルを編集（<<<<<<< ======= >>>>>>> を解消）
git add README.md app.js index.html styles.css
git commit -m "Resolve merge conflicts with main"
git push origin <your-branch>
```

rebase 運用なら次でもOKです。

```bash
git fetch origin
git checkout <your-branch>
git rebase origin/main
# 競合解消
# git add <files>
# git rebase --continue
git push --force-with-lease origin <your-branch>
```

ポイント:
- GitHub の `Resolve conflicts` ボタンでも解消できますが、4ファイル同時競合はローカル解消のほうが安全です。
- 競合マーカーを残したまま commit しないこと（`rg "^<<<<<<<|^=======|^>>>>>>>"` で確認）。
