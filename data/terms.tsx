import type { ComponentType, ComponentPropsWithoutRef } from "react";

type ComponentsProps = {
  h2?: ComponentType<ComponentPropsWithoutRef<"h2">> | string;
  h3?: ComponentType<ComponentPropsWithoutRef<"h3">> | string;
  p?: ComponentType<ComponentPropsWithoutRef<"p">> | string;
};

export const metadata = {
  lastUpdated: "June 13, 2026",
};

export default function Terms({ components }: { components?: ComponentsProps }) {
  const H2 = (components?.h2 || "h2") as ComponentType<ComponentPropsWithoutRef<"h2">> | string;
  const P = (components?.p || "p") as ComponentType<ComponentPropsWithoutRef<"p">> | string;

  return (
    <>
      <P>
        Welcome to PolaroidKu. By using our service, you agree to these Terms of Service.
      </P>

      <H2>1. Description of Service</H2>
      <P>
        PolaroidKu provides an event photo sharing and guestbook platform.
      </P>

      <H2>2. User Responsibilities</H2>
      <P>
        You are responsible for all activity under your account and for the content (including photos) uploaded to your events.
      </P>

      <H2>3. Content Ownership and Licenses</H2>
      <P>
        You retain ownership of your photos. By uploading, you grant us a license to host and display the content as necessary to provide the service.
      </P>

      <H2>4. Termination</H2>
      <P>
        We reserve the right to terminate or suspend your account or event access for violations of these terms.
      </P>
    </>
  );
}
