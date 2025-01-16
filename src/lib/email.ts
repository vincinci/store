import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import OrderStatusEmail from "@/emails/OrderStatusEmail";
import WelcomeEmail from "@/emails/WelcomeEmail";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOrderConfirmationEmail(order: any) {
  try {
    const emailHtml = render(
      OrderConfirmationEmail({
        order,
        orderUrl: \`\${process.env.NEXT_PUBLIC_APP_URL}/orders/\${order._id}\`,
      })
    );

    await transporter.sendMail({
      from: \`"\${process.env.SMTP_FROM_NAME}" <\${process.env.SMTP_FROM_EMAIL}>\`,
      to: order.user.email,
      subject: \`Order Confirmation #\${order._id.slice(-8)}\`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}

export async function sendOrderStatusEmail(order: any) {
  try {
    const emailHtml = render(
      OrderStatusEmail({
        order,
        orderUrl: \`\${process.env.NEXT_PUBLIC_APP_URL}/orders/\${order._id}\`,
      })
    );

    await transporter.sendMail({
      from: \`"\${process.env.SMTP_FROM_NAME}" <\${process.env.SMTP_FROM_EMAIL}>\`,
      to: order.user.email,
      subject: \`Order Status Update #\${order._id.slice(-8)}\`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Error sending order status email:", error);
  }
}

export async function sendWelcomeEmail(user: any) {
  try {
    const emailHtml = render(
      WelcomeEmail({
        name: user.name,
        loginUrl: \`\${process.env.NEXT_PUBLIC_APP_URL}/auth/signin\`,
      })
    );

    await transporter.sendMail({
      from: \`"\${process.env.SMTP_FROM_NAME}" <\${process.env.SMTP_FROM_EMAIL}>\`,
      to: user.email,
      subject: "Welcome to MTN Store",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}
