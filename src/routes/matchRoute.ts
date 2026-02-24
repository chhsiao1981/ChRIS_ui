import { matchPath } from "react-router";

export const routeToSideBar = (
  path: string,
  routeToSideBarMap: Record<string, string>,
) => {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  // Exact match first
  if (routeToSideBarMap[normalizedPath]) {
    return routeToSideBarMap[normalizedPath];
  }

  // Wildcard match
  for (const routePath of Object.keys(routeToSideBarMap)) {
    if (matchPath({ path: routePath, end: true }, path)) {
      return routeToSideBarMap[routePath];
    }
  }

  // Default to notFound if no match
  return routeToSideBarMap["*"];
};
