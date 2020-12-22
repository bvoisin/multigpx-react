export async function reduceGpx(gpxFile: File): Promise<Document> {
    const xsltText = await (await fetch(`gpx/reduceGpx.xslt`)).text();

    const xslt = new DOMParser().parseFromString(xsltText, 'text/xml');

    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslt)


    const gpxText = await gpxFile.text();
    const gpx = new DOMParser().parseFromString(gpxText, 'text/xml');

    return xsltProcessor.transformToDocument(gpx);
}
