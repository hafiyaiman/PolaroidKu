"use client";

import * as React from "react";

interface PageTitleContextValue {
  title: string | null;
  setTitle: (title: string | null) => void;
}

const PageTitleContext = React.createContext<PageTitleContextValue>({
  title: null,
  setTitle: () => {},
});

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = React.useState<string | null>(null);
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

/** Call this inside a page to override the last breadcrumb segment label. */
export function usePageTitle(title: string | null) {
  const { setTitle } = React.useContext(PageTitleContext);
  React.useEffect(() => {
    setTitle(title);
    return () => setTitle(null); // reset on unmount
  }, [title, setTitle]);
}

/** Read the current page title (used by the header). */
export function useCurrentPageTitle() {
  return React.useContext(PageTitleContext).title;
}
