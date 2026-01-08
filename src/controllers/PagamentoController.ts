import Stripe from "stripe";
import type { Request, Response } from "express";
import db from "../database/connection.ts";
class PagamentoController {
  private stripe = new Stripe(process.env.STRIPE_KEY as string, {
    apiVersion: "2025-04-30.basil",
  });

  public criarPagamentoCartao = async (req: Request, res: Response) => {
    try {
      const { reserva_id, valor, voo_id_ida, voo_id_volta} = req.body;
      
      const usuario_id = (req as any).usuario_id;
      const comprador_id = (req as any).comprador_id;

      if (!valor || !voo_id_ida ) {
        return res.status(400).json({ erro: "Dados incompletos" });
      }

      // 1️⃣ Criar PaymentIntent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(valor * 100), // valor em centavos
        currency: "brl",
        metadata: {
          reserva_id,
          usuario_id: usuario_id ?? "anonimo",
          comprador_id,
          voo_id_ida,
          voo_id_volta: voo_id_volta ?? "nao_tem_volta",
        },
      });

      // 2️⃣ Inserir no DB
      await db.query(
        `INSERT INTO pagamentos (reserva_id, stripe_payment_intent_id, status_pagamento, valor)
         VALUES (?, ?, ?, ?)`,
        [reserva_id, paymentIntent.id, paymentIntent.status, valor]
      );

      // 3️⃣ Retornar client_secret para o frontend
      return res.json({
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      });

    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao criar pagamento", detalhes: err.message });
    }
  };

  public criarPagamentoBoleto = async (req: Request, res : Response) => {
      try{
        const { reserva_id, valor, voo_id_ida, voo_id_volta} = req.body;
      const usuario_id = (req as any).usuario_id;
      const comprador_id = (req as any).comprador_id;
        if (!valor || !voo_id_ida ) {
        return res.status(400).json({ erro: "Dados incompletos" });
      }
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(valor * 100), // valor em centavos
        currency: "brl",
        payment_method_types:["boleto"],
        metadata: {
          reserva_id,
          usuario_id: usuario_id ?? "anonimo",
          comprador_id,
          voo_id_ida,
          voo_id_volta: voo_id_volta ?? "nao_tem_volta",
        },
      });

      const confirmado = await this.stripe.paymentIntents.confirm(paymentIntent.id, {
  payment_method_data: {
    type: "boleto",
    boleto:{
      tax_id:"14796752617"
    },
    billing_details: {
      name: "Cliente sem cadastro",
      email: "cliente@email.com",
      address: {
                line1: "Rua João da Silva, 123",      
                city: "São Paulo",
                state: "SP",
                postal_code: "01001-000",
                country: "BR"
}
    }
  }
});

      await db.query(
        `INSERT INTO pagamentos (reserva_id, stripe_payment_intent_id, status_pagamento, valor)
         VALUES (?, ?, ?, ?)`,
        [reserva_id, confirmado.id, confirmado.status, valor]
      );

      return res.json({
        clientSecret: confirmado.client_secret,
        boleto: confirmado.next_action?.boleto_display_details,
      });
      }
      catch(err: any){
        console.error(err);
        return res.status(500).json({erro: "Erro ao criar pagamento de boleto", detalhes: err.message});
      }
  }
}

export default PagamentoController;