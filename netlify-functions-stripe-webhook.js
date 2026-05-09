// netlify/functions/stripe-webhook.js
// Webhook para manejar eventos de Stripe (pagos completados, etc.)

// CONFIGURACIÓN:
// 1. Instalar: npm install stripe
// 2. Variables de entorno en Netlify:
//    - STRIPE_SECRET_KEY
//    - STRIPE_WEBHOOK_SECRET (obtener de Stripe Dashboard > Webhooks)
// 3. Configurar webhook en Stripe Dashboard:
//    - URL: https://tu-sitio.netlify.app/.netlify/functions/stripe-webhook
//    - Eventos: checkout.session.completed, payment_intent.succeeded

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Inicializar Firebase Admin (necesario para backend)
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    // Verificar firma del webhook
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Error verificando webhook:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    };
  }

  // Manejar el evento
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
        
      default:
        console.log(`Evento no manejado: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Error procesando webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error procesando webhook' })
    };
  }
};

// Manejar checkout completado
async function handleCheckoutCompleted(session) {
  console.log('Checkout completado:', session.id);

  try {
    // Crear orden en Firestore
    const orderData = {
      // Información del pago
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
      stripeCustomerId: session.customer,
      
      // Monto
      total: session.amount_total / 100, // Convertir de centavos
      currency: session.currency,
      
      // Status
      status: 'paid',
      paymentStatus: 'paid',
      paymentMethod: 'stripe',
      
      // Información del cliente
      customerEmail: session.customer_details?.email || session.customer_email,
      customerName: session.metadata?.customer_name || session.customer_details?.name,
      customerPhone: session.metadata?.customer_phone || session.customer_details?.phone,
      
      // Dirección de envío
      shippingAddress: session.shipping_address ? {
        street: session.shipping_address.line1,
        city: session.shipping_address.city,
        state: session.shipping_address.state,
        zipCode: session.shipping_address.postal_code,
        country: session.shipping_address.country
      } : null,
      
      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paidAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Obtener line items del checkout
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product']
    });

    // Agregar items a la orden
    orderData.items = lineItems.data.map(item => ({
      productName: item.description,
      quantity: item.quantity,
      price: item.price.unit_amount / 100,
      image: item.price.product.images?.[0] || null
    }));

    // Guardar orden en Firestore
    const orderRef = await db.collection('orders').add(orderData);
    console.log('Orden creada:', orderRef.id);

    // Enviar email de confirmación (opcional)
    await sendOrderConfirmationEmail(orderData, orderRef.id);

    // Actualizar stock de productos (si aplica)
    // await updateProductStock(orderData.items);

  } catch (error) {
    console.error('Error creando orden:', error);
    throw error;
  }
}

// Manejar pago exitoso
async function handlePaymentSucceeded(paymentIntent) {
  console.log('Pago exitoso:', paymentIntent.id);

  try {
    // Buscar orden por payment intent
    const ordersSnapshot = await db.collection('orders')
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      
      // Actualizar estado de la orden
      await orderDoc.ref.update({
        paymentStatus: 'paid',
        status: 'processing',
        paidAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Orden actualizada:', orderDoc.id);
    }
  } catch (error) {
    console.error('Error actualizando orden:', error);
    throw error;
  }
}

// Manejar pago fallido
async function handlePaymentFailed(paymentIntent) {
  console.log('Pago fallido:', paymentIntent.id);

  try {
    // Buscar orden por payment intent
    const ordersSnapshot = await db.collection('orders')
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      
      // Actualizar estado
      await orderDoc.ref.update({
        paymentStatus: 'failed',
        status: 'cancelled',
        failureReason: paymentIntent.last_payment_error?.message || 'Pago rechazado'
      });

      console.log('Orden marcada como fallida:', orderDoc.id);
    }
  } catch (error) {
    console.error('Error actualizando orden fallida:', error);
    throw error;
  }
}

// Enviar email de confirmación (implementar con servicio de email)
async function sendOrderConfirmationEmail(orderData, orderId) {
  // TODO: Implementar con SendGrid, Mailgun, etc.
  console.log('Enviar email a:', orderData.customerEmail);
  console.log('Order ID:', orderId);
  
  // Ejemplo con SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // const msg = {
  //   to: orderData.customerEmail,
  //   from: 'hola@moncatu.mx',
  //   subject: 'Confirmación de tu pedido - Moncatu',
  //   text: `Tu pedido #${orderId} ha sido confirmado...`,
  //   html: `<strong>Gracias por tu compra...</strong>`
  // };
  // await sgMail.send(msg);
}

// Actualizar stock de productos
async function updateProductStock(items) {
  // TODO: Implementar si manejas stock
  for (const item of items) {
    // Reducir stock del producto
    // const productRef = db.collection('products').doc(item.productId);
    // await productRef.update({
    //   stock: admin.firestore.FieldValue.increment(-item.quantity)
    // });
  }
}
