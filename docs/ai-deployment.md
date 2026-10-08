# 写真のAI分析を公開する

## 今回の変更

以前は保存済みのFirebase写真をブラウザーのfetchで読み直してからAI APIへ送っていました。StorageのCORS設定に本番のOriginが許可されていないと、画像は表示できても、この読み直しで「Failed to fetch」になります。リポジトリのcors.jsonには開発用Originしかありませんでした。実際のバケット設定は別途確認が必要です。

今回の実装ではブラウザーが同じOriginの`/api/analyze`へ写真URLを送ります。サーバーがFirebase IDトークンを検証し、対象バケット内の`meals/{検証済みUID}/{日付}/{写真ファイル}`だけを取得します。外部URL、別ユーザー、リダイレクトは拒否します。取得した写真のバイト列だけをAnthropicに送信し、Storageのダウンロードトークンは送信しません。画面での送信同意は引き続き必要です。

## Vercelの設定

1. 対象プロジェクト: https://vercel.com/renrenbatabatas-projects/nourish-web-app
2. Settings → Environment Variablesで`ANTHROPIC_API_KEY`をProductionに設定してください。既存の`CLAUDE_API_KEY`でも動きます。両方ある場合は`ANTHROPIC_API_KEY`を優先します。APIキーをGitHubやチャット、`NEXT_PUBLIC_`変数に保存しないでください。
3. Anthropic側でキーが有効で、API利用の残高・利用枠があることを確認してください。
4. 必要に応じてPreviewにも同じ設定を行ってください。モデルを指定する場合は`ANTHROPIC_MODEL`を設定します。既定値は`claude-haiku-4-5-20251001`です。
5. 修正ブランチをmainに反映してVercelの自動デプロイを待ってください。環境変数だけを変更した場合も再デプロイが必要です。

## 公開後の確認

Googleでログイン → 食事の写真を追加 →「食材と栄養のヒント」を開く → 送信に同意 →「写真の食材を確認する」。食材と栄養の種類が出ること、ページを更新しても結果が保存されていることを確認してください。すでに保存済みの写真でも確認します。

通信障害、削除された写真、期限切れのログイン、API設定がない場合は日本語のエラーを表示します。量・カロリー・一日の充足度の推定は既存の仕様に含まれていません。

## 検証と制限

`npm ci`、`node --test tests/*.test.cjs`、`npx tsc --noEmit`、`npm run lint`、`npm run build`で検証します。テストはFirebaseとAnthropicの応答を模擬するため、本物のAPIキーによる分析と保存は公開後の確認が必要です。

既存の「UIDごとに1時間12回」の制限はプロセスメモリに置かれています。Vercelの複数インスタンスや再起動をまたぐ厳密な利用上限ではありません。広くサービス展開して課金を厳密に制御する場合は、共有データストアによる回数制限とAnthropic側の支出上限が別途必要です。
