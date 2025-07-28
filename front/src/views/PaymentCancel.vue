<template>
  <div class="payment-cancel">
    <div class="cancel-content">
      <div class="cancel-icon">❌</div>
      <h1>Paiement annulé</h1>
      <p>Votre commande n'a pas été traitée.</p>
      
      <div class="actions">
        <button @click="$router.push('/')" class="home-btn">
          Retour à l'accueil
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentCancel'
}
</script>

<style scoped>
.payment-cancel {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.cancel-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
}

.cancel-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.retry-btn {
  flex: 1;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.home-btn {
  flex: 1;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>
