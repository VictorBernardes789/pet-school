<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

const API_URL = 'http://localhost:3000';
const route = useRoute();
const router = useRouter();
const pet = ref(null);
const tutor = ref(null);
const carregando = ref(true);
const erro = ref('');

async function carregarPet() {
  try {
    const respostaPet = await fetch(`${API_URL}/pets/${encodeURIComponent(route.params.id)}`);
    if (!respostaPet.ok) throw new Error();
    pet.value = await respostaPet.json();

    const respostaTutor = await fetch(`${API_URL}/tutores/${encodeURIComponent(pet.value.tutorId)}`);
    if (respostaTutor.ok) tutor.value = await respostaTutor.json();
  } catch {
    erro.value = 'Não foi possível carregar este pet. Verifique se a API está ligada.';
  } finally {
    carregando.value = false;
  }
}

async function removerPet() {
  if (!window.confirm('Deseja realmente remover este pet?')) return;

  try {
    const resposta = await fetch(`${API_URL}/pets/${encodeURIComponent(route.params.id)}`, {
      method: 'DELETE',
    });
    if (!resposta.ok) throw new Error();
    router.push(tutor.value ? `/tutores/${tutor.value.id}` : '/pets');
  } catch {
    window.alert('Não foi possível remover o pet. Verifique se a API está ligada.');
  }
}

onMounted(carregarPet);
</script>

<template>
  <div>
    <header class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div>
        <h1 class="page-title mb-1">Detalhes do Pet</h1>
        <p class="text-body-secondary mb-0">Informações do pet cadastrado.</p>
      </div>
      <RouterLink to="/pets" class="btn btn-outline-primary">
        <i class="bi bi-arrow-left me-1"></i> Voltar para pets
      </RouterLink>
    </header>
    <p v-if="carregando">Carregando pet...</p>
    <p v-else-if="erro" class="alert alert-danger">{{ erro }}</p>
    <template v-else-if="pet">
      <section class="section-card">
        <h2 class="section-card-title fs-5">Dados do Pet</h2>
        <div class="section-card-body row g-3">
          <div class="col-md-3"><div class="info-label">ID</div>{{ pet.id }}</div>
          <div class="col-md-3"><div class="info-label">Nome</div>{{ pet.nome }}</div>
          <div class="col-md-3"><div class="info-label">Espécie</div>{{ pet.especie }}</div>
          <div class="col-md-3">
            <div class="info-label">Tutor</div>
            <RouterLink v-if="tutor" :to="`/tutores/${tutor.id}`">{{ tutor.nome }}</RouterLink>
            <span v-else>Tutor não encontrado</span>
          </div>
        </div>
      </section>
      <button class="btn btn-outline-danger" type="button" @click="removerPet">
        <i class="bi bi-trash me-1"></i> Remover pet
      </button>
    </template>
  </div>
</template>
