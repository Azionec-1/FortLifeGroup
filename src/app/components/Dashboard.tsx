import Link from "next/link";

type PendingActionItem = {
  id: string;
  label: string;
  value: number;
  description: string;
  href: string;
};

type DashboardProps = {
  selectedMonth: string;
  monthLabel: string;
  pendingActions: PendingActionItem[];
  kpis: {
    workersThisMonth: number;
    eppThisMonth: number;
    auditsThisMonth: number;
    incidentsThisMonth: number;
  };
};

export function Dashboard({ selectedMonth, monthLabel, pendingActions, kpis }: DashboardProps) {
  const cards = [
    {
      id: "trabajadores",
      title: "Trabajadores",
      description: "Registro de trabajadores con codigo correlativo, estado e informacion inicial SST.",
      href: "/dashboard/workers",
      buttonText: "Ir a trabajadores",
      color: "bg-blue-50",
      icon: (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-8 w-8 text-blue-600"
        >
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 18c.8-2.7 2.8-4 5.5-4s4.7 1.3 5.5 4" />
          <circle cx="17.5" cy="8.5" r="2.5" />
          <path d="M14.7 17.8c.6-1.8 2-2.8 4-2.8 1.1 0 2.1.3 2.8.9" />
        </svg>
      ),
    },
    {
      id: "epp",
      title: "Entregas de EPP",
      description: "Registro por trabajador de cada equipo entregado, con fecha y responsable.",
      href: "/dashboard/epp",
      buttonText: "Ir a EPP",
      color: "bg-orange-50",
      icon: (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-8 w-8 text-orange-600"
        >
          <path d="M4 14h16l-1-4a3 3 0 0 0-3-2h-1V6a3 3 0 1 0-6 0v2H8a3 3 0 0 0-3 2l-1 4Z" />
          <path d="M4 14v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          <path d="M12 3v5" />
        </svg>
      ),
    },
    {
      id: "auditorias",
      title: "Auditorias",
      description: "Registro de actividades de auditoria, responsables y detalle de ejecucion.",
      href: "/dashboard/audits",
      buttonText: "Ir a auditorias",
      color: "bg-green-50",
      icon: (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-8 w-8 text-green-600"
        >
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 7h6" />
          <path d="M9 12h6" />
          <path d="m9.5 16 1.5 1.5 3.5-3.5" />
        </svg>
      ),
    },
    {
      id: "accidentes",
      title: "Accidentes",
      description: "Registro de incidentes, procedimiento aplicado, declaracion del trabajador y evidencias.",
      href: "/dashboard/incidents",
      buttonText: "Ir a accidentes",
      color: "bg-red-50",
      icon: (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-8 w-8 text-red-600"
        >
          <path d="M12 4 3 20h18L12 4Z" />
          <path d="M12 10v4" />
          <circle cx="12" cy="17" r="1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6 text-white"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">SST Dashboard</h1>
          </div>
          <p className="text-gray-600">Gestion de Seguridad y Salud en el Trabajo - FortLife Group</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
              Datos del mes: {monthLabel}
            </p>
            <form method="GET" className="flex items-center gap-2">
              <input
                type="month"
                name="month"
                defaultValue={selectedMonth}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Aplicar
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.id}
              className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`${card.color} mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110`}
              >
                {card.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">{card.title}</h3>
              <p className="mb-8 h-12 overflow-hidden text-sm leading-relaxed text-gray-500">
                {card.description}
              </p>
              <Link
                href={card.href}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-100 transition-colors hover:bg-blue-700"
              >
                {card.buttonText}
                <span className="transition-transform group-hover/btn:translate-x-1">&rarr;</span>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Acciones pendientes</h3>
            <div className="space-y-4">
              {pendingActions.length === 0 ? (
                <p className="text-sm text-gray-500">No hay acciones pendientes por ahora.</p>
              ) : (
                pendingActions.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 transition-colors hover:bg-blue-50"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-blue-700">
                        {item.value}
                      </span>
                      <span className="text-sm font-bold text-blue-700">&rarr;</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Indicadores rapidos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Trabajadores registrados
                </p>
                <p className="mt-2 text-3xl font-extrabold text-blue-800">{kpis.workersThisMonth}</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">EPP entregado este mes</p>
                <p className="mt-2 text-3xl font-extrabold text-orange-800">{kpis.eppThisMonth}</p>
              </div>
              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Auditorias este mes</p>
                <p className="mt-2 text-3xl font-extrabold text-green-800">{kpis.auditsThisMonth}</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Accidentes este mes</p>
                <p className="mt-2 text-3xl font-extrabold text-red-800">{kpis.incidentsThisMonth}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
