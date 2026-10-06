import { brandColors as c } from "@/lib/brand-colors";

export const ACADEMY_NAME = "Kool TechFix I.T Academy";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Branded wrapper shared by every transactional email (inline styles only). */
export function emailLayout(bodyHtml: string) {
  return `<div style="font-family:Arial,sans-serif;background:${c.grayLight};padding:32px;color:${c.black}">
  <div style="max-width:560px;margin:0 auto;background:${c.white};border:1px solid ${c.gray};border-radius:10px;padding:32px">
    <p style="margin:0 0 24px;font-weight:700">${ACADEMY_NAME}</p>
    ${bodyHtml}
    <p style="margin:32px 0 0;color:${c.textMuted};font-size:13px">— The ${ACADEMY_NAME} team</p>
  </div>
</div>`;
}

/** Primary call-to-action button (green, white text). */
export function emailButton(href: string, label: string) {
  return `<p style="margin-top:24px"><a href="${escapeHtml(href)}" style="display:inline-block;background:${c.green};color:${c.white};padding:12px 18px;border-radius:6px;font-weight:700;text-decoration:none">${escapeHtml(label)}</a></p>`;
}
