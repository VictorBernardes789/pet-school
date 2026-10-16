<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const API_URL = 'http://localhost:3000';
const router = useRouter();
const novoPet = ref({ nome: '', especie: '', tutorId: '' });
const tutores = ref([]);
const carregandoTutores = ref(true);
const salvando = ref(false);
const erro = ref('');

async function carregarTutores() {
  try {
    const resposta = await fetch(`${API_URL}/tutores`);
    if (!resposta.ok) throw new Error();
    tutores.value = await resposta.json();
  } catch {
    erro.value = 'Não foi possível carregar os tutores. Verifique se a API está ligada.';
  } finally {
    carregandoTutores.value = false;
  }
}

async function salvarPet() {
  erro.value = '';
  salvando.value = true;

  try {
    const resposta = await fetch(`${API_URL}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: novoPet.value.nome.trim(),
        especie: novoPet.value.especie,
        tutorId: String(novoPet.value.tutorId),
      }),
    });
    if (!resposta.ok) throw new Error();
    router.push('/pets');
  } catch {
    erro.value = 'Não foi possível salvar o pet. Tente novamente.';
  } finally {
    salvando.value = false;
  }
}

onMounted(carregarTutores);
</script>

<template>
  <div>
    <header class="mb-4">
      <h1 class="page-title mb-1">Cadastrar Pet</h1>
      <p class="text-body-secondary">Preencha os dados para cadastrar um novo pet.</p>
    </header>

    <div v-if="erro" class="alert alert-danger">{{ erro }}</div>
    <p v-if="carregandoTutores">Carregando tutores...</p>

    <form v-else class="section-card" @submit.prevent="salvarPet">
      <h2 class="section-card-title fs-5">Dados do Pet</h2>
      <div class="section-card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label for="nome" class="form-label">Nome do pet</label>
            <input id="nome" v-model="novoPet.nome" class="form-control" required maxlength="100" placeholder="Digite o nome do pet" />
          </div>
          <div class="col-md-6">
            <label for="especie" class="form-label">Espécie</label>
            <select id="especie" v-model="novoPet.especie" class="form-select" required>
              <option value="" disabled>Selecione a espécie</option>
              <option value="Cachorro">Cachorro</option>
              <option value="Gato">Gato</option>
              <option value="Ave">Ave</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div class="col-md-6">
            <label for="tutor" class="form-label">Tutor</label>
            <select id="tutor" v-model="novoPet.tutorId" class="form-select" required>
              <option value="" disabled>Selecione o tutor</option>
              <option v-for="tutor in tutores" :key="tutor.id" :value="tutor.id">
                {{ tutor.nome }}
              </option>
            </select>
            <div v-if="tutores.length === 0" class="form-text">
              Cadastre um tutor antes de cadastrar um pet.
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <RouterLink to="/pets" class="btn btn-outline-secondary">Cancelar</RouterLink>
          <button class="btn btn-primary" type="submit" :disabled="salvando || tutores.length === 0">
            {{ salvando ? 'Salvando...' : 'Cadastrar pet' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
