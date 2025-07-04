"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardCheck, ChevronRight, BarChart3, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const menuItems = [
  {
    title: "検査結果",
    icon: ClipboardCheck,
    subItems: [
      {
        title: "精機器",
        href: "/dashboard/inspection-results/precision-equipment",
      },
      {
        title: "回転機",
        href: "/dashboard/inspection-results/rotating-equipment",
      },
      {
        title: "電気",
        href: "/dashboard/inspection-results/electrical",
      },
      {
        title: "計装",
        href: "/dashboard/inspection-results/instrumentation",
      },
    ],
  },
  {
    title: "AIアシスタント",
    icon: Brain,
    subItems: [
      {
        title: "グラフ生成",
        href: "/dashboard/ai/graph-generation",
      },
      {
        title: "インサイト分析",
        href: "/dashboard/ai/insights-analysis",
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full">
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            メニュー
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isHovered = hoveredItem === item.title
              const hasActiveSubItem = item.subItems?.some(subItem => pathname === subItem.href)
              
              return (
                <div 
                  key={item.title}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.title)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* メインメニュー項目 */}
                  <div
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      isHovered || hasActiveSubItem
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </div>

                  {/* ホバー時のサブメニュー（右側に表示） */}
                  {isHovered && item.subItems && (
                    <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[160px]">
                      {item.subItems.map((subItem) => {
                        const isActive = pathname === subItem.href
                        
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "block px-4 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-primary text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            {subItem.title}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
} 