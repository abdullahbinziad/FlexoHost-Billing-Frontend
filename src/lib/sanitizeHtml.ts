import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML to prevent XSS when rendering user-generated content.
 * Use before dangerouslySetInnerHTML with ticket messages, descriptions, etc.
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty || typeof dirty !== "string") return "";
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ["b", "i", "em", "strong", "u", "a", "p", "br", "ul", "ol", "li", "blockquote", "code", "pre"],
        ALLOWED_ATTR: ["href", "target", "rel"],
    });
}
