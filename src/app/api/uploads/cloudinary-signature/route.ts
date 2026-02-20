import { createHash } from "crypto";
import { NextResponse } from "next/server";

import { resolveAuthCompanyContext } from "@/modules/shared/server/company-context";

type SignatureRequestBody = {
  kind?:
    | "incident_accident"
    | "incident_area"
    | "incident_work_type"
    | "epp_delivery"
    | "worker_training";
};

const FOLDER_BY_KIND: Record<NonNullable<SignatureRequestBody["kind"]>, string> = {
  incident_accident: "accident",
  incident_area: "area",
  incident_work_type: "work-type",
  epp_delivery: "epp-delivery",
  worker_training: "worker-training",
};

function getCloudinaryEnv() {
  const cloudNameRaw = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = cloudNameRaw?.startsWith("cloudinary://")
    ? cloudNameRaw.split("@")[1]?.trim()
    : cloudNameRaw?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${toSign}${apiSecret}`)
    .digest("hex");
}

export async function POST(req: Request) {
  const authContext = await resolveAuthCompanyContext();
  if (!authContext.ok) {
    return NextResponse.json({ error: authContext.error }, { status: authContext.status });
  }

  const env = getCloudinaryEnv();
  if (!env) {
    return NextResponse.json(
      { error: "Cloudinary no esta configurado en variables de entorno." },
      { status: 503 }
    );
  }

  let body: SignatureRequestBody = {};
  try {
    body = (await req.json()) as SignatureRequestBody;
  } catch {
    body = {};
  }

  const kind = body.kind ?? "incident_accident";
  if (!Object.prototype.hasOwnProperty.call(FOLDER_BY_KIND, kind)) {
    return NextResponse.json({ error: "Tipo de archivo no valido." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `companies/${authContext.companyId}/incidents/${FOLDER_BY_KIND[kind]}`;
  const paramsToSign = {
    folder,
    timestamp: String(timestamp),
  };
  const signature = signCloudinaryParams(paramsToSign, env.apiSecret);

  return NextResponse.json(
    {
      cloudName: env.cloudName,
      apiKey: env.apiKey,
      timestamp,
      folder,
      signature,
    },
    { status: 200 }
  );
}
