<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const API_URL = 'http://localhost:3000';
const tutores = ref([]);
const pets = ref([]);
const pesquisa = ref('');
const carregando = ref(true);
const erro = ref('');

const tutoresFiltrados = computed(() => {
  const texto = pesquisa.value.toLowerCase().trim();
  return tutores.value.filter((tutor) =>
    [tutor.nome, tutor.cpfCnpj, tutor.email].some((campo) =>
      String(campo || '').toLowerCase().includes(texto),
    ),
  );
});

async function carregarDados() {
  try {
    const respostaTutores = await fetch(`${API_URL}/tutores`);
    const respostaPets = await fetch(`${API_URL}/pets`);
    if (!respostaTutores.ok || !respostaPets.ok) throw new Error();

    tutores.value = await respostaTutores.json();
    pets.value = await respostaPets.json();
  } catch {
    erro.value = 'Não foi possível carregar os tutores. Verifique se a API está ligada.';
  } finally {
    carregando.value = false;
  }
}

function petsDoTutor(id) {
  return pets.value.filter((pet) => String(pet.tutorId) === String(id));
}

function cpfProtegido(cpfCnpj) {
  if (!cpfCnpj) return '-';
  return String(cpfCnpj).replace(/\D/g, '').length > 11 ? '**.***.***/****-**' : '***.***.***-**';
}

function telefoneFormatado(telefone) {
  const numeros = String(telefone || '').replace(/\D/g, '');
  if (numeros.length === 11) return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (numeros.length === 10) return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return telefone || '-';
}

async function removerTutor(tutor) {
  if (!window.confirm('Deseja realmente remover este tutor?')) return;

  try {
    const respostaPets = await fetch(`${API_URL}/pets?tutorId=${tutor.id}`);
    if (!respostaPets.ok) throw new Error();
    const vinculados = await respostaPets.json();

    if (vinculados.length > 0) {
      window.alert('Este tutor possui pets vinculados. Remova ou transfira os pets primeiro.');
      return;
    }

    const resposta = await fetch(`${API_URL}/tutores/${tutor.id}`, { method: 'DELETE' });
    if (!resposta.ok) throw new Error();
    tutores.value = tutores.value.filter((item) => item.id !== tutor.id);
  } catch {
    window.alert('Não foi possível remover o tutor. Confira a conexão com a API.');
  }
}

onMounted(carregarDados);
</script>

<template>
  <div>
    <header class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div>
        <h1 class="page-title mb-1">Listagem de Tutores</h1>
        <p class="text-body-secondary mb-0">Consulte os tutores cadastrados e seus pets.</p>
      </div>
      <RouterLink class="btn btn-primary" to="/tutores/novo">
        <i class="bi bi-plus-lg me-1"></i> Cadastrar tutor
      </RouterLink>
    </header>

    <div class="row mb-3">
      <div class="col-lg-7 col-xl-6">
        <input
          v-model="pesquisa"
          type="search"
          class="form-control"
          placeholder="Pesquisar tutor por nome, CPF/CNPJ ou e-mail"
          aria-label="Pesquisar tutores"
        />
      </div>
    </div>

    <p v-if="carregando">Carregando tutores...</p>
    <div v-else-if="erro" class="alert alert-danger">{{ erro }}</div>
    <template v-else>
      <div class="table-responsive">
        <table class="table table-bordered table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome completo</th>
              <th>CPF/CNPJ</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Pets (quantidade)</th>
              <th>Nomes dos pets</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tutor in tutoresFiltrados" :key="tutor.id">
              <td>{{ tutor.id }}</td>
              <td>{{ tutor.nome }}</td>
              <td>{{ cpfProtegido(tutor.cpfCnpj) }}</td>
              <td>{{ telefoneFormatado(tutor.telefone) }}</td>
              <td>{{ tutor.email || '-' }}</td>
              <td class="text-center">{{ petsDoTutor(tutor.id).length }}</td>
              <td>
                {{ petsDoTutor(tutor.id).map((pet) => pet.nome).join(' / ') || 'Nenhum pet vinculado' }}
              </td>
              <td>
                <div class="d-flex gap-2">
                  <RouterLink class="btn btn-sm btn-outline-primary" :to="`/tutores/${tutor.id}`">
                    <i class="bi bi-eye me-1"></i> Visualizar
                  </RouterLink>
                  <button class="btn btn-sm btn-outline-danger" type="button" @click="removerTutor(tutor)">
                    <i class="bi bi-trash me-1"></i> Remover
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="tutoresFiltrados.length === 0">
              <td colspan="8" class="text-center text-body-secondary py-4">
                Nenhum tutor encontrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-body-secondary">Exibindo {{ tutoresFiltrados.length }} tutores</p>
    </template>
  </div>
</template>
