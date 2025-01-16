import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export default function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to MTN Store</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to MTN Store!</Heading>
          <Text style={text}>
            Hi {name},
          </Text>
          <Text style={text}>
            Thank you for creating an account with MTN Store. We&apos;re excited to
            have you join our community!
          </Text>

          <Section style={features}>
            <Text style={featureTitle}>What you can do with your account:</Text>
            <Text style={featureItem}>• Track your orders in real-time</Text>
            <Text style={featureItem}>• View your order history</Text>
            <Text style={featureItem}>• Save your favorite products</Text>
            <Text style={featureItem}>• Get exclusive offers and updates</Text>
          </Section>

          <Section style={ctaContainer}>
            <Link href={loginUrl} style={button}>
              Start Shopping
            </Link>
          </Section>

          <Text style={footer}>
            If you have any questions or need assistance, our customer service
            team is always here to help.
          </Text>

          <Text style={signature}>
            Best regards,
            <br />
            The MTN Store Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px",
};

const features = {
  margin: "30px 0",
  padding: "20px",
  backgroundColor: "#f9fafb",
  borderRadius: "4px",
};

const featureTitle = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 15px",
};

const featureItem = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 10px",
};

const ctaContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#fcd34d",
  borderRadius: "4px",
  color: "#1a1a1a",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "30px 0 0",
  textAlign: "center" as const,
};

const signature = {
  color: "#4a4a4a",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "20px 0 0",
  textAlign: "center" as const,
};
