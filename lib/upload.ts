export async function uploadGpx(file: File) {
    const filename = encodeURIComponent(file.name);
    return uploadGpxText(filename, file);
}

export async function uploadGpxText(fileName: string, fileContent: string | File) {
    const filename = encodeURIComponent(fileName);
    const res = await fetch(`/api/getUploadUrl?file=${filename}`);
    const {url, fields: requiredFields} = await res.json();
    const formData = new FormData();

    console.log(`uploading file ${fileName} using url ${url}`, {requiredFields})
    Object.entries(requiredFields).forEach(([key, value]) => {
        formData.append(key, value as string);
    });
    formData.append('file', fileContent)

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