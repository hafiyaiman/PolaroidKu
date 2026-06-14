declare module "mdx/types" {
  import type { ComponentType } from "react";
  export type MDXComponents = Record<string, ComponentType>;
}

declare module "*.mdx" {
  import type { ComponentType } from "react";
  const component: ComponentType;
  export const metadata: Record<string, string | number | boolean | null | undefined>;
  export default component;
}
