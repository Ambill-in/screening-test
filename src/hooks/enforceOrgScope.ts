/**
 * Restrict API access to the user's organization.
 */

import { UserContext } from '../types';

export function enforceOrgScope(
  user: UserContext,
  query: Record<string, unknown>
): void {
  if (user.role === 'superadmin') {
    return;
  }

  const orgId = query.organization_id;
  if (orgId == null || orgId === '') {
    throw new Error('Organization ID is required');
  }
  if (orgId !== user.organization_id) {
    throw new Error('Unauthorized Access');
  }
}
