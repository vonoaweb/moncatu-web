// netlify/functions/create-mercadopago-preference.js
// Backend serverless para crear preferencias de Mercado Pago Checkout Pro
//
// CONFIGURACIÓN:
// 1. npm install mercadopago
// 2. Variables de entorno en Railway/Netlify:
//    - MERCADOPAGO_ACCESS_TOKEN: tu Access Token de Mercado Pago
//    - SITE_URL: https://moncatu.com (para URLs de retorno)
//
// También sirve como referencia si usas Express en Railway:
//   app.post('/api/create-mercadopago-preference', handler)

const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { items, payer, shipping } = JSON.parse(event.body);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Items inválidos' })
      };
    }

    if (!payer || !payer.email || !payer.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Información del cliente incompleta' })
      };
    }

    const siteUrl = process.env.SITE_URL || 'https://moncatu.com';

    const preferenceItems = items.map(item => ({
      title: String(item.title).slice(0, 256),
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      currency_id: 'MXN',
      picture_url: item.picture_url || undefined,
      description: item.description ? String(item.description).slice(0, 256) : undefined
    }));

    if (shipping && shipping.cost > 0) {
      preferenceItems.push({
        title: 'Envío',
        unit_price: Number(shipping.cost),
        quantity: 1,
        currency_id: 'MXN'
      });
    }

    const nameParts = payer.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const preferenceData = {
      items: preferenceItems,
      payer: {
        email: payer.email,
        name: firstName,
        surname: lastName,
        phone: payer.phone ? { number: payer.phone.replace(/\D/g, '') } : undefined,
        address: shipping && shipping.address ? {
          street_name: shipping.address.street || '',
          zip_code: shipping.address.zipCode || ''
        } : undefined
      },
      back_urls: {
        success: siteUrl + '/order-confirmation.html?status=approved',
        failure: siteUrl + '/order-confirmation.html?status=rejected',
        pending: siteUrl + '/order-confirmation.html?status=pending'
      },
      auto_return: 'approved',
      statement_descriptor: 'MONCATU',
      external_reference: 'moncatu_' + Date.now()
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      })
    };

  } catch (error) {
    console.error('Error creando preferencia de Mercado Pago:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error al crear la preferencia de pago',
        message: error.message
      })
    };
  }
};
