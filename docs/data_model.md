## 設備保全管理システムデータモデル

### 概念データモデル

```mermaid
graph TD
    A[設備] --> B[作業指示]
    A --> C[点検計画]
    A --> D[異常報告]
    
    B --> E[保全履歴]
    B --> F[使用部品]
    
    G[設備種別] --> A
    H[作業種別] --> B
    I[担当者] --> B
    J[外注業者] --> B
    K[点検周期] --> C
    L[部品] --> F
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style E fill:#e8f5e8
    
    %% マスタデータを白色に指定
    style G fill:#ffffff
    style H fill:#ffffff
    style I fill:#ffffff
    style J fill:#ffffff
    style K fill:#ffffff
    style L fill:#ffffff
```

**色の意味：**
- 🔵 **水色（設備）**: システムの中心概念・保全対象
- 🟣 **紫色（作業指示）**: 作業・業務プロセス
- 🟢 **緑色（保全履歴）**: 実績・記録データ
- ⚪ **白色**: マスタデータ（設備種別、作業種別、担当者、外注業者、点検周期、部品）
- ⚫ **デフォルト色**: その他の概念

#### 概念の関係性

**🏭 設備（中心概念）**
- 設備種別により分類される
- 複数の作業指示の対象となる
- 点検計画により定期保全される
- 異常発生時に異常報告が作成される

**📋 作業指示**
- 設備に対する保全作業の指示
- 作業種別により分類される
- 担当者または外注業者が実施
- 実施後に保全履歴が生成される
- 必要に応じて部品を使用する

**📊 保全履歴**
- 作業指示の実施結果として記録される
- 設備の保全実績を蓄積する

**🔧 点検計画**
- 設備の定期点検を計画する
- 点検周期により実施間隔が決まる

**⚠️ 異常報告**
- 設備の不具合発生時に作成される
- 原因分析と対策を記録する


### 論理データモデル(ER図)
```mermaid

erDiagram
  設備 ||--o{ 作業指示 : has
  設備 ||--o{ 保全履歴 : has
  設備 ||--o{ 点検計画 : has
  設備 ||--o{ 異常報告 : has
  作業指示 ||--o{ 保全履歴 : generates
  作業指示 ||--o{ 使用部品 : uses
  部品 ||--o{ 使用部品 : included_in
  作業指示 }o--|| 作業種別マスタ : 種別参照
  作業指示 }o--|| 業者マスタ : 外注先
  作業指示 }o--|| 担当者マスタ : 担当者参照
  設備 }o--|| 設備種別マスタ : 分類参照
  点検計画 }o--|| 点検周期マスタ : 周期参照

  設備 {
    string 設備ID PK
    string 名称
    string 種別ID FK
    string 設備タグ
    string 設置場所
    string メーカー
    string 型式
    string 製造番号
    date 運転開始日
    string 状態
    string 親設備ID FK
  }

  設備種別マスタ {
    string 種別ID PK
    string 名称
    string 説明
  }

  作業指示 {
    string 作業指示ID PK
    string 設備ID FK
    string 作業種別ID FK
    string 外注先ID FK
    string 担当者ID FK
    string 作業内容
    string 依頼者
    date 開始日
    date 終了日
    string 状態
    string 優先度
  }

  作業種別マスタ {
    string 作業種別ID PK
    string 名称
    string 説明
  }

  担当者マスタ {
    string 担当者ID PK
    string 氏名
    string 所属
    string 連絡先
  }

  業者マスタ {
    string 外注先ID PK
    string 名称
    string 担当者
    string 電話番号
    string メール
  }

  保全履歴 {
    string 履歴ID PK
    string 設備ID FK
    string 作業指示ID FK
    date 実施日
    string 作業者
    string 作業詳細
    string 結果
    float 停止時間h
  }

  部品 {
    string 部品ID PK
    string 名称
    string 部品番号
    string 仕様
    int 在庫数
    float 単価
    string 保管場所
    string サプライヤー
  }

  使用部品 {
    string 作業指示ID FK
    string 部品ID FK
    int 使用数
  }

  点検計画 {
    string 計画ID PK
    string 設備ID FK
    string 点検種別
    string 周期ID FK
    date 最終点検日
    date 次回点検日
    string 点検者
  }

  点検周期マスタ {
    string 周期ID PK
    string 周期名
    int 日数間隔
  }

  異常報告 {
    string 報告ID PK
    string 設備ID FK
    date 発生日
    string 異常種別
    string 重大度
    string 症状
    string 根本原因
    string 是正措置
    string 報告者
  }

```
