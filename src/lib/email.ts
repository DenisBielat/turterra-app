import * as postmark from "postmark";

let client: postmark.ServerClient | null = null;

function getClient() {
  if (!client) {
    const token = process.env.POSTMARK_SERVER_TOKEN;
    if (!token) {
      throw new Error("POSTMARK_SERVER_TOKEN is not set");
    }
    client = new postmark.ServerClient(token);
  }
  return client;
}

const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || "noreply@turterra.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://turterra.com";

interface SendTemplateEmailOptions {
  to: string;
  templateAlias: string;
  templateModel: Record<string, unknown>;
}

export async function sendTemplateEmail({
  to,
  templateAlias,
  templateModel,
}: SendTemplateEmailOptions) {
  try {
    await getClient().sendEmailWithTemplate({
      From: FROM_EMAIL,
      To: to,
      TemplateAlias: templateAlias,
      TemplateModel: templateModel,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendTemplateEmail({
    to: email,
    templateAlias: "welcome",
    templateModel: {
      name: name || "turtle friend",
      login_url: `${APP_URL}/login`,
    },
  });
}
