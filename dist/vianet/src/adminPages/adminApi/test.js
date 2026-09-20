export function getTestApi({ then, catch: onError, finally: onFinally }) {
    return fetch("/api/admin/test")
        .then((res) => {
        if (!res.ok) {
            const text = res.statusText;
            throw new Error(`API error ${res.status}: ${text}`);
        }
        return res.json();
    })
        .then(then)
        .catch(onError)
        .finally(onFinally);
}
