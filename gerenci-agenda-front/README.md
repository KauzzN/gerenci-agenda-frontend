# GerenciAgenda — frontend

Interface web do GerenciAgenda, composta por um painel autenticado para
profissionais e por uma página pública de agendamento para clientes. O
frontend consome a API Django do repositório
[`gerenci-agenda`](../../gerenci-agenda).

## Funcionalidades

### Área do profissional

- Login e cadastro.
- Validação da sessão antes de liberar rotas privadas.
- Renovação automática de JWT quando o access token expira.
- Dashboard com agenda do dia, próximo atendimento e indicadores.
- Criação, edição e cancelamento de agendamentos.
- Histórico com busca por cliente ou serviço.
- Lista de clientes vinculados, com busca por nome ou telefone.
- Cadastro, edição, ativação/desativação e consulta de serviços.
- Configuração de perfil público, slug, dias de funcionamento, expediente e
  intervalo.

### Fluxo público

- Acesso por `/book/:slug`.
- Exibição do perfil e dos serviços ativos do profissional.
- Identificação do cliente por nome e telefone.
- Seleção de um ou mais serviços.
- Seleção de data e horários retornados pela API.
- Revisão e confirmação do agendamento.
- Tratamento de sessão do cliente, conflito de horário e erros da API.

O calendário considera os dias configurados pelo profissional. A API continua
sendo a autoridade final: ela valida dias, expediente, intervalo, serviços
ativos, vínculo do cliente e conflitos antes de criar o agendamento.

## Tecnologias

- React 19.2.7.
- Vite 8.1.0.
- React Router DOM 7.18.0.
- Axios 1.18.1.
- `lucide-react` para ícones.
- `react-hot-toast` para feedback.
- Vitest 5.0.1, Testing Library e jsdom para testes.
- Oxlint 1.69.0 para lint.

As versões estão registradas em [`package.json`](./package.json) e
[`package-lock.json`](./package-lock.json). O projeto não declara uma versão
mínima de Node em `package.json`; use uma versão compatível com essas versões
do Vite e do ecossistema React.

## Arquitetura e estrutura

```text
src/
  App.jsx                 rotas e fallback da aplicação
  components/             componentes visuais reutilizáveis
  contexts/               autenticação profissional e de cliente
  hooks/                  hooks compartilhados
  pages/                  telas privadas, autenticação e booking público
  routes/                 proteção de rotas privadas
  services/               clientes HTTP e operações da API
  styles/                 estilos globais e de autenticação
  utils/                  tokens, datas, links e transições de status
```

O cliente Axios profissional usa `access_token` e `refresh_token` no
`localStorage`. O fluxo público usa chaves separadas
`client_access_token` e `client_refresh_token`. Os interceptors renovam o
token uma vez após `401`; se a renovação falhar, a sessão correspondente é
limpa.

Não existe endpoint de logout no backend. O logout disponível na interface é
local, removendo os tokens armazenados no navegador.

## Rotas do frontend

| Rota | Acesso | Tela |
|---|---|---|
| `/` | Público | Login |
| `/register` | Público | Cadastro |
| `/book/:slug` | Público | Agendamento do cliente |
| `/dashboard` | Profissional | Dashboard e agenda |
| `/configuracoes` | Profissional | Perfil e expediente |
| `/servicos` | Profissional | Catálogo de serviços |
| `/clientes` | Profissional | Clientes vinculados |
| `/historico` | Profissional | Histórico |

Rotas não reconhecidas exibem uma página de fallback.

## Pré-requisitos e instalação

É necessário ter Node.js e npm instalados. O repositório usa `package-lock.json`,
portanto a instalação reproduzível é:

```bash
npm ci
```

Para desenvolvimento:

```bash
Copy-Item .env.example .env   # PowerShell
# ou: cp .env.example .env
npm run dev
```

O servidor Vite fornece a porta indicada no terminal. A variável
`VITE_API_URL` deve apontar para a URL base da API, incluindo o prefixo `/api`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Em produção, substitua o endereço local pela URL pública real da API. As
variáveis `VITE_*` são incorporadas ao bundle no build e não devem conter
segredos.

## Integração com a API

O frontend chama os seguintes grupos de endpoints relativos a
`VITE_API_URL`:

| Serviço da interface | Endpoints principais |
|---|---|
| Autenticação profissional | `/usr/register`, `/usr/login`, `/usr/me`, `/usr/refresh` |
| Perfil e configurações | `/usr/me/profile`, `/usr/update` |
| Dashboard e agenda | `/agendar/dashboard`, `/agendar/read`, `/agendar/create`, `/agendar/update/:id`, `/agendar/status/:id` |
| Histórico | `/agendar/historico` |
| Serviços | `/serv/create`, `/serv/read`, `/serv/update/:id` |
| Clientes | `/cli/teste/:slug`, `/cli/read/clients` |
| Booking público | `/public/:slug/barbearia`, `/public/:slug/horarios`, `/public/:slug/agendar` |

As requisições de escrita enviam JSON. O backend retorna erros normalmente no
formato `{ "error": "mensagem" }`, e a interface diferencia falhas de rede,
erros de API, respostas vazias e respostas inválidas.

### Fluxo público de disponibilidade

1. A interface carrega o perfil público e os serviços ativos.
2. O cliente informa nome e telefone em `/cli/teste/:slug`.
3. Após selecionar serviços, a interface consulta
   `/public/:slug/horarios` com `data` e `servicos`.
4. O cliente confirma o horário em `/public/:slug/agendar`.

A seleção de data no frontend filtra os dias configurados, mas o backend
também rejeita uma data desabilitada ou um horário fora das regras. A
configuração vazia não é convertida em autorização para agendar.

## Estados de interface

As páginas usam componentes compartilhados `LoadingState`, `ErrorState` e
`EmptyState`. Histórico, clientes, serviços e configurações limpam dados
anteriores durante uma nova carga, exibem erro com opção de tentativa
novamente e diferenciam lista vazia de falha de API. A autenticação mostra
estado de verificação enquanto `/usr/me` valida a sessão.

O dashboard carrega perfil, indicadores e agenda separadamente, para que uma
falha em uma seção não bloqueie toda a tela. Requisições concorrentes usam
identificadores para evitar que uma resposta antiga substitua dados mais
recentes.

## Scripts

```bash
npm run dev       # servidor Vite com HMR
npm run build     # build de produção em dist/
npm run preview   # serve o build localmente
npm run lint      # Oxlint
npm test          # Vitest em modo run
```

Os testes são executados com `npm test`; não há script E2E ou comando de
deploy versionado neste repositório.

## Build e publicação

```bash
npm run lint
npm test
npm run build
```

O resultado do Vite é gerado em `dist/` e precisa ser publicado pelo ambiente
de hospedagem do frontend. Este repositório não contém a configuração do
provedor de hospedagem; domínio, cache, fallback de SPA e comando de
publicação devem ser confirmados nesse ambiente.

## Limitações documentais

- O repositório não declara uma versão mínima de Node.js.
- O provedor, o domínio e o comando de deploy do frontend não estão
  versionados aqui.
- A validação em dispositivos físicos, Safari/iOS, teclado virtual e leitores
  de tela não é substituída pelos testes automatizados.
