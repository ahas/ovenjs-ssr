export function findDependencies(modules: string[], manifest: Record<string, string[]>) {
    const files = new Set();

    for (const id of modules || []) {
        for (const file of manifest[id] || []) {
            files.add(file);
        }
    }

    return [...files];
}

export function renderPreloadLinks(files: string[]) {
    let link = "";

    for (const file of files || []) {
        if (file.endsWith(".js")) {
            link += `<link rel="modulepreload" crossorigin href="${file}">`;
        } else if (file.endsWith(".css")) {
            link += `<link rel="stylesheet" href="${file}">`;
        }
    }

    return link;
}

type DocParts = {
    htmlAttrs?: string;
    bodyAttrs?: string;
    headTags?: string;
    body?: string;
    initialState?: string;
};

export function buildHtmlDocument(template: string, { htmlAttrs, bodyAttrs, headTags, body, initialState }: DocParts) {
    return template
        .replace("<html", `<html ${htmlAttrs} `)
        .replace("<body", `<body ${bodyAttrs} `)
        .replace("</head>", `${headTags}\n</head>`)
        .replace(
            /<div id="app"([\s\w\-"'=[\]]*)><\/div>/,
            `<div id="app" data-server-rendered="true"$1>${body}</div>\n\n  <script>window.__INITIAL_STATE__=${
                initialState || "'{}'"
            }</script>`,
        );
}
