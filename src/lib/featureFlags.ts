export const featureFlags = {
  experimentalToolbox: import.meta.env.VITE_EXPERIMENTAL_TOOLBOX === 'true',
} as const;