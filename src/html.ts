import htmlTemplateTag from "html-template-tag";

export function html(literals: TemplateStringsArray, ...substs: Array<string | string[]>): string {
    return htmlTemplateTag(literals, ...substs)
}