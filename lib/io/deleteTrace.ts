export async function deleteTrace(_id: string): Promise<string> {
    return fetch(`/api/deleteTrace?id=${_id}`)
        .then(r => r.text());
}
