declare module "mdx/types" {
  import type { ComponentType } from "react";
  export type MDXComponents = Record<string, ComponentType<any>>;
}

declare module "*.mdx" {
  import type { ComponentType } from "react";
  const component: ComponentType<any>;
  export const metadata: any;
  export default component;
}
