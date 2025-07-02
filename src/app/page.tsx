import Link from "next/link"

export default function HomePage() {
  return (
    <main className="container mx-auto py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Pragmateches CMMS
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Computer Maintenance Management System Mock Application
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ログインする
          </Link>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
            詳細を見る <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </main>
  )
} 