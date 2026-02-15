/**
 * Sanitizes a tenant ID by removing any query parameters that may have been appended
 * @param tenantId - The raw tenant ID from URL parameters
 * @returns The clean UUID without query parameters
 */
export function sanitizeTenantId(tenantId: string | undefined): string | undefined {
  if (!tenantId) return undefined

  // Split on '?' to remove any query parameters like __v0_token
  const cleanId = tenantId.split("?")[0]

  return cleanId
}
