/**
 * Restrict API access to the user's organization.
 *
 * - superadmin: no checks
 * - everyone else: query.organization_id is required
 * - everyone else: query.organization_id must match user.organization_id
 *   (throw new Error('Unauthorized Access') if not)
 */

import { UserContext } from '../types';

export function enforceOrgScope(
  user?: UserContext,
  query?: Record<string, unknown>
): void {
  if (!user) return;

  // Skip organization checks for superadmin users
  if (user.role === 'superadmin') return;

  const targetQuery = query || {};

  // Check if organization_id is missing from query
  if (!targetQuery.organization_id) {
    throw new Error('Organization ID is required');
  }

  // Check for organization_id mismatch
  if (targetQuery.organization_id !== user.organization_id) {
    throw new Error('Unauthorized Access');
  }
}
