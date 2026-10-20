import { AppError } from "./http";
// Exact route shapes stop ignored suffixes and unsupported methods before DB/auth work.
const content =
  "(?:products|collections|journal|pages|videos|site-config|email-templates|locations)";
export const apiRoutes: [RegExp, string][] = [
  [/^health\/(?:live|ready)$/, "GET"],
  [/^csrf$/, "GET"],
  [/^webhooks\/razorpay$/, "POST"],
  [/^auth\/dev-(?:login|stepup)$/, "POST"],
  [/^auth\/(?:google|apple)$/, "POST"],
  [/^auth\/(?:google|apple)\/link$/, "POST"],
  [/^auth\/google\/callback$/, "GET"],
  [/^auth\/apple\/callback$/, "POST"],
  [/^me$/, "GET"],
  [/^me\/consultations$/, "GET"],
  [/^logout$/, "POST"],
  [/^account\/unlink$/, "POST"],
  [/^mfa\/(?:register|verify)\/(?:options|verify)$/, "POST"],
  [/^media$/, "POST"],
  [/^media\/[^/]+$/, "GET"],
  [
    /^(?:consultation-requests|contact-inquiries|staff-invitations|video-events)$/,
    "POST",
  ],
  [/^cart$/, "GET DELETE"],
  [/^cart\/merge$/, "POST"],
  [/^cart\/items\/[^/]+$/, "POST PUT DELETE"],
  [/^variants\/[^/]+$/, "GET"],
  [/^purchase-intents$/, "POST"],
  [/^purchase-intents\/[^/]+\/resume$/, "POST"],
  [/^checkout-sessions\/[^/]+$/, "GET PATCH"],
  [
    /^checkout-sessions\/[^/]+\/(?:quote|payment-attempts|confirm-payment)$/,
    "POST",
  ],
  [/^checkout-sessions\/[^/]+\/payment-status$/, "GET POST"],
  [/^me\/(?:profile|preferences)$/, "GET PATCH"],
  [/^me\/verify-contact$/, "POST"],
  [/^me\/addresses$/, "GET POST"],
  [/^me\/addresses\/[^/]+$/, "PATCH DELETE"],
  [/^me\/default-addresses$/, "PUT"],
  [/^me\/sessions$/, "GET"],
  [/^me\/sessions\/[^/]+$/, "DELETE"],
  [/^me\/sign-out-all$/, "POST"],
  [/^me\/orders(?:\/[^/]+)?$/, "GET"],
  [/^me\/privacy-requests$/, "GET POST"],
  [/^me\/consents$/, "GET"],
  [/^saved-rituals$/, "GET POST DELETE"],
  [/^search$/, "GET"],
  [/^admin\/commerce$/, "GET"],
  [/^admin\/commerce\/(?:settings|variants)$/, "PATCH"],
  [/^admin\/customer-requests$/, "GET"],
  [/^admin\/customer-requests\/[^/]+$/, "PATCH"],
  [/^admin\/redirects$/, "GET POST"],
  [/^admin\/(?:integrations|jobs)$/, "GET"],
  [new RegExp(`^admin/${content}$`), "GET POST"],
  [new RegExp(`^admin/${content}/[^/]+$`), "GET"],
  [
    new RegExp(
      `^admin/${content}/[^/]+/(?:revisions|publish|unpublish|rollback|preview-links|schedule)$`,
    ),
    "POST",
  ],
  [/^admin\/preview-links$/, "GET"],
  [/^admin\/preview-links\/[^/]+$/, "DELETE"],
  [/^admin\/(?:consultations|inquiries)$/, "GET"],
  [/^admin\/(?:consultations|inquiries)\/[^/]+$/, "PATCH"],
  [/^admin\/consultations\/[^/]+\/notes$/, "GET"],
  [/^admin\/staff$/, "GET"],
  [/^admin\/staff\/invite$/, "POST"],
  [/^admin\/staff\/[^/]+$/, "DELETE"],
  [/^(?:products|collections|journal|videos|locations)(?:\/[^/]+)?$/, "GET"],
];
export function assertApiRoute(path: string[], method: string) {
  if (path.some((p) => !p || p.length > 200 || p.includes("/")))
    throw new AppError(404, "NOT_FOUND", "Endpoint not found");
  const matches = apiRoutes.filter(([pattern]) => pattern.test(path.join("/")));
  if (!matches.length)
    throw new AppError(404, "NOT_FOUND", "Endpoint not found");
  if (!matches.some(([, methods]) => methods.split(" ").includes(method)))
    throw new AppError(405, "METHOD", "Unsupported endpoint method");
}
export function devAuthEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_DEV_ADMIN_AUTH === "true"
  );
}
