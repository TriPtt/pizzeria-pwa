<template>
  <div class="payment-success">
    <div class="success-content">
      <div class="success-icon">✅</div>
      <h1>Paiement réussi !</h1>
      <p v-if="loading">Finalisation de votre commande...</p>
      
      <div v-if="order" class="order-details">
        <h3>Détails de votre commande</h3>
        <p><strong>Numéro:</strong> #{{ order.id }}</p>
        <p><strong>Total:</strong> {{ order.total_amount }}€</p>
        <p><strong>Retrait:</strong> {{ order.pickup_date }} à {{ order.pickup_time }}</p>
      </div>

      <div v-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <button @click="router.push('/')" class="home-btn">
        Retour à l'accueil
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const loading = ref(true)
const order = ref(null)
const error = ref(null)

async function finalizeOrder() {
  try {
    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || 'null');
    console.log('pendingOrder (full):', pendingOrder);
    if (!pendingOrder) throw new Error('Aucune commande en attente trouvée');

    // 1) Customer -> customer_name / customer_phone
    const customer_name = (pendingOrder.customer?.name ?? pendingOrder.customer_name ?? '').trim();
    const customer_phone = (pendingOrder.customer?.phone ?? pendingOrder.customer_phone ?? '').trim();

    if (!customer_name || !customer_phone) {
      console.error('Nom/téléphone manquant dans pendingOrder:', { customer_name, customer_phone, pendingOrder });
      // Afficher un message à l'utilisateur au lieu d'envoyer la requête
      return;
    }

    // 2) Normalize products -> items attendus par le backend
    const rawProducts = Array.isArray(pendingOrder.products) ? pendingOrder.products : (pendingOrder.items || []);
    if (!rawProducts.length) {
      console.error('Aucun produit trouvé dans la commande', rawProducts);
      return;
    }

    const normalizedItems = rawProducts.map((p, idx) => {
      // Essayez plusieurs noms possibles pour l'id
      const productId = p.id ?? p.product_id ?? p.productId ?? p.sku ?? null;
      if (!productId) {
        // Erreur explicite : vous n'avez pas d'ID produit -> impossible d'insérer la commande correctement
        throw new Error(`Produit sans product_id détecté (index ${idx}). Champ requis manquant. Produit=${JSON.stringify(p)}`);
      }
      const idNum = Number(productId);
      if (!Number.isFinite(idNum)) {
        throw new Error(`product_id non numérique pour l'item ${idx} (${productId})`);
      }
      return {
        product_id: idNum,
        quantity: Math.max(1, parseInt(p.quantity ?? p.qty ?? 1, 10)),
        base_price: Number(p.base_price ?? p.price ?? 0),
        unit_price: Number(p.unit_price ?? p.finalPrice ?? p.price ?? 0),
        customizations: p.customizations ?? {},
        description: p.description ?? null
      };
    });

    if (normalizedItems.length === 0) {
      throw new Error('Aucun article valide à envoyer');
    }
    // 3) Construire le body conforme
    const orderData = {
      items: normalizedItems,
      customer_name,
      customer_phone,
      pickup_date: pendingOrder.pickup_date,
      pickup_time: pendingOrder.pickup_time,
      notes: pendingOrder.notes ?? '',
      total_amount: Number(pendingOrder.total_price ?? pendingOrder.total_amount ?? 0)
    };

    console.log('orderData to send:', orderData);

    // 4) Envoi (auth si nécessaire)
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL_BACK}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Erreur response:', txt);
      throw new Error(`Erreur ${res.status}: ${txt}`);
    }

    const created = await res.json();
    console.log('Commande créée:', created);

    // nettoyage / redirect (exemple)
    localStorage.removeItem('pendingOrder');
    localStorage.setItem('orderConfirmation', JSON.stringify({
      order_Number: created.order?.order_number ?? `CMD-${String(created.order?.id ?? '')}`,
      total_price: created.order?.total_price ?? orderData.total_amount,
      pickup_Date: created.order?.pickup_date ?? orderData.pickup_date,
      pickup_Time: created.order?.pickup_time ?? orderData.pickup_time
    }));

    // rediriger ou afficher confirmation
    // router.push({ name: 'order-confirmation' });

  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Requête timeout');
    } else {
      console.error('Erreur finalizeOrder:', err);
    }
    // Afficher message utilisateur
  }
}


onMounted(() => {
  finalizeOrder()
})
</script>


<style scoped>
.payment-success {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.success-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.order-details {
  margin: 24px 0;
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.order-details p {
  margin: 8px 0;
}

.error {
  margin: 20px 0;
  padding: 16px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  border: 1px solid #fca5a5;
}

.home-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.2s;
}

.home-btn:hover {
  background: #218838;
}
</style>
