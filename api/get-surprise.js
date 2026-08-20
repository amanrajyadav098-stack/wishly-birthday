import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const slug = req.query?.slug;

    if (!slug) {
      return res.status(400).json({
        error: 'Missing surprise id'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('surprises')
      .select('payload')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: 'Surprise not found'
      });
    }

    return res.status(200).json(
      data.payload
    );

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
