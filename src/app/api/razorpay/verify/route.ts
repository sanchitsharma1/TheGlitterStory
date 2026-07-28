/**
 * Legacy path - delegates to /api/verify-payment logic.
 * Prefer POST /api/verify-payment for new clients.
 */
export { POST } from "@/app/api/verify-payment/route";
