import Terms, { metadata } from "@/data/terms";
import LegalLayout from "@/components/legal-layout";
import { legalMdxComponents } from "../_components/legal-mdx";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated={metadata.lastUpdated}>
      <Terms components={legalMdxComponents} />
    </LegalLayout>
  );
}
