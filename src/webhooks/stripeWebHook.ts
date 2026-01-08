import Stripe from "stripe";
import type { Request, Response } from "express";
import db from "../database/connection.ts";

export default class StripeWebhookController {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_KEY as string, {
      apiVersion: "2025-04-30.basil",
    });

    // bind obrigatório para usar this.stripe dentro do método
    this.handleWebhook = this.handleWebhook.bind(this);
  }

  async handleWebhook(req: Request, res: Response) {
  
    
  const signature = req.headers["stripe-signature"] as string;

  let event;
  try {
    console.log("📩 Webhook recebido");
    event = this.stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Erro ao validar webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("📩 Webhook recebido");
    console.log("p");
    // pagamento concluído
    if (event.type === "payment_intent.succeeded") {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  const paymentIntentId = paymentIntent.id;
  const status = paymentIntent.status; // "succeeded"
  const reservaId = paymentIntent.metadata.reserva_id;

  console.log("✔️ Pagamento confirmado (PI):", paymentIntentId);

  await db.query(
    `UPDATE pagamentos
     SET status_pagamento = ?, stripe_payment_intent_id = ?
     WHERE reserva_id = ?`,
    [status, paymentIntentId, reservaId]
  );
}

    // pagamento falhou
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("❌ Pagamento falhou:", paymentIntent.id);
    }

    // sempre responder 200 OK para Stripe
    res.status(200).send("Webhook recebido");
  } catch (err) {
    console.log("❌ Erro ao processar evento:", err);
    // ainda responde 200 para Stripe, senão fica tentando reenviar
    res.status(400).send("Webhook recebido com erro");
  }
}
}