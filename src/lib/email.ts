import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resend) {
    console.error("RESEND_API_KEY is not configured in .env.local");
    return { success: false, error: "Email service not configured" };
  }
  const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Convertz <urconvertz@yespstudio.com>",
      to: [email],
      subject: "Reset your Convertz password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Reset Your Password</h2>
          <p>We received a request to reset the password for your Convertz account.</p>
          <p>Click the button below to choose a new password. This link will expire in 1 hour.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
               Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">Convertz - Professional File Conversions</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  if (!resend) return { success: false, error: "Email service not configured" };

  try {
    const { data, error } = await resend.emails.send({
      from: "Convertz <urconvertz@yespstudio.com>",
      to: [email],
      subject: "Welcome to Convertz!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Welcome to Convertz${name ? `, ${name}` : ""}!</h2>
          <p>We're thrilled to have you on board. Convertz is designed to provide you with the fastest and most professional file conversion experience directly in your browser.</p>
          <p>You now have access to <strong>unlimited conversions</strong> and your conversion history is securely saved.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
               Go to Dashboard
            </a>
          </div>
          <p>If you have any questions, feel free to reply to this email hello@yespstudio.com</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">Convertz - Professional File Conversions</p>
        </div>
      `,
    });
    return { success: !error, error, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendInactivityEmail(email: string, name?: string) {
  if (!resend) return { success: false, error: "Email service not configured" };

  try {
    const { data, error } = await resend.emails.send({
      from: "Convertz <urconvertz@yespstudio.com>",
      to: [email],
      subject: "We miss you at Convertz!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">It's been a while, ${name || "friend"}!</h2>
          <p>We noticed you haven't used Convertz in a few days. We've added new improvements and tools to help you with your file conversions.</p>
          <p>Come back today and see what's new!</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
               Back to Convertz
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">Need help with something? Let us know!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">Convertz - Professional File Conversions</p>
        </div>
      `,
    });
    return { success: !error, error, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendContactEmail(details: {
  name: string;
  email: string;
  subject: string;
  message: string
}) {
  if (!resend) {
    console.error("RESEND_API_KEY is not configured in .env.local");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Convertz Support <urconvertz@yespstudio.com>",
      to: ["hello@yespstudio.com"],
      reply_to: details.email,
      subject: `[Contact Form] ${details.subject}: ${details.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Contact Message</h1>
          </div>
          
          <div style="padding: 32px;">
            <div style="margin-bottom: 24px;">
              <p style="text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #94a3b8; margin: 0 0 4px 0;">Sender Name</p>
              <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">${details.name}</p>
            </div>
            
            <div style="margin-bottom: 24px;">
              <p style="text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #94a3b8; margin: 0 0 4px 0;">Email Address</p>
              <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">${details.email}</p>
            </div>
            
            <div style="margin-bottom: 24px;">
              <p style="text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #94a3b8; margin: 0 0 4px 0;">Subject</p>
              <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">${details.subject}</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9;">
              <p style="text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #94a3b8; margin: 0 0 12px 0;">Message Content</p>
              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0; white-space: pre-wrap;">${details.message}</p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">Sent via Convertz Contact Form</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return { success: false, error };
  }
}

export async function sendNewsletterWelcomeEmail(email: string) {
  if (!resend) return { success: false, error: "Email service not configured" };

  try {
    const { data, error } = await resend.emails.send({
      from: "Convertz <urconvertz@yespstudio.com>",
      to: [email],
      subject: "You're subscribed! Welcome to Convertz Newsletter",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 16px;">
          <div style="background-color: #4f46e5; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">Welcome to Convertz!</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">Thanks for subscribing!</h2>
            <p style="color: #475569; line-height: 1.6;">We're excited to have you in our community. From now on, you'll be the first to know about:</p>
            <ul style="color: #475569; line-height: 1.6;">
              <li>New file conversion tools</li>
              <li>Privacy and security tips for your documents</li>
              <li>Productivity guides and tech insights</li>
              <li>Exclusive platform updates</li>
            </ul>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">In the meantime, feel free to check out our latest blog posts or start converting your files for free.</p>
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/blog" 
                 style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
                 Read the Blog
              </a>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            <p>© 2026 Convertz. All rights reserved.</p>
            <p>You received this because you subscribed to our newsletter at convertz.com</p>
          </div>
        </div>
      `,
    });
    return { success: !error, error, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendNewsletterBroadcastEmail(emails: string[], post: { title: string; excerpt: string; slug: string; category: string }) {
  if (!resend) return { success: false, error: "Email service not configured" };

  try {
    // For large lists, Resend recommends using the 'batch' feature or sending individually.
    // For now, we'll send a single email with BCC for privacy if the list is small, 
    // or loop if it's moderate. Since Resend has rate limits, we'll send it as one email to hello@ 
    // and BCC the others for simplicity in this V1.

    const { data, error } = await resend.emails.send({
      from: "Convertz Newsletter <urconvertz@yespstudio.com>",
      to: ["hello@yespstudio.com"], // Dummy recipient
      bcc: emails,
      subject: `New on Convertz: ${post.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="background-color: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${post.category}</span>
          </div>
          <div style="background-color: white; padding: 40px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; line-height: 1.2; margin-top: 0; margin-bottom: 16px;">${post.title}</h1>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">${post.excerpt}</p>
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/blog/${post.slug}" 
                 style="background-color: #4f46e5; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                 Continue Reading
              </a>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #cbd5e1; font-size: 12px;">
            <p>Sent with ❤️ from the Convertz Team</p>
            <p>Convertz - Professional Browser-Based File Conversions</p>
          </div>
        </div>
      `,
    });
    return { success: !error, error, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  if (!resend) {
    console.error("RESEND_API_KEY is not configured in .env.local");
    return { success: false, error: "Email service not configured" };
  }
  const verificationLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Convertz <urconvertz@yespstudio.com>",
      to: [email],
      subject: "Verify your Convertz account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 16px;">
          <div style="background-color: #4f46e5; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">Welcome to Convertz!</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">Please verify your email address</h2>
            <p style="color: #475569; line-height: 1.6;">Thank you for signing up for Convertz! To complete your registration and unlock all features, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                 Verify Email Address
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">This link will expire in 24 hours. If you didn't create an account with us, you can safely ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            <p>© 2026 Convertz. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error };
  }
}
