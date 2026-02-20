import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center">
          <span className="mr-2 inline-flex rounded-lg bg-blue-600 p-1.5 text-white">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6l-7-3Z" />
            </svg>
          </span>
          <span className="text-xl font-bold tracking-tight text-gray-900">FortLife Group</span>
        </Link>

        <div className="hidden items-center space-x-8 md:flex">
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-blue-600"
          >
            Inicio
          </Link>
          <Link
            href="/profile"
            className="rounded-md px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-blue-600"
          >
            Mi Perfil
          </Link>
          <Link
            href="/api/auth/signout"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
          >
            Cerrar Sesion
          </Link>
        </div>
      </div>
    </nav>
  );
}
