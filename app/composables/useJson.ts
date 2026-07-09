// Load a JSON manifest from /public/data, base-path + cache-bust aware.
export function useJson<T>(name: string, fallback: T) {
  const config = useRuntimeConfig()
  const base = config.app.baseURL
  const v = config.public.buildId
  return useAsyncData<T>(
    `json:${name}`,
    () => $fetch<T>(`${base}data/${name}.json?v=${v}`),
    { default: () => fallback, server: false },
  )
}
