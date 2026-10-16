# PetSchool: atividade de tutores

Este projeto contém as telas de pets e tutores da atividade, usando Vue 3, Bootstrap, Vue Router, `fetch` e JSON Server.

## Como executar

Abra **dois terminais**, ambos dentro da pasta `pet-school`.

No primeiro terminal, instale as dependências (só é necessário na primeira vez) e ligue a API:

```bash
npm install
npm run api
```

No segundo terminal, inicie o site:

```bash
npm run resenha
```

Abra o endereço informado pelo Vite (normalmente `http://localhost:5173`). A API deve continuar ligada na porta `3000` para os cadastros funcionarem.

## Telas

- `/pets`: listar pets
- `/pets/novo`: cadastrar pet e selecionar tutor
- `/pets/:id`: visualizar pet (e removê-lo, se necessário)
- `/tutores`: listar e pesquisar tutores, contar seus pets, visualizar e remover
- `/tutores/novo`: cadastrar tutor
- `/tutores/:id`: dados do tutor, pets vinculados e cadastro direto de pets

Os campos nome e telefone são obrigatórios no cadastro do tutor. O formulário também aceita CPF/CNPJ, e-mail, data de nascimento e endereço, mas eles são opcionais. Os campos de telefone, CPF/CNPJ e CEP recebem formatação ao digitar.

A aplicação impede excluir um tutor que ainda tenha pets. Para removê-lo, entre nos detalhes de cada pet, remova os pets e depois exclua o tutor.

Os registros ficam salvos em `db.json` pelo JSON Server. O identificador é gerado pelo servidor.
