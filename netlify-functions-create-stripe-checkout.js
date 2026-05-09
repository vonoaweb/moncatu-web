// netlify/functions/create-stripe-checkout.js
// Backend serverless para crear sesiones de Stripe Checkout

// CONFIGURACIÓN:
// 1. Instalar dependencias: npm install stripe
// 2. Configurar variables de entorno en Netlify:
//    - STRIPE_SECRET_KEY: tu clave secreta de Stripe
// 3. Desplegar este archivo en netlify/functions/

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { items, total, customer, currency = 'mxn' } = JSON.parse(event.body);

    // Validar datos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Items inválidos' })
      };
    }

    if (!customer || !customer.email || !customer.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Información del cliente incompleta' })
      };
    }

    // Crear line items para Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
          description: item.size ? `Talla: ${item.size}` : undefined,
          images: [item.image]
        },
        unit_amount: Math.round(item.price * 100) // Convertir a centavos
      },
      quantity: item.quantity
    }));

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'oxxo'],
      line_items: lineItems,
      mode: 'payment',
      
      // URLs de éxito y cancelación
      success_url: `${process.env.URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/checkout?cancelled=true`,
      
      // Información del cliente
      customer_email: customer.email,
      
      // Dirección de envío
      shipping_address_collection: {
        allowed_countries: ['MX']
      },
      
      // Billing address
      billing_address_collection: 'required',
      
      // Metadata para guardar en la orden
      metadata: {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email
      },
      
      // Configuración de OXXO
      payment_method_options: {
        oxxo: {
          expires_after_days: 3 // OXXO expira en 3 días
        }
      },
      
      // Configuración regional
      locale: 'es'
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (error) {
    console.error('Error creando sesión de Stripe:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error al crear la sesión de pago',
        message: error.message
      })
    };
  }
};
