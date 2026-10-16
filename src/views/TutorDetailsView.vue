<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

const API_URL = 'http://localhost:3000';
const route = useRoute();
const router = useRouter();
const tutorId = route.params.id;
const tutor = ref(null);
const pets = ref([]);
const novoPet = ref({ nome: '', especie: '' });
const carregando = ref(true);
const salvando = ref(false);
const erro = ref('');
const erroPet = ref('');

async function carregarPets() {
  const resposta = await fetch(`${API_URL}/pets?tutorId=${encodeURIComponent(tutorId)}`);
  if (!resposta.ok) throw new Error();
  pets.value = await resposta.json();
}

async function carregarDados() {
  try {
    const resposta = await fetch(`${API_URL}/tutores/${encodeURIComponent(tutorId)}`);
    if (!resposta.ok) throw new Error();
    tutor.value = await resposta.json();
    await carregarPets();
  } catch {
    erro.value = 'Não foi possível encontrar este tutor. Verifique se a API está ligada.';
  } finally {
    carregando.value = false;
  }
}

function telefoneFormatado(telefone) {
  const numeros = String(telefone || '').replace(/\D/g, '');
  if (numeros.length === 11) return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (numeros.length === 10) return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return telefone || '-';
}

function cpfProtegido(cpfCnpj) {
  if (!cpfCnpj) return '-';
  return cpfCnpj.replace(/\D/g, '').length > 11 ? '**.***.***/****-**' : '***.***.***-**';
}

async function cadastrarPet() {
  salvando.value = true;
  erroPet.value = '';

  try {
    const resposta = await fetch(`${API_URL}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: novoPet.value.nome.trim(),
        especie: novoPet.value.especie,
        tutorId: String(tutorId),
      }),
    });
    if (!resposta.ok) throw new Error();
    novoPet.value = { nome: '', especie: '' };
    await carregarPets();
  } catch {
    erroPet.value = 'Não foi possível cadastrar o pet. Tente novamente.';
  } finally {
    salvando.value = false;
  }
}

async function removerTutor() {
  if (!window.confirm('Deseja realmente remover este tutor?')) return;

  try {
    await carregarPets();
    if (pets.value.length > 0) {
      window.alert('Este tutor possui pets vinculados. Remova ou transfira os pets primeiro.');
      return;
    }

    const resposta = await fetch(`${API_URL}/tutores/${encodeURIComponent(tutorId)}`, {
      method: 'DELETE',
    });
    if (!resposta.ok) throw new Error();
    router.push('/tutores');
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
        <h1 class="page-title mb-1">Detalhes do Tutor</h1>
        <p class="text-body-secondary mb-0">Visualize os dados do tutor e cadastre pets vinculados.</p>
      </div>
      <RouterLink class="btn btn-outline-primary" to="/tutores">
        <i class="bi bi-arrow-left me-1"></i> Voltar para tutores
      </RouterLink>
    </header>

    <p v-if="carregando">Carregando tutor...</p>
    <div v-else-if="erro" class="alert alert-danger">{{ erro }}</div>
    <template v-else-if="tutor">
      <section class="section-card">
        <h2 class="section-card-title fs-5">Dados do Tutor</h2>
        <div class="section-card-body">
          <div class="row g-3">
            <div class="col-md-4"><div class="info-label">ID</div>{{ tutor.id }}</div>
            <div class="col-md-4"><div class="info-label">Nome completo</div>{{ tutor.nome }}</div>
            <div class="col-md-4"><div class="info-label">CPF/CNPJ</div>{{ cpfProtegido(tutor.cpfCnpj) }}</div>
            <div class="col-md-4"><div class="info-label">Telefone / Celular / WhatsApp</div>{{ telefoneFormatado(tutor.telefone) }}</div>
            <div class="col-md-4"><div class="info-label">E-mail</div>{{ tutor.email || '-' }}</div>
            <div class="col-md-4"><div class="info-label">Data de nascimento</div>{{ tutor.dataNascimento ? tutor.dataNascimento.split('-').reverse().join('/') : '-' }}</div>
          </div>
        </div>
      </section>

      <section v-if="tutor.rua || tutor.numero || tutor.bairro || tutor.cidade || tutor.estado || tutor.cep" class="section-card">
        <h2 class="section-card-title fs-5">Endereço</h2>
        <div class="section-card-body">
          <div class="row g-3">
            <div class="col-md-4"><div class="info-label">Rua</div>{{ tutor.rua || '-' }}</div>
            <div class="col-md-4"><div class="info-label">Número</div>{{ tutor.numero || '-' }}</div>
            <div class="col-md-4"><div class="info-label">Bairro</div>{{ tutor.bairro || '-' }}</div>
            <div class="col-md-4"><div class="info-label">Cidade</div>{{ tutor.cidade || '-' }}</div>
            <div class="col-md-4"><div class="info-label">Estado</div>{{ tutor.estado || '-' }}</div>
            <div class="col-md-4"><div class="info-label">CEP</div>{{ tutor.cep || '-' }}</div>
          </div>
        </div>
      </section>

      <section class="section-card">
        <h2 class="section-card-title fs-5">Pets do Tutor</h2>
        <div class="section-card-body">
          <div class="row g-3">
            <div class="col-lg-7">
              <div class="border rounded h-100">
                <h3 class="section-card-title fs-6">
                  Pets vinculados <span class="badge bg-primary ms-1">{{ pets.length }} pets</span>
                </h3>
                <div class="table-responsive">
                  <table class="table table-striped mb-0">
                    <thead>
                      <tr><th>ID</th><th>Nome</th><th>Espécie</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="pet in pets" :key="pet.id">
                        <td>{{ pet.id }}</td>
                        <td>{{ pet.nome }}</td>
                        <td>{{ pet.especie }}</td>
                        <td>
                          <RouterLink :to="`/pets/${pet.id}`" class="btn btn-sm btn-outline-primary">
                            Visualizar
                          </RouterLink>
                        </td>
                      </tr>
                      <tr v-if="pets.length === 0">
                        <td colspan="4" class="text-center text-body-secondary py-4">Nenhum pet vinculado a este tutor.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="col-lg-5">
              <form class="border rounded p-3 h-100" @submit.prevent="cadastrarPet">
                <h3 class="fs-6 fw-semibold mb-1">Cadastrar novo pet</h3>
                <p class="small text-body-secondary">O pet será vinculado automaticamente a {{ tutor.nome }}.</p>
                <div class="mb-3">
                  <label for="nomePet" class="form-label">Nome do pet</label>
                  <input id="nomePet" v-model="novoPet.nome" class="form-control" required maxlength="100" placeholder="Digite o nome do pet" />
                </div>
                <div class="mb-3">
                  <label for="especiePet" class="form-label">Espécie</label>
                  <select id="especiePet" v-model="novoPet.especie" class="form-select" required>
                    <option value="" disabled>Selecione</option>
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <p v-if="erroPet" class="text-danger small">{{ erroPet }}</p>
                <button type="submit" class="btn btn-success w-100" :disabled="salvando || !novoPet.nome.trim() || !novoPet.especie">
                  {{ salvando ? 'Salvando...' : 'Cadastrar pet' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <button class="btn btn-outline-danger" type="button" @click="removerTutor">
        <i class="bi bi-trash me-1"></i> Remover tutor
      </button>
    </template>
  </div>
</template>
