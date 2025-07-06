# Pragmateches CMMS Mock

Computerized Management System Mock Application
（設備保全管理システムのモック）

## 技術スタック

- **フロントエンド**: Next.js 14 App Router, React, TypeScript
- **バックエンド**: Node.js (Next.js API Routes)
- **UI**: Shadcn UI, Radix UI, Tailwind CSS
- **フォーム**: React Hook Form + Zod
- **状態管理**: next-safe-action

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数の設定:
```bash
# .env.example を .env.local にコピー
cp .env.example .env.local
```

3. `.env.local` を編集して実際のAPI キーを設定:
- Supabase プロジェクトURL と API キー
- OpenAI API キー

4. 開発サーバーの起動:
```bash
npm run dev
```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## データベース設定

Supabase データベースのセットアップについては `scripts/setup_supabase.md` を参照してください。

## スクリプト

- `npm run dev` - 開発サーバーの起動
- `npm run build` - 本番用ビルド
- `npm run start` - 本番サーバーの起動
- `npm run lint` - ESLintによるコードチェック
- `npm run type-check` - TypeScriptの型チェック

## プロジェクト構造

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # グローバルスタイル
│   ├── layout.tsx      # ルートレイアウト
│   └── page.tsx        # ホームページ
├── components/         # Reactコンポーネント
├── lib/               # ユーティリティ関数
├── types/             # TypeScript型定義
└── services/          # API/データサービス
``` 