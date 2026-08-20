import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({
        error: 'Supabase environment variables are missing'
      });
    }

    const body = req.body || {};

    if (!body.name || !body.birthday) {
      return res.status(400).json({
        error: 'Name and birthday are required'
      });
    }

    if (!body.paymentId || !body.orderId) {
      return res.status(400).json({
        error: 'Payment information is missing'
      });
    }

    const supabase = createClient(
      supabaseUrl,
      serviceKey
    );

    const slug = crypto.randomUUID()
      .replaceAll('-', '')
      .slice(0, 12);

    const payload = {
      name: body.name,
      birthday: body.birthday,
      language: body.language || 'English',
      message: body.message || '',
      memoryLine: body.memoryLine || '',
      theme: body.theme || 'normal',
      memories: body.memories || [],
      finalGreeting: body.finalGreeting || '',
      finalImage: body.finalImage || null
    };

    const { error } = await supabase
      .from('surprises')
      .insert({
        slug,
        payload,
        payment_id: body.paymentId,
        order_id: body.orderId
      });

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    const productionUrl =
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'wishly-birthday-t2v7-aman-raaj.vercel.app';

    return res.status(200).json({
      success: true,
      url: `https://${productionUrl}/?surprise=${slug}`
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
