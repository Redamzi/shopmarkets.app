const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.from = process.env.SMTP_FROM || `security@${process.env.APP_DOMAIN}`;
  }

  async sendEmail({ to, subject, text, html }) {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html,
      });

      logger.info(`Email sent successfully to ${to}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Failed to send email via SMTP', {
        error: error.message,
        to,
        subject,
      });
      throw new Error('Email sending failed');
    }
  }

  async sendVerificationCode(email, code, type = 'LOGIN') {
    const appName = process.env.APP_NAME || 'ShopMarkets';
    const domain = process.env.APP_DOMAIN || 'shopmarkets.app';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@shopmarkets.app';

    const typeTexts = {
      LOGIN: 'angemeldet',
      REGISTRATION: 'registriert',
      PASSWORD_RESET: 'ein Passwort-Reset angefordert',
      EMAIL_CHANGE: 'eine E-Mail-Änderung angefordert',
    };

    const subject = `Ihr Bestätigungscode für ${appName}`;

    const text = `Guten Tag,

Sie haben sich bei ${appName} ${typeTexts[type] || 'eine Aktion durchgeführt'}.
Um fortzufahren, geben Sie bitte den folgenden Sicherheitscode ein:

${code}

Dieser Code ist ${process.env.CODE_EXPIRY_MINUTES || 10} Minuten gültig.

Warum erhalten Sie diese E-Mail?
Diese Adresse wurde bei der Anmeldung auf ${domain} angegeben. Falls Sie dies nicht waren, können Sie diese E-Mail ignorieren.

Mit freundlichen Grüßen
Ihr Team von ${appName}

Kontakt: ${supportEmail}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Guten Tag,</h2>
        <p>Sie haben sich bei <strong>${appName}</strong> ${typeTexts[type] || 'eine Aktion durchgeführt'}.</p>
        <p>Um fortzufahren, geben Sie bitte den folgenden Sicherheitscode ein:</p>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
        </div>
        
        <p style="color: #666; font-size: 14px;">Dieser Code ist ${process.env.CODE_EXPIRY_MINUTES || 10} Minuten gültig.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          <strong>Warum erhalten Sie diese E-Mail?</strong><br>
          Diese Adresse wurde bei der Anmeldung auf ${domain} angegeben. Falls Sie dies nicht waren, können Sie diese E-Mail ignorieren.
        </p>
        
        <p style="color: #666; font-size: 12px;">
          Mit freundlichen Grüßen<br>
          Ihr Team von ${appName}<br>
          Kontakt: <a href="mailto:${supportEmail}">${supportEmail}</a>
        </p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }

  async send2FAActivationEmail(email, backupCodes) {
    const appName = process.env.APP_NAME || 'ShopMarkets';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@shopmarkets.app';

    const subject = `Zwei-Faktor-Authentifizierung aktiviert - ${appName}`;

    const text = `Guten Tag,

Die Zwei-Faktor-Authentifizierung (2FA) wurde erfolgreich für Ihr Konto aktiviert.

Ihre Backup-Codes (bitte sicher aufbewahren):
${backupCodes.join('\n')}

Wichtig: Bewahren Sie diese Codes an einem sicheren Ort auf. Sie benötigen diese, falls Sie keinen Zugriff mehr auf Ihre Authenticator-App haben.

Falls Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie uns umgehend unter ${supportEmail}.

Mit freundlichen Grüßen
Ihr Team von ${appName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Zwei-Faktor-Authentifizierung aktiviert</h2>
        <p>Die Zwei-Faktor-Authentifizierung (2FA) wurde erfolgreich für Ihr Konto aktiviert.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">Ihre Backup-Codes:</h3>
          <p style="color: #d97706; font-weight: bold;">⚠️ Bitte sicher aufbewahren!</p>
          <ul style="list-style: none; padding: 0; font-family: monospace;">
            ${backupCodes.map(code => `<li style="padding: 5px 0;">${code}</li>`).join('')}
          </ul>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          <strong>Wichtig:</strong> Bewahren Sie diese Codes an einem sicheren Ort auf. Sie benötigen diese, falls Sie keinen Zugriff mehr auf Ihre Authenticator-App haben.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #d97706; font-size: 14px;">
          Falls Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie uns umgehend unter <a href="mailto:${supportEmail}">${supportEmail}</a>.
        </p>
        
        <p style="color: #666; font-size: 12px;">
          Mit freundlichen Grüßen<br>
          Ihr Team von ${appName}
        </p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }
}

module.exports = new MailService();
