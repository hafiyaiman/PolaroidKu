import type { ComponentType } from "react";

// Fallback interface matching MDXComponents structure
type ComponentsProps = {
  h2?: ComponentType<any> | string;
  h3?: ComponentType<any> | string;
  p?: ComponentType<any> | string;
  ul?: ComponentType<any> | string;
  li?: ComponentType<any> | string;
  strong?: ComponentType<any> | string;
};

export const metadata = {
  lastUpdated: "June 13, 2026",
};

export default function Privacy({ components }: { components?: ComponentsProps }) {
  const H2 = (components?.h2 || "h2") as any;
  const P = (components?.p || "p") as any;
  const Ul = (components?.ul || "ul") as any;
  const Li = (components?.li || "li") as any;
  const Strong = (components?.strong || "strong") as any;

  return (
    <>
      <P>
        We value your privacy. This Privacy Policy describes how we collect, use, and process your personal data when you use PolaroidKu.
      </P>

      <H2>1. Information We Collect</H2>
      <Ul>
        <Li>
          <Strong>Account Information:</Strong> Your name, email address, profile photo, and phone number when you register.
        </Li>
        <Li>
          <Strong>Content:</Strong> Photos uploaded to your events by you or your guests.
        </Li>
        <Li>
          <Strong>Log Data:</Strong> Technical information such as your IP address, browser type, and usage statistics.
        </Li>
      </Ul>

      <H2>2. How We Use Information</H2>
      <P>
        We use your information to operate, maintain, and provide the features of PolaroidKu, including event creation, photo hosting, and sharing.
      </P>

      <H2>3. Data Storage and Security</H2>
      <P>
        We use Cloudflare R2 and secure databases to store your photos and information. We implement standard security measures to protect your data.
      </P>
    </>
  );
}
