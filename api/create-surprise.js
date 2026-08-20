import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
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

    const slug = crypto.randomBytes(6).toString('hex');

    const payload = {
      name: body.name,
      birthday: body.birthday,
      language: body.language || 'English',
      message: body.message || '',
      memoryLine: body.memoryLine || '',
      theme: body.theme || 'normal',
      memories: Array.isArray(body.memories)
        ? body.memories
        : [],
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
        error: 'Could not save surprise: ' + error.message
      });
    }

    const baseUrl =
      process.env.PUBLIC_URL ||
      'https://wishly-birthday-t2v7.vercel.app';

    return res.status(200).json({
      success: true,
      url: `${baseUrl}/?surprise=${slug}`
    });

  } catch (error) {
    console.error('CREATE SURPRISE ERROR:', error);

    return res.status(500).json({
      error: error.message || 'Failed to create surprise'
    });
  }
}
