import prisma from './prisma';

// Twilio client - initialized lazily
let twilioClient: any = null;

function getTwilio() {
  if (!twilioClient) {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
}

interface SendSmsParams {
  businessId: string;
  customerId: string;
  phone: string;
  message: string;
  campaignId?: string;
}

export async function sendSms({ businessId, customerId, phone, message, campaignId }: SendSmsParams) {
  // Check SMS quota
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error('Business not found');
  if (business.smsUsed >= business.smsQuota) {
    throw new Error('SMS quota exceeded. Upgrade your plan or wait for monthly reset.');
  }

  let twilioSid: string | null = null;

  // Send via Twilio (only in production with valid credentials)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    try {
      const client = getTwilio();
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      twilioSid = result.sid;
    } catch (error) {
      console.error('Twilio SMS error:', error);
      // Log failed SMS
      await prisma.smsLog.create({
        data: { businessId, customerId, phone, message, status: 'FAILED', campaignId },
      });
      throw error;
    }
  } else {
    console.log(`[DEV MODE] SMS to ${phone}: ${message}`);
  }

  // Log the SMS
  const smsLog = await prisma.smsLog.create({
    data: {
      businessId,
      customerId,
      phone,
      message,
      status: 'SENT',
      twilioSid,
      campaignId,
    },
  });

  // Increment SMS counter
  await prisma.business.update({
    where: { id: businessId },
    data: { smsUsed: { increment: 1 } },
  });

  return smsLog;
}

export function buildReviewSms(businessName: string, customerFirstName: string, ratingUrl: string): string {
  return `Bonjour ${customerFirstName} ! Merci pour votre visite chez ${businessName}. Votre avis compte beaucoup pour nous : ${ratingUrl}`;
}

export function buildRatingUrl(businessId: string, smsLogId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/rate/${businessId}?ref=${smsLogId}`;
}
