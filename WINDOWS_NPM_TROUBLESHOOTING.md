# Windows: npm 実行時に `PSSecurityException` が出る場合

`node -v` は成功するのに `npm -v` で次のようなエラーが出る場合、PowerShell の実行ポリシーが原因です。

- `npm : このシステムではスクリプトの実行が無効になっているため ... npm.ps1 を読み込むことができません`
- `PSSecurityException`

## まずは一時回避（安全・すぐ試せる）
PowerShell では `npm` の代わりに `npm.cmd` を使うと、`.ps1` を経由しないため実行できます。

```powershell
npm.cmd -v
npm.cmd install
npm.cmd run dev
```

## 恒久対応（推奨）
PowerShell を**管理者で開かず通常ユーザー**で開き、次を実行します。

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

確認が出たら `Y` を入力してください。

その後、PowerShell を開き直して確認:

```powershell
npm -v
```

## `ENOENT package.json` が出る場合（今回の画面の状態）
`npm.cmd` 自体は動いています。エラーの原因は**今いるフォルダに `package.json` が無い**ことです。

例: `C:\Users\PC_User\Desktop` で実行すると、`C:\Users\PC_User\Desktop\package.json` を探して失敗します。

先にプロジェクトフォルダへ移動してください。

```powershell
cd "<あなたがこのプロジェクトを置いたフォルダ>"
dir package.json
```

`package.json` が表示されたら、そこで実行:

```powershell
npm.cmd install
npm.cmd run dev
```

## もし会社PCなどでポリシー変更できない場合
- そのまま `npm.cmd` を使って開発を進められます。
- もしくはコマンドプロンプト（cmd.exe）で `npm` を実行してください。

## このプロジェクトの起動（再確認）

```powershell
cd <このリポジトリのパス>
npm install
npm run dev
```

`npm` がまだ失敗する場合は `npm.cmd` に置き換えてください。
