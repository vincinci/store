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

interface OrderStatusEmailProps {
  order: any;
  orderUrl: string;
}

export default function OrderStatusEmail({
  order,
  orderUrl,
}: OrderStatusEmailProps) {
  const getStatusMessage = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "Your order is being processed and will be shipped soon.";
      case "shipped":
        return "Your order has been shipped and is on its way to you.";
      case "delivered":
        return "Your order has been delivered. We hope you enjoy your purchase!";
      case "cancelled":
        return "Your order has been cancelled. If you have any questions, please contact our customer service.";
      default:
        return "There has been an update to your order.";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Your MTN Store order status update</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Status Update</Heading>
          <Text style={text}>
            {getStatusMessage(order.orderStatus)}
          </Text>

          <Section style={orderInfo}>
            <Text style={orderNumber}>
              Order Number: #{order._id.slice(-8)}
            </Text>
            <Text style={orderStatus}>
              Status: {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </Text>
            <Text style={orderDate}>
              Last Updated: {new Date().toLocaleDateString()}
            </Text>
          </Section>

          <Section style={orderSummary}>
            <Heading as="h2" style={h2}>
              Order Summary
            </Heading>
            {order.items.map((item: any) => (
              <Text key={item.product._id} style={productItem}>
                {item.quantity}x {item.product.name} - RWF{" "}
                {(item.price * item.quantity).toLocaleString()}
              </Text>
            ))}
            <Text style={total}>
              Total: RWF {order.totalAmount.toLocaleString()}
            </Text>
          </Section>

          <Section style={ctaContainer}>
            <Link href={orderUrl} style={button}>
              View Order Details
            </Link>
          </Section>

          <Text style={footer}>
            If you have any questions about your order, please don&apos;t hesitate to
            contact our customer service team.
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
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 10px",
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px",
};

const orderInfo = {
  borderTop: "1px solid #e6e6e6",
  borderBottom: "1px solid #e6e6e6",
  padding: "20px 0",
  margin: "20px 0",
};

const orderNumber = {
  fontSize: "16px",
  color: "#1a1a1a",
  margin: "0 0 5px",
};

const orderStatus = {
  fontSize: "16px",
  color: "#1a1a1a",
  fontWeight: "600",
  margin: "0 0 5px",
};

const orderDate = {
  fontSize: "16px",
  color: "#4a4a4a",
  margin: "0",
};

const orderSummary = {
  margin: "20px 0",
};

const productItem = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 5px",
};

const total = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "15px 0 0",
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
  margin: "20px 0 0",
};
