import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string, agentName: string) {
    const url = `http://localhost:3000/agent/verify-email?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h2>Welcome ${agentName}!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${url}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
  }
}
