/**
 * NCALayer Client Adapter
 * Official protocol integration via WebSocket (port 13579)
 * Specification: National Certification Authority of the Republic of Kazakhstan (NCA RK / НУЦ РК)
 */

export interface NCALayerCertificateInfo {
  ownerName: string;
  iin?: string;
  bin?: string;
  organizationName?: string;
  subjectType: "INDIVIDUAL" | "LEGAL_ENTITY";
  algorithm: string;
  keyFingerprint: string;
  serialNumber?: string;
  issuer: string;
  notBefore: Date;
  notAfter: Date;
  rawPem?: string;
}

export interface NCALayerCheckResult {
  isAvailable: boolean;
  version?: string;
  error?: string;
  protocol?: "wss" | "ws";
}

export interface NCALayerSignatureResult {
  signature: string;
  certificate: NCALayerCertificateInfo;
  cmsBase64?: string;
}

const NCALAYER_URLS = [
  "wss://127.0.0.1:13579/",
  "ws://127.0.0.1:13579/",
];

/**
 * Check if NCALayer is running and responsive on local machine
 */
export async function checkNCALayerAvailability(timeoutMs = 2500): Promise<NCALayerCheckResult> {
  if (typeof window === "undefined") {
    return { isAvailable: false, error: "NCALayer is a client-side OS service" };
  }

  for (const url of NCALAYER_URLS) {
    try {
      const result = await new Promise<NCALayerCheckResult>((resolve) => {
        let isDone = false;
        const timer = setTimeout(() => {
          if (!isDone) {
            isDone = true;
            try { ws.close(); } catch { /* ignore */ }
            resolve({ isAvailable: false, error: "Connection timeout to " + url });
          }
        }, timeoutMs);

        let ws: WebSocket;
        try {
          ws = new WebSocket(url);
        } catch (e: unknown) {
          clearTimeout(timer);
          isDone = true;
          resolve({ isAvailable: false, error: e instanceof Error ? e.message : "WebSocket error" });
          return;
        }

        ws.onopen = () => {
          if (!isDone) {
            isDone = true;
            clearTimeout(timer);
            try { ws.close(); } catch { /* ignore */ }
            resolve({
              isAvailable: true,
              protocol: url.startsWith("wss") ? "wss" : "ws",
            });
          }
        };

        ws.onerror = () => {
          if (!isDone) {
            isDone = true;
            clearTimeout(timer);
            try { ws.close(); } catch { /* ignore */ }
            resolve({ isAvailable: false, error: "Connection refused on " + url });
          }
        };
      });

      if (result.isAvailable) {
        return result;
      }
    } catch {
      // Continue to next protocol
    }
  }

  return {
    isAvailable: false,
    error: "NCALayer не запущен на локальном компьютере (порт 13579 недоступен)",
  };
}

/**
 * Helper to execute a JSON-RPC request to NCALayer
 */
export async function sendNCALayerRequest<T = any>(
  module: string,
  method: string,
  args: any[] = [],
  timeoutMs = 60000
): Promise<T> {
  const availability = await checkNCALayerAvailability(2000);
  if (!availability.isAvailable || !availability.protocol) {
    throw new Error(
      "NCALayer недоступен. Убедитесь, что приложение NCALayer установлено и запущено на вашем компьютере (pki.gov.kz)."
    );
  }

  const url = `${availability.protocol}://127.0.0.1:13579/`;

  return new Promise<T>((resolve, reject) => {
    let ws: WebSocket;
    let timer: NodeJS.Timeout;

    try {
      ws = new WebSocket(url);
    } catch (err: unknown) {
      reject(new Error("Не удалось подключиться к NCALayer: " + (err instanceof Error ? err.message : String(err))));
      return;
    }

    timer = setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error("Превышено время ожидания ответа от пользователя в NCALayer"));
    }, timeoutMs);

    ws.onopen = () => {
      const requestPayload = {
        module,
        method,
        args,
      };
      ws.send(JSON.stringify(requestPayload));
    };

    ws.onmessage = (event) => {
      clearTimeout(timer);
      try { ws.close(); } catch {}

      try {
        const data = JSON.parse(event.data);
        const isSuccess =
          data.code === "200" ||
          data.code === 200 ||
          data.status === true ||
          data.status === "true" ||
          (data.responseObject !== undefined && data.responseObject !== null && !data.error) ||
          (data.result !== undefined && data.result !== "cancelled" && data.result !== false);

        if (isSuccess) {
          resolve(data.responseObject ?? data.result ?? data);
        } else if (
          data.code === "USER_CANCELLED" ||
          data.result === "cancelled" ||
          data.message === "action canceled" ||
          data.message === "canceled" ||
          data.message === "action cancelled" ||
          data.message === "отменено"
        ) {
          reject(new Error("Операция отменена пользователем в NCALayer"));
        } else {
          const errMsg =
            data.message ||
            data.error ||
            (data.code && data.code !== "undefined"
              ? `Ошибка NCALayer (код ${data.code})`
              : "Действие в NCALayer было отменено или не завершено");
          reject(new Error(errMsg));
        }
      } catch (e: unknown) {
        reject(new Error("Некорректный формат ответа NCALayer: " + (e instanceof Error ? e.message : String(e))));
      }
    };

    ws.onerror = (err) => {
      clearTimeout(timer);
      try { ws.close(); } catch {}
      reject(new Error("Ошибка взаимодействия с NCALayer по WebSocket"));
    };
  });
}

/**
 * Parse subject DN string into structured certificate attributes
 * e.g. "CN=ИВАНОВ ИВАН ИВАНОВИЧ, SERIALNUMBER=IIN123456789012, OU=BIN987654321012, O=ТОО ТЕСТ, C=KZ"
 */
export function parseSubjectDn(subjectDn: string): {
  ownerName: string;
  iin?: string;
  bin?: string;
  organizationName?: string;
  subjectType: "INDIVIDUAL" | "LEGAL_ENTITY";
} {
  const parts = subjectDn.split(/,\s*/);
  let cn = "";
  let iin = "";
  let bin = "";
  let org = "";

  for (const part of parts) {
    const [rawKey, ...valParts] = part.split("=");
    if (!rawKey) continue;
    const key = rawKey.trim().toUpperCase();
    const val = valParts.join("=").trim();

    if (key === "CN") {
      cn = val;
    } else if (key === "SERIALNUMBER" || key === "IIN") {
      iin = val.replace(/^IIN/i, "").trim();
    } else if (key === "OU" && /^(BIN|БИН)/i.test(val)) {
      bin = val.replace(/^(BIN|БИН)/i, "").trim();
    } else if (key === "BIN") {
      bin = val.trim();
    } else if (key === "O") {
      org = val;
    }
  }

  const isLegalEntity = Boolean(bin || org);

  return {
    ownerName: cn || "Владелец сертификата",
    iin: iin || undefined,
    bin: bin || undefined,
    organizationName: org || undefined,
    subjectType: isLegalEntity ? "LEGAL_ENTITY" : "INDIVIDUAL",
  };
}

/**
 * Load Key Info from NCALayer (User chooses certificate via OS dialog)
 */
export async function getNCALayerKeyInfo(storageType = "PKCS12"): Promise<NCALayerCertificateInfo> {
  const resp = await sendNCALayerRequest<any>(
    "kz.gov.pki.knca.commonUtils",
    "getKeyInfo",
    [storageType]
  );

  const subjectDn = typeof resp === "string" ? resp : resp.subjectDn || resp.subject || "";
  const parsed = parseSubjectDn(subjectDn);

  const serial = resp.serialNumber || resp.serial || "";
  const fingerprint = (resp.keyFingerprint || resp.fingerprint || serial || Math.random().toString(36).substring(2))
    .replace(/:/g, "")
    .toUpperCase();

  return {
    ownerName: parsed.ownerName,
    iin: parsed.iin,
    bin: parsed.bin,
    organizationName: parsed.organizationName,
    subjectType: parsed.subjectType,
    algorithm: resp.algorithm || "GOST R 34.10-2015",
    keyFingerprint: fingerprint,
    serialNumber: serial,
    issuer: resp.issuerDn || "Национальный удостоверяющий центр Республики Казахстан (НУЦ РК)",
    notBefore: resp.notBefore ? new Date(resp.notBefore) : new Date(),
    notAfter: resp.notAfter ? new Date(resp.notAfter) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
    rawPem: resp.pem || undefined,
  };
}

/**
 * Create CMS/PKCS#7 Digital Signature for raw data / base64 via NCALayer
 */
export async function signDataWithNCALayer(
  dataBase64: string,
  storageType = "PKCS12",
  keyType = "",
  flag = false,
  existingCert?: NCALayerCertificateInfo
): Promise<NCALayerSignatureResult> {
  const resp = await sendNCALayerRequest<any>(
    "kz.gov.pki.knca.commonUtils",
    "createCMSSignatureFromBase64",
    [storageType, keyType || "SIGNATURE", dataBase64, flag]
  ).catch(async (err) => {
    // If keyType "SIGNATURE" failed or was rejected, retry with empty keyType
    if (keyType !== "") {
      return sendNCALayerRequest<any>(
        "kz.gov.pki.knca.commonUtils",
        "createCMSSignatureFromBase64",
        [storageType, "", dataBase64, flag]
      );
    }
    throw err;
  });

  const cmsSignature = typeof resp === "string" ? resp : resp.cms || resp.signature || resp.responseObject;

  const certInfo =
    existingCert ||
    ({
      ownerName: "Владелец ЭЦП НУЦ РК",
      subjectType: "INDIVIDUAL" as const,
      algorithm: "GOST R 34.10-2015",
      keyFingerprint: "NCALAYER-CMS-" + Date.now().toString(16).toUpperCase(),
      issuer: "НУЦ РК",
      notBefore: new Date(),
      notAfter: new Date(Date.now() + 365 * 24 * 3600 * 1000),
    });

  return {
    signature: cmsSignature,
    certificate: certInfo,
    cmsBase64: cmsSignature,
  };
}
