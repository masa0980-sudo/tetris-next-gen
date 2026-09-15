// プレイ回数の匿名集計。Firebase SDKは使わずFirestore REST APIをfetch()で直接叩く
// (single-fileではないがバンドルサイズ削減のため、姉妹プロジェクトと同じ方針を踏襲)。
//
// 複数の自作ブラウザゲームで共有しているFirestoreプロジェクト(rythm-game-mo)に
// gameIdごとの `playCounts/{gameId}` ドキュメントとしてカウントを積む。
// APIキーはクライアントに公開される前提のもの(Firestoreのセキュリティルール側で
// フィールド形状・increment幅を検証しており、読み取り専用の集計以外の悪用はできない)。

const PROJECT_ID = "rythm-game-mo";
const API_KEY = "AIzaSyBBo4f_LqJ2lfdKu8Q11oeiiYq_O-15LSc";
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const GAME_ID = "tetris";

/**
 * プレイ開始のたびに呼ぶ。ゲームプレイを一切ブロックしない fire-and-forget。
 *
 * まず既存ドキュメントへの原子的 +1 (increment transform) を試す。ドキュメントが
 * まだ存在しない場合(このgameIdの本当に最初の1プレイ)はそのcommitが失敗するので、
 * `count: 1` での新規作成にフォールバックする(セキュリティルールは新規作成を
 * `{count: 1}` ちょうどの場合のみ許可する)。これにより手動セットアップ無しで
 * 新しいgameIdが自己登録できる — 追加コストがかかるのは最初の1回だけ。
 */
export function increment(): Promise<void> {
  const commitUrl = `${ROOT}:commit?key=${API_KEY}`;
  const docPath = `projects/${PROJECT_ID}/databases/(default)/documents/playCounts/${encodeURIComponent(GAME_ID)}`;

  const incrementBody = {
    writes: [
      {
        transform: {
          document: docPath,
          fieldTransforms: [{ fieldPath: "count", increment: { integerValue: "1" } }],
        },
      },
    ],
  };

  const createBody = {
    writes: [
      {
        update: { name: docPath, fields: { count: { integerValue: "1" } } },
        currentDocument: { exists: false },
      },
    ],
  };

  return fetch(commitUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(incrementBody),
  })
    .then((res) => {
      if (res.ok) return;
      return fetch(commitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createBody),
      }).then(() => undefined);
    })
    .catch((e) => {
      console.warn("playCount increment failed:", e);
    });
}

/**
 * 表示用に現在のカウントを取得する。ドキュメントがまだ存在しない場合(このgameIdを
 * 誰もまだプレイしていない)やエラー時は null を返す — 呼び出し側は単に何も表示しない。
 *
 * 単一ドキュメントの読み取り専用GET(SDK不使用、素の fetch())。ローディング表示は
 * 挟まず、非同期に解決してから埋め込む想定(レンダリングをブロックしない)。
 */
export function fetchCount(): Promise<number | null> {
  const url = `${ROOT}/playCounts/${encodeURIComponent(GAME_ID)}?key=${API_KEY}`;

  return fetch(url)
    .then((res) => {
      if (!res.ok) return null;
      return res.json();
    })
    .then((doc) => {
      if (!doc || !doc.fields || !doc.fields.count) return null;
      return parseInt(doc.fields.count.integerValue, 10);
    })
    .catch((e) => {
      console.warn("playCount fetch failed:", e);
      return null;
    });
}
