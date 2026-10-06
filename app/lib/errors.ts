export function errorMessage(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "auth/unauthorized-domain") return "このURLではログインできません。正式なアプリのURLから開き直してください。";
  if (code === "auth/popup-blocked") return "ログイン画面がブロックされました。ブラウザーのポップアップを許可して、もう一度お試しください。";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "ログインは完了していません。もう一度お試しいただけます。";
  if (code.includes("permission-denied") || code.includes("unauthorized")) return "記録へのアクセスを確認できませんでした。ログインし直しても続く場合は、管理者にお知らせください。";
  if (code.includes("unavailable") || code.includes("network")) return "通信できませんでした。接続を確認して、もう一度お試しください。";
  return "処理を完了できませんでした。入力内容はそのまま、もう一度お試しください。";
}
