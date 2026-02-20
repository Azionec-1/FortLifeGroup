import { Dashboard } from "@/app/components/Dashboard";
import { prisma } from "@/lib/prisma";
import { resolveAuthCompanyContext } from "@/modules/shared/server/company-context";

function resolveMonth(rawMonth?: string): { selectedMonth: string; monthStart: Date; monthEnd: Date } {
  const now = new Date();
  const fallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(String(rawMonth ?? ""))
    ? String(rawMonth)
    : fallback;

  const [yearText, monthText] = selectedMonth.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const monthStart = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);
  return { selectedMonth, monthStart, monthEnd };
}

function monthLabelEs(date: Date): string {
  const formatted = new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }> | { month?: string };
}) {
  const authContext = await resolveAuthCompanyContext();
  if (!authContext.ok) {
    return <p className="px-4 py-8 text-sm text-[#5f718c]">No se pudo cargar dashboard.</p>;
  }

  const params = searchParams ? await searchParams : undefined;
  const { selectedMonth, monthStart, monthEnd } = resolveMonth(params?.month);

  const [
    workersThisMonth,
    eppThisMonth,
    auditsThisMonth,
    incidentsThisMonth,
    workersWithoutTraining,
    eppWithoutPhoto,
    auditsWithoutEvidence,
    incidentsWithoutEvidence,
  ] = await Promise.all([
    prisma.worker.count({
      where: {
        companyId: authContext.companyId,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.eppDelivery.count({
      where: {
        companyId: authContext.companyId,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.auditRecord.count({
      where: {
        companyId: authContext.companyId,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.incidentRecord.count({
      where: {
        companyId: authContext.companyId,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.worker.count({
      where: {
        companyId: authContext.companyId,
        initialSstTrainingCompleted: false,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.eppDelivery.count({
      where: {
        companyId: authContext.companyId,
        deliveryPhotoUrl: null,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.auditRecord.count({
      where: {
        companyId: authContext.companyId,
        attachments: { none: {} },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.incidentRecord.count({
      where: {
        companyId: authContext.companyId,
        attachments: { none: {} },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
  ]);

  const pendingActions = [
    {
      id: "workers-training",
      label: "Trabajadores sin capacitacion inicial",
      value: workersWithoutTraining,
      description: "Pendientes de completar capacitacion SST",
      href: "/dashboard/workers",
    },
    {
      id: "epp-photo",
      label: "Entregas EPP sin foto",
      value: eppWithoutPhoto,
      description: "Registros de EPP sin evidencia fotografica",
      href: "/dashboard/epp",
    },
    {
      id: "audits-evidence",
      label: "Auditorias sin evidencia",
      value: auditsWithoutEvidence,
      description: "Auditorias sin archivos adjuntos",
      href: "/dashboard/audits",
    },
    {
      id: "incidents-evidence",
      label: "Accidentes sin evidencia",
      value: incidentsWithoutEvidence,
      description: "Incidentes sin adjuntos de soporte",
      href: "/dashboard/incidents",
    },
  ].filter((item) => item.value > 0);

  return (
    <Dashboard
      selectedMonth={selectedMonth}
      monthLabel={monthLabelEs(monthStart)}
      pendingActions={pendingActions}
      kpis={{
        workersThisMonth,
        eppThisMonth,
        auditsThisMonth,
        incidentsThisMonth,
      }}
    />
  );
}
