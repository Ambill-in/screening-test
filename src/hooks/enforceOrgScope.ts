import { UserContext } from '../types';

export function enforceOrgScope(
  user: UserContext,
  query: Record<string, unknown>
): void {
  if (user.role === 'superadmin') {
    return;
  }

  if (query.organization_id == null || query.organization_id === '') {
    throw new Error('Organization ID is required');
  }

  if (query.organization_id !== user.organization_id) {
    throw new Error('Unauthorized Access');
  }
}