export interface InspectionResult {
  equipmentNo: string
  component: string
  measurementPoint: string
  inspectionDate: string
  status?: "合格" | "不合格" | "要確認"
}

export const precisionEquipmentData: InspectionResult[] = [
  {
    equipmentNo: "PE-001",
    component: "スピンドル",
    measurementPoint: "回転精度",
    inspectionDate: "2024-07-01",
    status: "合格"
  },
  {
    equipmentNo: "PE-002", 
    component: "ガイドレール",
    measurementPoint: "真直度",
    inspectionDate: "2024-07-02",
    status: "不合格"
  },
  {
    equipmentNo: "PE-003",
    component: "ボールねじ",
    measurementPoint: "バックラッシュ",
    inspectionDate: "2024-07-03",
    status: "合格"
  }
]

export const rotatingEquipmentData: InspectionResult[] = [
  {
    equipmentNo: "RE-001",
    component: "ポンプ",
    measurementPoint: "振動レベル",
    inspectionDate: "2024-07-01",
    status: "合格"
  },
  {
    equipmentNo: "RE-002",
    component: "モーター",
    measurementPoint: "軸受温度",
    inspectionDate: "2024-07-02",
    status: "要確認"
  },
  {
    equipmentNo: "RE-003",
    component: "ファン",
    measurementPoint: "回転数",
    inspectionDate: "2024-07-03",
    status: "合格"
  }
]

export const electricalData: InspectionResult[] = [
  {
    equipmentNo: "EL-001",
    component: "配電盤",
    measurementPoint: "絶縁抵抗",
    inspectionDate: "2024-07-01",
    status: "合格"
  },
  {
    equipmentNo: "EL-002",
    component: "変圧器",
    measurementPoint: "温度上昇",
    inspectionDate: "2024-07-02",
    status: "合格"
  },
  {
    equipmentNo: "EL-003",
    component: "制御盤",
    measurementPoint: "接点抵抗",
    inspectionDate: "2024-07-03",
    status: "不合格"
  }
]

export const instrumentationData: InspectionResult[] = [
  {
    equipmentNo: "IN-001",
    component: "圧力計",
    measurementPoint: "指示精度",
    inspectionDate: "2024-07-01",
    status: "合格"
  },
  {
    equipmentNo: "IN-002",
    component: "流量計",
    measurementPoint: "校正値",
    inspectionDate: "2024-07-02",
    status: "合格"
  },
  {
    equipmentNo: "IN-003",
    component: "温度計",
    measurementPoint: "応答時間",
    inspectionDate: "2024-07-03",
    status: "要確認"
  }
] 