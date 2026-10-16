<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const API_URL = 'http://localhost:3000';
const pets = ref([]);
const tutores = ref([]);
const carregando = ref(true);
const erro = ref('');

async function carregarDados() {
  try {
    const respostaPets = await fetch(`${API_URL}/pets`);
    const respostaTutores = await fetch(`${API_URL}/tutores`);

    if (!respostaPets.ok || !respostaTutores.ok) {
      throw new Error('Não foi possível buscar os dados.');
    }

    pets.value = await respostaPets.json();
    tutores.value = await respostaTutores.json();
  } catch {
    erro.value = 'Não foi possível carregar os pets. Verifique se a API está ligada.';
  } finally {
    carregando.value = false;
  }
}

function nomeDoTutor(tutorId) {
  const tutor = tutores.value.find((item) => String(item.id) === String(tutorId));
  return tutor ? tutor.nome : 'Tutor não encontrado';
}

onMounted(carregarDados);
</script>

<template>
  <div>
    <header class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 class="page-title mb-1">Listagem de Pets</h1>
        <p class="text-body-secondary mb-0">Confira os pets cadastrados no sistema.</p>
      </div>
      <RouterLink class="btn btn-primary" to="/pets/novo">
        <i class="bi bi-plus-lg me-1"></i> Adicionar pet
      </RouterLink>
    </header>

    <p v-if="carregando">Carregando pets...</p>
    <div v-else-if="erro" class="alert alert-danger">{{ erro }}</div>
    <div v-else class="table-responsive">
      <table class="table table-bordered table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Espécie</th>
            <th>Tutor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pet in pets" :key="pet.id">
            <td>{{ pet.id }}</td>
            <td>{{ pet.nome }}</td>
            <td>{{ pet.especie }}</td>
            <td>{{ nomeDoTutor(pet.tutorId) }}</td>
            <td>
              <RouterLink class="btn btn-outline-primary btn-sm" :to="`/pets/${pet.id}`">
                Visualizar
              </RouterLink>
            </td>
          </tr>
          <tr v-if="pets.length === 0">
            <td colspan="5" class="text-center text-body-secondary py-4">
              Nenhum pet cadastrado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
