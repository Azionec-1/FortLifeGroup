/**
 * Seed comercial base: servicios y planes.
 * No toca usuarios ni datos operativos SST.
 */
export async function seedCommercialBase(prisma) {
  const company = await prisma.company.upsert({
    where: { id: "fortlife-default-company" },
    update: { name: "FortLife Group" },
    create: {
      id: "fortlife-default-company",
      name: "FortLife Group",
    },
  });

  await prisma.serviceCatalog.deleteMany({ where: { companyId: company.id } });
  await prisma.serviceCatalog.createMany({
    data: [
      {
        companyId: company.id,
        title: "Implementacion de sistemas de gestion SST",
        description:
          "Diseno, implementacion y acompanamiento para sistemas de SST segun necesidad del cliente.",
        displayOrder: 1,
        isActive: true,
      },
      {
        companyId: company.id,
        title: "Simulacion de auditorias SST",
        description: "Evaluaciones preventivas para identificar brechas antes de auditorias formales.",
        displayOrder: 2,
        isActive: true,
      },
      {
        companyId: company.id,
        title: "Consultoria y soporte continuo",
        description: "Soporte tecnico para mejora continua de seguridad y salud en el trabajo.",
        displayOrder: 3,
        isActive: true,
      },
    ],
  });

  const basicPlan = await prisma.plan.upsert({
    where: { code: "BASIC" },
    update: {
      companyId: company.id,
      name: "Plan Basico",
      description: "Base para empresas en etapa inicial de gestion SST.",
      priceCents: 9900,
      currency: "PEN",
      isActive: true,
    },
    create: {
      code: "BASIC",
      companyId: company.id,
      name: "Plan Basico",
      description: "Base para empresas en etapa inicial de gestion SST.",
      priceCents: 9900,
      currency: "PEN",
      isActive: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { code: "PRO" },
    update: {
      companyId: company.id,
      name: "Plan Pro",
      description: "Incluye acompanamiento operativo y seguimiento de indicadores.",
      priceCents: 24900,
      currency: "PEN",
      isActive: true,
    },
    create: {
      code: "PRO",
      companyId: company.id,
      name: "Plan Pro",
      description: "Incluye acompanamiento operativo y seguimiento de indicadores.",
      priceCents: 24900,
      currency: "PEN",
      isActive: true,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { code: "ENTERPRISE" },
    update: {
      companyId: company.id,
      name: "Plan Enterprise",
      description: "Cobertura integral multi-area con soporte prioritario.",
      priceCents: 49900,
      currency: "PEN",
      isActive: true,
    },
    create: {
      code: "ENTERPRISE",
      companyId: company.id,
      name: "Plan Enterprise",
      description: "Cobertura integral multi-area con soporte prioritario.",
      priceCents: 49900,
      currency: "PEN",
      isActive: true,
    },
  });

  await prisma.planBenefit.deleteMany({
    where: { planId: { in: [basicPlan.id, proPlan.id, enterprisePlan.id] } },
  });

  await prisma.planBenefit.createMany({
    data: [
      { planId: basicPlan.id, title: "Diagnostico inicial SST", displayOrder: 1 },
      { planId: basicPlan.id, title: "Soporte por correo", displayOrder: 2 },
      { planId: proPlan.id, title: "Todo lo del Plan Basico", displayOrder: 1 },
      { planId: proPlan.id, title: "Simulacion de auditorias", displayOrder: 2 },
      { planId: proPlan.id, title: "Tablero de seguimiento", displayOrder: 3 },
      { planId: enterprisePlan.id, title: "Todo lo del Plan Pro", displayOrder: 1 },
      { planId: enterprisePlan.id, title: "Consultoria personalizada", displayOrder: 2 },
      { planId: enterprisePlan.id, title: "Soporte prioritario", displayOrder: 3 },
    ],
  });
}
