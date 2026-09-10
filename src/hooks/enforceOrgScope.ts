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
  user: UserContext,
  query: Record<string, unknown>
): void {
  // Superadmins bypass all checks
  if (user.role === 'superadmin') {
    return;
  }

  // Non-superadmin must provide organization_id
  if (!query.organization_id) {
    throw new Error('Organization ID is required'); 
  }

  // Query organization_id must match user's organization_id
  if (query.organization_id !== user.organization_id) {
    throw new Error('Unauthorized Access');
  }
}