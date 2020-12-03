export async function uploadGpx(file: File) {
    const filename = encodeURIComponent(file.name);
    const res = await fetch(`/api/getUploadUrl?file=${filename}`);
    const {url, fields: requiredFields} = await res.json();
    const formData = new FormData();

    console.log(`uploading file ${file.name} using url ${url}`, {requiredFields})
    Object.entries(requiredFields).forEach(([key, value]) => {
        formData.append(key, value as string);
    });
    formData.append('file', file)

    const upload = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (upload.ok) {
        console.log('Uploaded successfully!');
    } else {
        console.error('Upload failed.');
    }
}