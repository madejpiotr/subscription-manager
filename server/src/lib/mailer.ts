import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendReminderEmail = async (
  to: string,
  subscriptionName: string,
  price: string,
  currency: string,
  nextBillingAt: Date
) => {
  const formattedDate = nextBillingAt.toLocaleDateString("pl-PL");

  await transporter.sendMail({
    from: '"Subscription Manager" <reminders@submanager.app>',
    to,
    subject: `Przypomnienie: ${subscriptionName} - płatność wkrótce`,
    html: `
      <div style="font-family: monospace; background: #0F1115; color: #E8E6E1; padding: 24px; border-radius: 8px;">
        <p style="color: #F2B84B; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Przypomnienie o płatności</p>
        <h2 style="margin: 8px 0;">${subscriptionName}</h2>
        <p style="font-size: 24px; color: #F2B84B; font-weight: bold;">${price} ${currency}</p>
        <p style="color: #8B8F99;">Płatność: ${formattedDate}</p>
      </div>
    `,
  });
};

export const sendWeeklyDigestEmail = async (
  to: string,
  subscriptions: { name: string; price: string; currency: string; nextBillingAt: Date }[],
  monthlyTotal: number
) => {
  const rows = subscriptions
    .map(
      (s) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #2A2E38;">${s.name}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #2A2E38; text-align: right;">${s.price} ${s.currency}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #2A2E38; text-align: right; color: #8B8F99;">${s.nextBillingAt.toLocaleDateString("pl-PL")}</td>
        </tr>`
    )
    .join("");

  await transporter.sendMail({
    from: '"Subscription Manager" <reminders@submanager.app>',
    to,
    subject: "Twoje cotygodniowe podsumowanie subskrypcji",
    html: `
      <div style="font-family: monospace; background: #0F1115; color: #E8E6E1; padding: 24px; border-radius: 8px;">
        <p style="color: #F2B84B; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Cotygodniowe podsumowanie</p>
        <p style="font-size: 24px; color: #F2B84B; font-weight: bold; margin: 8px 0 20px;">${monthlyTotal.toFixed(2)} PLN / mies.</p>
        <table style="width: 100%; border-collapse: collapse;">${rows}</table>
      </div>
    `,
  });
};