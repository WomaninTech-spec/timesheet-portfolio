export const Category = {
  MATURATION: 'MATURATION',
  BUILD: 'BUILD',
};

/**
 * Buckets a Jira issue type into a reporting category.
 *
 * Rules (mirrors the production categorization logic):
 *   - Epic, Spike, or any type name containing "opportunit" -> Maturation
 *   - Story, Subtask / Sub-task, Improvement                -> Build
 *   - Anything else                                          -> ignored (null)
 *
 * @param {string | undefined} issueTypeName
 * @returns {'MATURATION' | 'BUILD' | null}
 */
export function getCategory(issueTypeName) {
  const name = (issueTypeName ?? '').toLowerCase().trim();

  if (name === 'epic' || name === 'spike' || name.includes('opportunit')) {
    return Category.MATURATION;
  }

  if (
    name === 'story' ||
    name === 'subtask' ||
    name === 'sub-task' ||
    name === 'improvement'
  ) {
    return Category.BUILD;
  }

  return null;
}
