# Impacta Bank

Aplicacao front-end simples desenvolvida durante o curso da Impacta. O projeto simula um fluxo basico de internet banking, sem back-end, banco de dados ou autenticacao real. Todos os dados ficam em estado local no navegador enquanto a pagina esta aberta.

## Sobre o projeto

O Impacta Bank foi criado como um prototipo para praticar construcao de interfaces, estado em React e fluxos de navegacao em uma aplicacao Next.js.

O app permite:

- criar uma conta de usuario com nome, e-mail e senha;
- fazer login em uma sessao simulada;
- selecionar uma conta corrente ou poupanca para iniciar;
- visualizar saldo e extrato;
- filtrar transacoes por periodo;
- depositar dinheiro;
- sacar dinheiro;
- transferir para uma conta favorecida;
- sair da sessao e voltar para o login.

## Caracteristicas

- Front-end only: nao possui API, persistencia externa ou integracao bancaria real.
- Mobile first e responsivo: a interface foi pensada primeiro para telas pequenas, mas tambem se adapta ao desktop.
- Estado local: saldos, transacoes, usuario logado e conta selecionada sao controlados com `useState`.
- Fluxo completo de sessao: cadastro, login, selecao de conta, area autenticada e logout.
- Prototipo didatico: o foco e demonstrar comportamento e navegacao, nao regras financeiras reais.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS

## Como rodar

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run start
```

## Observacoes

Este projeto e apenas um exercicio academico. Valores, contas, favorecidos e transacoes sao dados ficticios usados para representar o fluxo visual de um banco digital.
