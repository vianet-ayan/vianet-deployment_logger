interface TestApiParams {
  then: (data: { message: string; timestamp: string }) => void
  catch: (error: Error) => void
  finally: () => void
}

export function getTestApi({ then, catch: onError, finally: onFinally }: TestApiParams): Promise<void> {
  return fetch("/api/admin/test")
    .then((res) => {
      if (!res.ok) {
        const text = res.statusText
        throw new Error(`API error ${res.status}: ${text}`)
      }
      return res.json()
    })
    .then(then)
    .catch(onError)
    .finally(onFinally)
}
