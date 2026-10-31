import React from "react";
import type { CvTiptapDocument, CvTiptapNode, CvTiptapMark } from "@/types/cv";
import { cn } from "@/lib/utils";
import { extractTiptapPlainText } from "@/features/cv-builder/utils/tiptapJson";

interface CvTiptapReadOnlyViewProps {
  document?: CvTiptapDocument | null;
  placeholder?: string;
  className?: string;
}

function renderMarks(text: string, marks?: CvTiptapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<React.ReactNode>((acc, mark, index) => {
    switch (mark.type) {
      case "bold":
        return <strong key={index}>{acc}</strong>;
      case "italic":
        return <em key={index}>{acc}</em>;
      case "underline":
        return <u key={index}>{acc}</u>;
      case "link": {
        const href = (mark.attrs?.href as string) || "#";
        const target = (mark.attrs?.target as string) || "_blank";
        return (
          <a
            key={index}
            href={href}
            target={target}
            rel="noopener noreferrer"
            className="text-primary underline hover:opacity-80"
          >
            {acc}
          </a>
        );
      }
      case "textStyle": {
        const style: React.CSSProperties = {};
        if (mark.attrs?.color) {
          style.color = String(mark.attrs.color);
        }
        if (mark.attrs?.fontFamily) {
          style.fontFamily = String(mark.attrs.fontFamily);
        }
        if (mark.attrs?.fontWeight) {
          style.fontWeight = String(mark.attrs.fontWeight) as React.CSSProperties["fontWeight"];
        }
        if (mark.attrs?.fontSize) {
          const rawSize = String(mark.attrs.fontSize).trim();
          const sizeVal = /^[0-9.]+$/.test(rawSize) ? `${rawSize}px` : rawSize;
          style.fontSize = `calc(${sizeVal} * var(--cv-font-scale, 1))`;
        }
        return (
          <span key={index} style={style}>
            {acc}
          </span>
        );
      }
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: CvTiptapNode, index: number): React.ReactNode {
  switch (node.type) {
    case "paragraph": {
      const textAlign = node.attrs?.textAlign as React.CSSProperties["textAlign"];
      const children = node.content?.map(renderNode);
      const isEmpty = !children || children.length === 0;

      return (
        <p
          key={index}
          className="min-h-[1.2em] leading-normal"
          style={textAlign ? { textAlign } : undefined}
        >
          {isEmpty ? "\u00A0" : children}
        </p>
      );
    }
    case "bulletList": {
      const listStyleType = (node.attrs?.listStyleType as string) || undefined;
      return (
        <ul
          key={index}
          className="my-1 list-disc pl-5"
          style={listStyleType ? { listStyleType } : undefined}
        >
          {node.content?.map(renderNode)}
        </ul>
      );
    }
    case "orderedList":
      return (
        <ol key={index} className="my-1 list-decimal pl-5">
          {node.content?.map(renderNode)}
        </ol>
      );
    case "listItem":
      return (
        <li key={index} className="my-0.5">
          {node.content?.map(renderNode)}
        </li>
      );
    case "text":
      return renderMarks(node.text ?? "", node.marks);
    default:
      if (node.content && node.content.length > 0) {
        return <div key={index}>{node.content.map(renderNode)}</div>;
      }
      return null;
  }
}

export const CvTiptapReadOnlyView: React.FC<CvTiptapReadOnlyViewProps> = ({
  document,
  placeholder,
  className,
}) => {
  if (!document || !document.content || document.content.length === 0) {
    if (placeholder) {
      return (
        <span className={cn("text-slate-400 italic select-none", className)}>
          {placeholder}
        </span>
      );
    }
    return null;
  }

  const plainText = extractTiptapPlainText(document).trim();
  if (!plainText && placeholder) {
    return (
      <span className={cn("text-slate-400 italic select-none", className)}>
        {placeholder}
      </span>
    );
  }

  return (
    <div className={cn("cv-tiptap-content w-full", className)}>
      {document.content.map(renderNode)}
    </div>
  );
};

export default CvTiptapReadOnlyView;
