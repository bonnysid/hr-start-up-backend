import nodemailer, { Transporter } from 'nodemailer';

class EmailService {
  transporter: Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: String(process.env.EMAIL_HOST),
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: String(process.env.EMAIL_LOGIN),
        pass: String(process.env.EMAIL_PASSWORD)
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendMail(to: string, html: string, subject: string = 'Подтверждение почты') {
    return await this.transporter.sendMail({
      from: 'InvestApp',
      to,
      subject,
      html,
    })
  }
}

export default new EmailService();
