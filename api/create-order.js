export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const amount = 3900;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret)
      return res.status(500).json({error:'Razorpay environment variables are missing'});

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Basic ${auth}`
      },
      body:JSON.stringify({
        amount,
        currency:'INR',
        receipt:`wishly_${Date.now()}`,
        notes:{product:'Wishly Birthday Surprise'}
      })
    });

    const data = await r.json();

    if (!r.ok)
      return res.status(r.status).json({
        error:data.error?.description || 'Unable to create order'
      });

    return res.status(200).json({
      id:data.id,
      amount:data.amount,
      currency:data.currency,
      key_id:keyId
    });

  } catch(e) {
    return res.status(500).json({error:e.message});
  }
}
