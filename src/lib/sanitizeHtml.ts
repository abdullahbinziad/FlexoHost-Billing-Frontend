import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML to prevent XSS when rendering user-generated content.
 * Use before dangerouslySetInnerHTML with ticket messages, descriptions, etc.
 * Includes img + headings so TipTap ticket replies render embedded images and formatting.
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty || typeof dirty !== "string") return "";
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            "b",
            "i",
            "em",
            "strong",
            "u",
            "s",
            "a",
            "p",
            "br",
            "ul",
            "ol",
            "li",
            "blockquote",
            "code",
            "pre",
            "h1",
            "h2",
            "h3",
            "h4",
            "img",
            "span",
            "div",
        ],
        ALLOWED_ATTR: [
            "href",
            "target",
            "rel",
            "class",
            "src",
            "alt",
            "title",
            "width",
            "height",
            "loading",
        ],
    });
}
