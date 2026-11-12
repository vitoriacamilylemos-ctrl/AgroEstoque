
# AgroEstoque 🌱

## Sobre o projeto

O AgroEstoque é um aplicativo de controle de estoque de insumos agrícolas, desenvolvido como projeto acadêmico do curso de Agrocomputação da UniSENAI.

Seu objetivo é ajudar no gerenciamento de produtos utilizados em atividades agrícolas, permitindo cadastrar insumos, controlar quantidades, registrar movimentações e acompanhar alertas de estoque e validade.

## Tecnologias utilizadas

- React Native
- Expo (SDK 54)
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Expo Router

## Funcionalidades

### Autenticação
- Login com e-mail e senha.
- Autenticação pelo Firebase.
- Encerramento de sessão (logout).

### Cadastro de insumos
- Cadastro de produtos agrícolas.
- Edição de informações.
- Exclusão com confirmação.
- Registro de nome, categoria, unidade, quantidade, estoque mínimo e validade.

### Controle de estoque
- Visualização dos insumos cadastrados.
- Pesquisa por nome.
- Filtro por categoria.
- Alerta de estoque baixo.
- Alerta de produtos vencidos ou próximos do vencimento.

### Movimentações
- Registro de entrada de produtos.
- Registro de saída de produtos.
- Bloqueio de saídas superiores ao estoque disponível.
- Identificação de saídas como Plantada ou Vendida.
- Registro do nome da fazenda quando o produto é plantado.
- Registro do nome do comprador quando o produto é vendido.
- Histórico de movimentações.

### Painel inicial
- Quantidade de produtos cadastrados.
- Indicadores de estoque baixo.
- Indicadores de produtos próximos do vencimento.

## Estrutura do Firebase

O aplicativo utiliza o Firebase Authentication para autenticação e o Cloud Firestore para armazenamento dos dados.

### Coleção: insumos

Cada documento representa um insumo agrícola.

Campos utilizados:
- nome
- categoria
- unidade
- quantidade
- estoqueMinimo
- validade

### Subcoleção: movimentacoes

Caminho: insumos/{id}/movimentacoes

Cada movimentação registra:
- insumoId
- nomeInsumo
- tipo (entrada ou saida)
- quantidade
- data
- destinoSaida (quando aplicável)
- nomeFazenda (quando aplicável)
- nomeComprador (quando aplicável)

Os registros criados antes da mudança de estrutura permanecem na coleção principal "movimentacoes". O histórico do aplicativo consulta os dois locais.

## Como executar o projeto

### Requisitos
- Node.js instalado.
- npm.
- VS Code ou outro editor de código.
- Acesso a um projeto Firebase configurado.

### Instalação

1. Baixe ou clone o repositório.
2. Abra a pasta do projeto no terminal.
3. Instale as dependências:

```bash
npm install
```

4. Configure o arquivo firebase.ts com as informações do seu projeto Firebase.
5. No Firebase, habilite a autenticação por e-mail e senha e configure o Cloud Firestore.
6. Inicie o aplicativo:

```bash
npx expo start
```

7. Para abrir a versão web, pressione a tecla `w` no terminal do Expo.

No Windows PowerShell, caso a execução dos comandos npm esteja bloqueada, utilize:

```powershell
npm.cmd install
npx.cmd expo start
```

## Principais telas

- Login
- Painel inicial
- Cadastro e edição de insumos
- Listagem de estoque
- Registro de movimentações
- Histórico de movimentações

## Organização do projeto

- app/: telas e rotas do aplicativo.
- components/: formulários e componentes de interface.
- hooks/: funções reutilizáveis para consulta e atualização de dados.
- firebase.ts: configuração da conexão com o Firebase.

## Objetivo acadêmico

O projeto permite aplicar conhecimentos de desenvolvimento mobile com React Native e Expo, autenticação de usuários, operações CRUD, integração com banco de dados em nuvem e controle de estoque agrícola.

## Melhorias futuras

- Relatórios de entradas e saídas.
- Exportação de dados.
- Controle de acesso por usuário.
- Indicadores de consumo de insumos por fazenda.
- Aprimoramento da organização dos registros históricos.
