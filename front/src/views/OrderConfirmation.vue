<template>
  <div class="confirmation-page">
    <div class="confirmation-content">
      <div class="success-icon">✅</div>
      <h1>Commande confirmée !</h1>
      <div class="order-details">
        <p><strong>Numéro:</strong> {{ $route.query.orderNumber }}</p>
        <p><strong>Total:</strong> {{ $route.query.total }}€</p>
        <p><strong>Retrait:</strong> {{ $route.query.pickupDate }} à {{ $route.query.pickupTime }}</p>
      </div>
      <button @click="$router.push('/')" class="home-btn">
        Retour à l'accueil
      </button>
    </div>
  </div>
</template>


<style scoped>
.confirmation-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.confirmation-content {
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
}

.order-details p {
  margin: 8px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.home-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}
</style>