export const addPathAliasesToSWC = (
  config: any,
  baseDir: string,
  paths: Record<string, string[]>
) => {
  config.jsc.baseUrl = baseDir;
  config.jsc.paths = paths;
};
