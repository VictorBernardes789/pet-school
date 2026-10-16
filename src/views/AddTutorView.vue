<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const API_URL = 'http://localhost:3000';
const router = useRouter();
const tutor = ref({
  nome: '',
  telefone: '',
  cpfCnpj: '',
  email: '',
  dataNascimento: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
});
const tocouNome = ref(false);
const tocouTelefone = ref(false);
const salvando = ref(false);
const erro = ref('');

function somenteNumeros(valor) {
  return String(valor).replace(/\D/g, '');
}

function mascararTelefone(evento) {
  const numeros = somenteNumeros(evento.target.value).slice(0, 11);
  if (numeros.length <= 2) {
    tutor.value.telefone = numeros ? `(${numeros}` : '';
  } else if (numeros.length <= 6) {
    tutor.value.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  } else if (numeros.length <= 10) {
    tutor.value.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  } else {
    tutor.value.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }
}

function mascararCpfCnpj(evento) {
  const numeros = somenteNumeros(evento.target.value).slice(0, 14);
  if (numeros.length <= 11) {
    tutor.value.cpfCnpj = numeros
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  } else {
    tutor.value.cpfCnpj = numeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
}

function mascararCep(evento) {
  const numeros = somenteNumeros(evento.target.value).slice(0, 8);
  tutor.value.cep = numeros.replace(/^(\d{5})(\d)/, '$1-$2');
}

const nomeValido = computed(() => tutor.value.nome.trim().length > 0);
const telefoneValido = computed(() => {
  const tamanho = somenteNumeros(tutor.value.telefone).length;
  return tamanho === 10 || tamanho === 11;
});
const emailValido = computed(() =>
  !tutor.value.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutor.value.email),
);
const cpfCnpjValido = computed(() => {
  const tamanho = somenteNumeros(tutor.value.cpfCnpj).length;
  return tamanho === 0 || tamanho === 11 || tamanho === 14;
});
const cepValido = computed(() => {
  const tamanho = somenteNumeros(tutor.value.cep).length;
  return tamanho === 0 || tamanho === 8;
});
const formularioValido = computed(() =>
  nomeValido.value && telefoneValido.value && emailValido.value &&
  cpfCnpjValido.value && cepValido.value,
);

async function salvarTutor() {
  tocouNome.value = true;
  tocouTelefone.value = true;
  if (!formularioValido.value) return;

  salvando.value = true;
  erro.value = '';

  const dados = {
    nome: tutor.value.nome.trim(),
    telefone: somenteNumeros(tutor.value.telefone),
  };

  for (const campo of ['cpfCnpj', 'email', 'dataNascimento', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'cep']) {
    if (tutor.value[campo]) dados[campo] = tutor.value[campo].trim();
  }

  try {
    const resposta = await fetch(`${API_URL}/tutores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!resposta.ok) throw new Error();
    router.push('/tutores');
  } catch {
    erro.value = 'Não foi possível cadastrar o tutor. Verifique se a API está ligada.';
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <div>
    <header class="mb-3">
      <h1 class="page-title mb-1">Cadastrar Tutor</h1>
      <p class="text-body-secondary">Preencha os dados para cadastrar um novo tutor.</p>
    </header>

    <div v-if="erro" class="alert alert-danger">{{ erro }}</div>
    <form @submit.prevent="salvarTutor">
      <h2 class="fs-5 border-bottom pb-2">Dados do Tutor</h2>
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <label class="form-label" for="id">ID</label>
          <input id="id" class="form-control" value="Gerado automaticamente" disabled />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="nome">Nome completo *</label>
          <input
            id="nome"
            v-model="tutor.nome"
            class="form-control"
            :class="{ 'is-invalid': tocouNome && !nomeValido }"
            maxlength="120"
            placeholder="Digite o nome completo"
            @blur="tocouNome = true"
          />
          <div v-if="tocouNome && !nomeValido" class="invalid-feedback d-block">
            Ops, campo obrigatório, por favor preencha-o!
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="cpfCnpj">CPF / CNPJ</label>
          <input
            id="cpfCnpj"
            :value="tutor.cpfCnpj"
            class="form-control"
            :class="{ 'is-invalid': !cpfCnpjValido }"
            placeholder="Digite o CPF ou CNPJ"
            inputmode="numeric"
            @input="mascararCpfCnpj"
          />
          <div class="form-text">A máscara muda conforme 11 dígitos (CPF) ou 14 dígitos (CNPJ).</div>
          <div v-if="!cpfCnpjValido" class="text-danger small">
            Informe 11 dígitos para CPF ou 14 para CNPJ.
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="telefone">Telefone / Celular / WhatsApp *</label>
          <input
            id="telefone"
            :value="tutor.telefone"
            class="form-control"
            :class="{ 'is-invalid': tocouTelefone && !telefoneValido }"
            placeholder="(00) 00000-0000"
            inputmode="tel"
            @input="mascararTelefone"
            @blur="tocouTelefone = true"
          />
          <div v-if="tocouTelefone && !somenteNumeros(tutor.telefone)" class="invalid-feedback d-block">
            Ops, campo obrigatório, por favor preencha-o!
          </div>
          <div v-else-if="tocouTelefone && !telefoneValido" class="invalid-feedback d-block">
            Informe um telefone com DDD (10 ou 11 dígitos).
          </div>
          <div class="form-text">Formato: (00) 00000-0000</div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="email">E-mail</label>
          <input
            id="email"
            v-model="tutor.email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': !emailValido }"
            placeholder="nome@example.com"
          />
          <div v-if="!emailValido" class="invalid-feedback d-block">Informe um e-mail válido.</div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="nascimento">Data de nascimento</label>
          <input id="nascimento" v-model="tutor.dataNascimento" type="date" class="form-control" />
        </div>
      </div>

      <h2 class="fs-5 border-bottom pb-2">Endereço</h2>
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <label class="form-label" for="rua">Rua</label>
          <input id="rua" v-model="tutor.rua" class="form-control" placeholder="Digite o nome da rua" />
        </div>
        <div class="col-md-4">
          <label class="form-label" for="numero">Número</label>
          <input id="numero" v-model="tutor.numero" class="form-control" placeholder="Número" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="bairro">Bairro</label>
          <input id="bairro" v-model="tutor.bairro" class="form-control" placeholder="Digite o bairro" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="cidade">Cidade</label>
          <input id="cidade" v-model="tutor.cidade" class="form-control" placeholder="Digite a cidade" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="estado">Estado</label>
          <select id="estado" v-model="tutor.estado" class="form-select">
            <option value="">Selecione</option>
            <option v-for="uf in ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']" :key="uf" :value="uf">{{ uf }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="cep">CEP</label>
          <input
            id="cep"
            :value="tutor.cep"
            class="form-control"
            :class="{ 'is-invalid': !cepValido }"
            placeholder="00000-000"
            inputmode="numeric"
            @input="mascararCep"
          />
          <div v-if="!cepValido" class="invalid-feedback d-block">O CEP deve ter 8 dígitos.</div>
        </div>
      </div>

      <p v-if="!formularioValido" class="alert alert-primary py-2">
        <i class="bi bi-info-circle me-1"></i>
        Preencha corretamente Nome e Telefone para habilitar o cadastro.
      </p>
      <div class="d-flex justify-content-end gap-2">
        <RouterLink to="/tutores" class="btn btn-outline-secondary">Cancelar</RouterLink>
        <button type="submit" class="btn btn-primary" :disabled="!formularioValido || salvando">
          {{ salvando ? 'Salvando...' : 'Cadastrar tutor' }}
        </button>
      </div>
    </form>
  </div>
</template>
