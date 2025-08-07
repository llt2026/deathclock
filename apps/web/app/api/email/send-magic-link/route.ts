export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'test_key');

interface MagicLinkRequest {
  email: string;
  magicLink: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, magicLink }: MagicLinkRequest = await request.json();

    if (!email || !magicLink) {
      return NextResponse.json({ error: "Missing email or magicLink" }, { status: 400 });
    }

    // 发送 Magic Link 邮件
    const { data, error } = await resend.emails.send({
      from: 'More Minutes <noreply@mail.moreminutes.life>',
      to: [email],
      subject: 'Sign in to More Minutes',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Sign in to More Minutes</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #111; padding: 40px; border-radius: 8px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .button { display: inline-block; background-color: #E50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 14px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1 style="color: #E50914; margin: 0;">More Minutes</h1>
              <p style="color: #999; margin: 5px 0;">Count less, live more.</p>
            </div>
            
            <h2>Sign in to your account</h2>
            <p>Click the button below to sign in to your More Minutes account. This link will expire in 1 hour.</p>
            
            <div style="text-align: center;">
              <a href="${magicLink}" class="button">Sign In</a>
            </div>
            
            <p style="color: #999; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${magicLink}" style="color: #E50914;">${magicLink}</a>
            </p>
            
            <div class="footer">
              <p>This email was sent to ${email}. If you didn't request this, you can safely ignore it.</p>
              <p>© 2024 More Minutes. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ 
        error: "Failed to send email",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    });

  } catch (error: any) {
    console.error("Magic link email error:", error);
    return NextResponse.json({ 
      error: "Failed to send magic link",
      details: error.message 
    }, { status: 500 });
  }
} 