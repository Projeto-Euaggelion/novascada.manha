const PAGINATION_SIBLING_COUNT = 1;
export const DOTS = "dots" as const;

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function getPaginationRange(currentPage: number, totalPages: number) {
  const totalVisiblePages = PAGINATION_SIBLING_COUNT * 2 + 5;

  if (totalVisiblePages >= totalPages) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - PAGINATION_SIBLING_COUNT, 1);
  const rightSiblingIndex = Math.min(currentPage + PAGINATION_SIBLING_COUNT, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftRange = range(1, 3 + PAGINATION_SIBLING_COUNT * 2);
    return [...leftRange, DOTS, totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightRange = range(totalPages - (3 + PAGINATION_SIBLING_COUNT * 2) + 1, totalPages);
    return [1, DOTS, ...rightRange];
  }

  return [1, DOTS, ...range(leftSiblingIndex, rightSiblingIndex), DOTS, totalPages];
}
