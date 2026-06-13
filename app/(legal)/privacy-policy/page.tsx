import Privacy, { metadata } from "@/data/privacy";
import { legalMdxComponents } from "../_components/legal-mdx";
import LegalLayout from "@/components/legal-layout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={metadata.lastUpdated}>
      <Privacy components={legalMdxComponents} />
    </LegalLayout>
  );
}
