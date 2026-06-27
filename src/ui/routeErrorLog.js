/**
 * Log a route render error for debugging.
 * @param {Error} error
 * @param {import('react').ErrorInfo} errorInfo
 */
export function logRouteRenderError(error, errorInfo) {
  console.error('[RouteErrorBoundary]', error, errorInfo.componentStack);
}
