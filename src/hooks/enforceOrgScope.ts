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
  if (user.role === 'superadmin') return;
  if (!query.organization_id) throw new Error('Organization ID is required');
  if (query.organization_id !== user.organization_id) throw new Error('Unauthorized Access');
}
