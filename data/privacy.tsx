import type { ComponentType, ComponentPropsWithoutRef } from "react";

// Fallback interface matching MDXComponents structure
type ComponentsProps = {
  h2?: ComponentType<ComponentPropsWithoutRef<"h2">> | string;
  h3?: ComponentType<ComponentPropsWithoutRef<"h3">> | string;
  p?: ComponentType<ComponentPropsWithoutRef<"p">> | string;
  ul?: ComponentType<ComponentPropsWithoutRef<"ul">> | string;
  li?: ComponentType<ComponentPropsWithoutRef<"li">> | string;
  strong?: ComponentType<ComponentPropsWithoutRef<"strong">> | string;
};

export const metadata = {
  lastUpdated: "June 13, 2026",
};

export default function Privacy({ components }: { components?: ComponentsProps }) {
  const H2 = (components?.h2 || "h2") as ComponentType<ComponentPropsWithoutRef<"h2">> | string;
  const P = (components?.p || "p") as ComponentType<ComponentPropsWithoutRef<"p">> | string;
  const Ul = (components?.ul || "ul") as ComponentType<ComponentPropsWithoutRef<"ul">> | string;
  const Li = (components?.li || "li") as ComponentType<ComponentPropsWithoutRef<"li">> | string;
  const Strong = (components?.strong || "strong") as ComponentType<ComponentPropsWithoutRef<"strong">> | string;

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
