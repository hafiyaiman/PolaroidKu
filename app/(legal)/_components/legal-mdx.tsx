import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { Separator } from "@/components/ui/separator";

function Table({ children }: { children?: ReactNode }) {
  return (
    <div className="my-6 w-full overflow-hidden border border-border/70 bg-card">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[42rem] border-separate border-spacing-0 text-sm [&_tbody_td:first-child]:font-semibold [&_tbody_td:first-child]:text-foreground">
          {children}
        </table>
      </div>
    </div>
  );
}

function TableCaption({ children }: { children?: ReactNode }) {
  return (
    <caption className="caption-bottom px-4 py-3 text-left text-xs leading-5 text-muted-foreground">
      {children}
    </caption>
  );
}

function TableColGroup({ children }: { children?: ReactNode }) {
  return <colgroup>{children}</colgroup>;
}

function TableHead({ children }: { children?: ReactNode }) {
  return (
    <thead className="bg-primary/10 text-foreground [box-shadow:inset_0_-1px_0_hsl(var(--border))]">
      {children}
    </thead>
  );
}

function TableBody({ children }: { children?: ReactNode }) {
  return (
    <tbody className="[&>tr:nth-child(even)]:bg-muted/20 [&>tr:hover]:bg-primary/5">
      {children}
    </tbody>
  );
}

function TableRow({ children }: { children?: ReactNode }) {
  return (
    <tr className="transition-colors [box-shadow:inset_0_-1px_0_hsl(var(--border))]">
      {children}
    </tr>
  );
}

function TableHeaderCell({ children }: { children?: ReactNode }) {
  return (
    <th className="sticky top-0 whitespace-nowrap border-r border-border/70 bg-primary/10 px-4 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground last:border-r-0">
      {children}
    </th>
  );
}

function TableCell({ children }: { children?: ReactNode }) {
  return (
    <td className="align-top border-r border-border/60 px-4 py-3 text-sm leading-6 text-muted-foreground last:border-r-0">
      {children}
    </td>
  );
}

export const legalMdxComponents: MDXComponents = {
  h2: ({ children }: ComponentPropsWithoutRef<"h2">) => (
    <div className="mt-8 mb-4">
      <div
        className="flex items-center gap-3 px-3 py-2 text-primary-foreground text-sm font-semibold"
        style={{ background: "var(--gradient-primary)" }}
      >
        {children}
      </div>
    </div>
  ),
  h3: ({ children }: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-5 mb-1.5 text-sm font-bold text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }: ComponentPropsWithoutRef<"p">) => <p className="mb-3 text-sm leading-7">{children}</p>,
  ul: ({ children }: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-2 space-y-1 list-none pl-0">{children}</ul>
  ),
  li: ({ children }: ComponentPropsWithoutRef<"li">) => (
    <li className="flex gap-2.5 text-sm leading-7 pl-4">
      <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  a: ({ href, children }: ComponentPropsWithoutRef<"a">) => (
    <a
      href={href}
      className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  ),
  hr: () => <Separator className="my-6" />,
  caption: TableCaption,
  colgroup: TableColGroup,
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: TableHeaderCell,
  td: TableCell,
  Table,
  TableCaption,
  TableColGroup,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
};
