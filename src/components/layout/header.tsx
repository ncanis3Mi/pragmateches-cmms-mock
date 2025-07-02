import Link from "next/link"

interface HeaderProps {
  userId?: string
}

export function Header({ userId = "TestUser" }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* ロゴ */}
        <Link 
          href="/dashboard" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PC</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Pragmateches CMMS
          </span>
        </Link>

        {/* ユーザー情報 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {userId.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {userId}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
} 