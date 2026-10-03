Read , lines 500 to 650
Completed with input: {
  "path": "D:\\Projetos\\gerenci-agenda.worktrees\\fix-critical-1-3\\agendamento\\views.py",
  "view_range": [
    500,
    650
  ]
}

Read , lines 1 to 180
Completed with input: {
  "path": "D:\\Projetos\\gerenci-agenda.worktrees\\fix-critical-1-3\\users\\services\\token_services.py",
  "view_range": [
    1,
    180
  ]
}

Read , lines 35 to 210
Completed with input: {
  "path": "D:\\Projetos\\gerenci-agenda.worktrees\\fix-critical-1-3\\core\\settings.py",
  "view_range": [
    35,
    210
  ]
}

Read , lines 1 to 120
Completed with input: {
  "path": "D:\\Projetos\\gerenci-agenda.worktrees\\fix-critical-1-3\\servicos\\models.py",
  "view_range": [
    1,
    120
  ]
}

# GerenciAgenda — Guia da API para o frontend React

Este documento descreve o contrato atual da API na worktree do backend, incluindo autenticação, URLs, payloads, respostas, regras de autorização, estados e comportamento esperado do frontend.

O frontend deve consumir a API respeitando exatamente os formatos abaixo. Onde o backend ainda possui comportamento provisório ou inconsistente, isso está indicado explicitamente.

---

# 1. Arquitetura geral

## Backend

- Django.
- API HTTP/JSON.
- PostgreSQL em produção.
- SQLite durante parte do desenvolvimento/testes.
- JWT para autenticação da API.
- Django Admin continua utilizando sessão/cookies próprios.
- A API não deve utilizar autenticação por sessão/cookie.

## Frontend

- React.
- Deve enviar o access token no header:

```http
Authorization: Bearer <access_token>
```

- Não deve enviar token em cookie.
- Não precisa enviar `X-CSRFToken` para autenticar chamadas JWT da API.
- Deve enviar JSON nas requisições com corpo.

## Base URL

No backend, as URLs são incluídas sob:

```text
/api
```

Portanto, os endpoints completos são, por exemplo:

```text
/api/usr/login
/api/serv/create
/api/agendar/read
/api/public/<slug>/agendar
```

O `core.urls` inclui os módulos com o prefixo `/api`.

---

# 2. Headers padrão

## Requisições sem autenticação

Usadas em:

- login;
- registro profissional;
- entrada inicial do cliente;
- refresh token.

Headers recomendados:

```http
Content-Type: application/json
Accept: application/json
```

## Requisições autenticadas

Headers obrigatórios:

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <access_token>
```

Exemplo:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

O prefixo precisa ser exatamente:

```text
Bearer 
```

com espaço entre `Bearer` e o token.

---

# 3. Autenticação e tokens

## Access token

O access token é um JWT contendo atualmente:

```json
{
  "sub": "id-do-usuario",
  "username": "usuario",
  "iat": 1720000000,
  "exp": 1720000900,
  "jti": "uuid-do-token"
}
```

Características:

- validade aproximada: 15 minutos;
- enviado no header `Authorization`;
- não é enviado por cookie;
- expirado retorna HTTP `401`.

## Refresh token

O refresh token:

- é um token aleatório;
- não é JWT;
- é retornado no login/registro;
- deve ser enviado no corpo JSON para `/api/usr/refresh`;
- não é enviado no header `Authorization`;
- não é armazenado pelo backend em cookie;
- possui validade aproximada de 7 dias;
- é armazenado no banco somente como hash;
- a geração de um novo conjunto de tokens revoga refresh tokens anteriores do mesmo usuário.

## Armazenamento no React

A API retorna os tokens no JSON. O backend não controla como o React os armazena.

O frontend deve:

- manter o access token em memória sempre que possível;
- evitar `localStorage` devido ao risco de XSS;
- não registrar tokens no console;
- não enviar tokens para serviços de analytics;
- não incluir tokens em mensagens de erro;
- usar o refresh token somente no endpoint de refresh.

## Fluxo recomendado para access token expirado

1. O frontend faz uma requisição com o access token.
2. A API retorna `401`.
3. O frontend envia o refresh token para:

```http
POST /api/usr/refresh
```

4. A API retorna novo access token e novo refresh token.
5. O frontend substitui os tokens armazenados.
6. O frontend repete a requisição original uma única vez.
7. Se o refresh falhar, o frontend limpa a sessão local e redireciona para login.

Não deve haver loop infinito de refresh.

---

# 4. Tratamento global de respostas

## Erros

O formato esperado das respostas de erro é:

```json
{
  "error": "mensagem do erro"
}
```

O frontend deve tratar pelo status HTTP e não somente pelo texto da mensagem.

## Status mais importantes

| Status | Significado |
|---|---|
| `200` | Operação concluída |
| `201` | Recurso criado |
| `400` | Payload inválido ou regra de negócio rejeitada |
| `401` | Token ausente, inválido ou expirado |
| `403` | Usuário autenticado, mas sem papel ou relacionamento permitido |
| `404` | Recurso inexistente ou não pertencente ao usuário |
| `405` | Método HTTP incorreto |
| `409` | Conflito, principalmente horário já ocupado |

## Interceptor recomendado

O cliente HTTP do React deve possuir um interceptor que:

- anexa `Authorization` automaticamente;
- trata `401`;
- tenta refresh uma vez;
- evita refresh concorrente duplicado;
- limpa autenticação quando o refresh falhar;
- preserva o erro original para a interface.

---

# 5. Papéis do sistema

## Profissional

É um `User` que possui:

```text
Profile
```

O profissional pode:

- gerenciar o próprio perfil;
- gerenciar os próprios serviços;
- visualizar os próprios clientes relacionados;
- criar agendamentos para clientes relacionados;
- visualizar a própria agenda;
- atualizar/cancelar os próprios agendamentos.

## Cliente

É um `User` que possui:

```text
Cliente
```

O cliente pode:

- consultar o próprio perfil;
- consultar perfil e horários de profissionais conforme o fluxo público;
- criar agendamento somente quando possuir relação ativa com o profissional;
- consultar a agenda pública autorizada.

## Relação cliente-profissional

A relação é representada por:

```text
ClienteProfissional
```

Campos importantes:

```text
cliente
profile
ativo
```

Para criação pública de agendamento, a relação precisa existir e estar ativa.

---

# 6. Endpoints de usuários

## 6.1 Registrar profissional

```http
POST /api/usr/register
```

Autenticação:

- pública.

Payload:

```json
{
  "username": "barbeiro01",
  "email": "barbeiro@example.com",
  "password": "senha"
}
```

Campos obrigatórios:

- `username`;
- `email`;
- `password`.

Comportamento:

- cria `User`;
- cria `Profile`;
- gera access token;
- gera refresh token.

Sucesso:

```http
200 OK
```

Resposta conceitual:

```json
{
  "message": "usuário criado com sucesso",
  "tokens": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

Erros:

- `400` se campos estiverem ausentes;
- `400` se username já existir;
- `405` se o método não for `POST`.

Observação para o frontend:

- após o registro, tratar o usuário como autenticado;
- salvar os tokens conforme a política definida;
- direcionar o profissional para a configuração do perfil.

---

## 6.2 Login

```http
POST /api/usr/login
```

Autenticação:

- pública.

Payload:

```json
{
  "username": "barbeiro01",
  "password": "senha"
}
```

Sucesso:

```http
200 OK
```

Resposta:

```json
{
  "message": "autenticação concluída",
  "tokens": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

Erros:

- `401` para username inválido ou senha ausente;
- `404` quando o usuário não é autenticado pelo backend;
- `405` para método incorreto.

Frontend:

- salvar os dois tokens;
- usar somente o access token no header das chamadas normais;
- não enviar o refresh token em chamadas comuns.

---

## 6.3 Consultar usuário autenticado

```http
GET /api/usr/me
```

Autenticação:

- JWT obrigatório.

Resposta:

```json
{
  "id": 1,
  "username": "barbeiro01",
  "email": "barbeiro@example.com"
}
```

Erro:

```http
401 Unauthorized
```

quando o token estiver ausente, inválido ou expirado.

---

## 6.4 Atualizar perfil profissional

```http
PATCH /api/usr/update
```

Autenticação:

- JWT obrigatório.

O endpoint utiliza o `Profile` do usuário autenticado. Não recebe `profile_id`.

Payload:

Os campos de perfil e horário podem incluir:

```json
{
  "nome_negocio": "Barbearia Central",
  "telefone": "85999999999",
  "endereco": "Rua A, 100",
  "instagram": "@barbeariacentral",
  "descricao": "Barbearia masculina",
  "horario_inicio": "08:00",
  "horario_fim": "18:00",
  "inicio_almoco": "12:00",
  "fim_almoco": "13:00"
}
```

Sucesso:

```http
200 OK
```

Pode retornar:

```json
{
  "message": "profile atualizada",
  "profile": {
    "user": "barbeiro01",
    "public_slug": "barbearia-central",
    "nome_negocio": "Barbearia Central",
    "telefone": "85999999999",
    "endereco": "Rua A, 100",
    "instagram": "@barbeariacentral",
    "descricao": "Barbearia masculina",
    "inicio expediente": "08:00",
    "fim expediente": "18:00",
    "inicio almoço": "12:00",
    "fim almoço": "13:00"
  }
}
```

Se nenhum campo mudar:

```http
200 OK
```

```json
{
  "message": "nenhuma alteração realizada"
}
```

Se o usuário não possuir `Profile`:

```http
404 Not Found
```

---

## 6.5 Atualizar access token

```http
POST /api/usr/refresh
```

Autenticação:

- não utiliza access token;
- não utiliza sessão;
- não utiliza cookie.

Payload:

```json
{
  "refresh_token": "..."
}
```

Sucesso:

```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

Erros:

- `400` refresh token ausente;
- `400` token inválido;
- `400` token revogado;
- `400` token expirado.

---

## 6.6 Consultar perfil profissional autenticado

```http
GET /api/usr/me/profile
```

Autenticação:

- JWT obrigatório.

Resposta:

```json
{
  "public_slug": "barbearia-central",
  "nome_negocio": "Barbearia Central",
  "telefone": "85999999999"
}
```

Se o usuário não possuir perfil:

```http
404 Not Found
```

---

# 7. Endpoints de serviços

Todos os endpoints de serviço exigem:

```http
Authorization: Bearer <token-do-profissional>
```

O profissional só acessa serviços em que:

```text
Servico.user == request.user
```

---

## 7.1 Criar serviço

```http
POST /api/serv/create
```

Payload:

```json
{
  "nome": "Corte masculino",
  "preco": "35.00",
  "duracao": 30,
  "descricao": "Corte tradicional",
  "cor": "#000000"
}
```

Campos:

- `nome`: obrigatório;
- `preco`: número não negativo;
- `duracao`: inteiro maior que zero;
- `descricao`: texto de até 200 caracteres;
- `cor`: hexadecimal, por exemplo `#000000` ou `#FFF`.

Sucesso:

```http
201 Created
```

```json
{
  "message": "servico criado com sucesso!",
  "servico": {
    "nome": "Corte masculino",
    "preco": "35.00",
    "duracao": 30,
    "descricao": "Corte tradicional",
    "ativo": true,
    "cor": "#000000"
  }
}
```

Erros:

- `400` preço inválido;
- `400` preço negativo;
- `400` duração inválida;
- `400` nome ausente;
- `400` serviço duplicado;
- `403` usuário não é profissional.

---

## 7.2 Listar serviços do profissional

```http
GET /api/serv/read
```

Autenticação:

- profissional.

Resposta:

```json
{
  "serviços": [
    {
      "nome": "Corte masculino",
      "preco": "35.00",
      "duracao": 30,
      "descricao": "Corte tradicional",
      "cor": "#000000",
      "ativo": true
    }
  ]
}
```

Importante:

- a lista contém apenas serviços do profissional autenticado;
- serviços de outro profissional nunca devem ser exibidos.

---

## 7.3 Consultar um serviço

```http
GET /api/serv/read/<service_id>
```

Exemplo:

```http
GET /api/serv/read/12
```

Resposta:

```json
{
  "servico": {
    "nome": "Corte masculino",
    "preço": "35.00",
    "duracão": 30,
    "descrição": "Corte tradicional",
    "cor": "#000000",
    "ativo": true
  }
}
```

Se o serviço não pertencer ao profissional autenticado:

```http
404 Not Found
```

O frontend não deve interpretar isso como indicação de que o serviço existe para outro usuário.

---

## 7.4 Atualizar serviço

```http
PATCH /api/serv/update/<service_id>
```

Payload parcial:

```json
{
  "nome": "Corte e barba",
  "preco": "50.00",
  "duracao": 45,
  "ativo": true
}
```

Campos aceitos:

- `nome`;
- `preco`;
- `duracao`;
- `descricao`;
- `cor`;
- `ativo`.

Sucesso:

```http
200 OK
```

```json
{
  "message": "serviço atualizado",
  "serviço": {
    "nome": "Corte e barba",
    "preco": "50.00",
    "duracao": 45,
    "descricao": "Corte tradicional",
    "cor": "#000000",
    "ativo": true
  }
}
```

Se nada for alterado:

```json
{
  "message": "nenhuma alteração realizada"
}
```

Ownership:

- o `service_id` precisa pertencer ao profissional autenticado;
- outro profissional recebe `404`.

---

## 7.5 Excluir serviço

```http
DELETE /api/serv/delete/<service_id>
```

Autenticação:

- profissional.

Sucesso:

```http
200 OK
```

```json
{
  "message": "serviço deletado com sucesso"
}
```

Ownership:

- só pode excluir serviço próprio;
- serviço de outro profissional retorna `404`.

Observação:

- serviços relacionados a itens de agendamento podem estar protegidos por `PROTECT` no banco;
- o frontend deve tratar eventual erro de exclusão sem assumir que todo serviço pode ser removido fisicamente.

---

# 8. Endpoints de cliente

## 8.1 Entrada do cliente por profissional

```http
POST /api/cli/teste/<slug_barber>
```

Exemplo:

```http
POST /api/cli/teste/barbearia-central
```

Autenticação:

- pública;
- retorna tokens do cliente.

Payload:

```json
{
  "telefone": "85999999999",
  "nome": "João da Silva"
}
```

Comportamento atual:

- busca cliente pelo telefone;
- se não existir, cria `User` e `Cliente`;
- cria ou recupera `ClienteProfissional`;
- retorna tokens.

Sucesso:

```http
201 Created
```

Resposta:

```json
{
  "message": "cliente autenticado",
  "cliente": {
    "user": 15,
    "nome": "João da Silva",
    "telefone": "85999999999",
    "profissional": "Barbearia Central"
  },
  "tokens": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

O frontend deve entender que essa resposta inicia uma sessão de cliente baseada em JWT.

---

## 8.2 Consultar próprio perfil de cliente

```http
GET /api/cli/read
```

Autenticação:

- cliente.

Resposta:

```json
{
  "cliente": {
    "id": 15,
    "nome": "João da Silva",
    "telefone": "85999999999"
  }
}
```

O endpoint usa o cliente identificado pelo token. Não recebe `cliente_id`.

---

## 8.3 Listar clientes do profissional

```http
GET /api/cli/read/clients
```

Autenticação:

- profissional.

Resposta:

```json
{
  "clientes": [
    {
      "id": 15,
      "nome": "João da Silva",
      "telefone": "85999999999"
    }
  ]
}
```

O frontend profissional deve utilizar o `id` retornado como `cliente_id` ao criar agendamento profissional.

A relação com o profissional é determinada pelo `Profile` do JWT.

---

# 9. Endpoints públicos de agendamento

Apesar do nome `public`, os endpoints atuais utilizam:

```python
@client_required
```

Portanto, não são públicos anonimamente. Eles exigem JWT de cliente.

---

## 9.1 Consultar horários disponíveis

```http
GET /api/public/<slug_barber>/horarios
```

Exemplo:

```http
GET /api/public/barbearia-central/horarios?data=2026-10-15&servicos=1&servicos=2
```

Autenticação:

- cliente;
- header `Authorization` obrigatório.

Query parameters:

```text
data=YYYY-MM-DD
servicos=<id>
```

Para múltiplos serviços:

```text
?servicos=1&servicos=2
```

O backend também possui lógica para uma lista agrupada por vírgula em alguns casos:

```text
?servicos=1,2
```

A forma recomendada para o frontend é repetir o parâmetro:

```text
?servicos=1&servicos=2
```

Resposta:

```json
{
  "barbearia": "Barbearia Central",
  "slug": "barbearia-central",
  "data": "2026-10-15",
  "horarios": [
    {
      "horario": "08:00"
    },
    {
      "horario": "08:30"
    },
    {
      "horario": "09:00"
    }
  ]
}
```

A disponibilidade considera:

- serviços ativos;
- serviços pertencentes ao profissional do slug;
- duração total dos serviços;
- expediente;
- dias funcionando;
- horário de almoço;
- agendamentos ativos;
- agendamentos cancelados como livres;
- somente horários futuros;
- intervalos completos, não apenas o horário inicial.

Erros:

- `400` data inválida;
- `400` serviço inválido/inativo;
- `400` expediente não configurado;
- `404` profissional não encontrado;
- `401` token ausente/inválido;
- `403` usuário não é cliente.

---

## 9.2 Criar agendamento como cliente

```http
POST /api/public/<slug_barber>/agendar
```

Exemplo:

```http
POST /api/public/barbearia-central/agendar
```

Headers:

```http
Authorization: Bearer <token-do-cliente>
Content-Type: application/json
```

Payload:

```json
{
  "servicos": [1, 2],
  "horario_inicio": "2026-10-15T14:00:00"
}
```

Não enviar `cliente_id`.

O cliente é obtido do JWT:

```text
request.cliente
```

O profissional é obtido pelo slug.

Validações:

- lista de serviços obrigatória;
- IDs válidos;
- sem IDs duplicados;
- serviços pertencentes ao profissional do slug;
- serviços ativos;
- horário válido;
- vínculo `ClienteProfissional` ativo;
- expediente;
- dia de funcionamento;
- almoço;
- conflito com outro agendamento.

Sucesso:

```http
201 Created
```

Resposta:

```json
{
  "message": "horário agendado com sucesso",
  "agendamento": {
    "id": 45,
    "horario_inicio": "2026-10-15T14:00:00-03:00",
    "horario_fim": "2026-10-15T15:15:00-03:00"
  }
}
```

Erros:

- `400` payload inválido;
- `400` serviço inválido/inativo;
- `400` horário fora do expediente;
- `403` cliente sem relação ativa com o profissional;
- `404` barbearia inexistente;
- `409` horário já ocupado.

---

## 9.3 Consultar perfil da barbearia

```http
GET /api/public/<slug_barber>/barbearia
```

Autenticação atual:

- cliente;
- `Authorization: Bearer` obrigatório.

Resposta:

```json
{
  "nome": "Barbearia Central",
  "barbearia": "barbearia-central",
  "telefone": "85999999999"
}
```

Erro:

```http
404 Not Found
```

quando o slug não existe.

Observação:

- apesar do nome “public”, o endpoint não é anônimo atualmente;
- o frontend deve obter token de cliente antes de consumi-lo.

---

# 10. Endpoints profissionais de agendamento

Todos exigem:

```http
Authorization: Bearer <token-do-profissional>
```

O profissional só acessa agendamentos em que:

```text
Agendamento.profissional == request.user
```

---

## 10.1 Listar agendamentos de uma data

```http
GET /api/agendar/read
```

Query opcional:

```text
?data=2026-10-15
```

Sem `data`, usa a data local atual do servidor.

Resposta:

```json
{
  "agendamentos": [
    {
      "id": 45,
      "cliente": "João da Silva",
      "horario_inicio": "2026-10-15T14:00:00-03:00",
      "horario_fim": "2026-10-15T15:15:00-03:00",
      "status": "PENDENTE"
    }
  ]
}
```

A lista inclui:

- `PENDENTE`;
- `ATENDIDO`;
- `FALTOU`.

Agendamentos `CANCELADO` não aparecem nessa consulta.

---

## 10.2 Dashboard

```http
GET /api/agendar/dashboard
```

Resposta:

```json
{
  "total": 3,
  "pendentes": 1,
  "atendidos": 1,
  "faltaram": 1,
  "proximo": {
    "cliente": "João da Silva",
    "horario_inicio": "2026-10-15T14:00:00-03:00",
    "horario_fim": "2026-10-15T15:15:00-03:00",
    "status": "PENDENTE",
    "telefone": "85999999999"
  }
}
```

`proximo` pode ser:

```json
null
```

quando não existir próximo agendamento pendente.

Agendamentos cancelados não entram nos totais.

---

## 10.3 Histórico

```http
GET /api/agendar/historico
```

Resposta:

```json
{
  "historico": [
    {
      "id": 45,
      "cliente": "João da Silva",
      "horario_inicio": "2026-10-15T14:00:00-03:00",
      "horario_fim": "2026-10-15T15:15:00-03:00",
      "status": "ATENDIDO"
    }
  ]
}
```

O histórico exclui:

```text
PENDENTE
```

Pode conter:

- `ATENDIDO`;
- `FALTOU`;
- `CANCELADO`.

---

## 10.4 Criar agendamento como profissional

```http
POST /api/agendar/create
```

Payload:

```json
{
  "cliente_id": 15,
  "servicos": [1, 2],
  "horario_inicio": "2026-10-15T14:00:00"
}
```

Campos obrigatórios:

- `cliente_id`;
- `servicos`;
- `horario_inicio`.

Validações:

- `cliente_id` inteiro positivo;
- serviços em lista não vazia;
- sem IDs duplicados;
- cliente existente;
- relação `ClienteProfissional` existente;
- relação ativa;
- serviços pertencentes ao profissional autenticado;
- serviços ativos;
- duração total;
- expediente;
- dia funcionando;
- almoço;
- conflito de horário.

Sucesso atual:

```http
200 OK
```

Resposta atual:

```json
{
  "teste_de_response": {
    "id_cliente": 15,
    "cliente": "João da Silva",
    "telefone": "85999999999",
    "servicos": [
      {
        "id": 1,
        "nome": "Corte masculino",
        "duracao": 30,
        "preco": "35.00"
      }
    ],
    "duracao_total": 30,
    "horario_inicio": "2026-10-15T14:00:00-03:00",
    "horario_fim": "2026-10-15T14:30:00-03:00"
  }
}
```

Importante para o agent React:

- a chave atual é `teste_de_response`;
- esse nome parece provisório;
- não renomear no frontend sem alinhar o contrato do backend;
- o frontend pode criar um adapter para esconder essa resposta provisória da aplicação.

---

## 10.5 Atualizar agendamento

```http
PUT /api/agendar/update/<id_agend>
```

Exemplo:

```http
PUT /api/agendar/update/45
```

Payload atual completo:

```json
{
  "cliente_id": 15,
  "servicos": [1, 2],
  "horario_inicio": "2026-10-15T15:00:00",
  "status": "PENDENTE"
}
```

Todos esses campos são exigidos atualmente:

- `cliente_id`;
- `servicos`;
- `horario_inicio`;
- `status`.

Validações:

- agendamento pertence ao profissional autenticado;
- cliente existe;
- cliente possui relação ativa com o profissional;
- serviços pertencem ao profissional;
- serviços estão ativos;
- status é válido;
- transição de status é permitida;
- novo horário não conflita;
- novo horário respeita expediente, almoço e dia de trabalho.

Sucesso:

```http
200 OK
```

```json
{
  "message": "agendamento atualizado com sucesso"
}
```

Erros:

- `404` agendamento não encontrado ou não pertence ao profissional;
- `400` payload inválido;
- `400` transição inválida;
- `400` conflito de horário;
- `403` relação inativa.

---

## 10.6 Cancelar agendamento

```http
DELETE /api/agendar/delete/<id_agend>
```

Apesar do método `DELETE`, a operação é cancelamento lógico.

O registro não é removido.

Sucesso:

```http
200 OK
```

```json
{
  "message": "agendamento cancelado com sucesso!",
  "status": "CANCELADO"
}
```

Se já estiver cancelado:

```http
400 Bad Request
```

O cancelamento:

- não remove o agendamento;
- não remove itens;
- não bloqueia novos horários;
- mantém histórico lógico.

---

## 10.7 Atualizar status

```http
PATCH /api/agendar/status/<id_agend>
```

Payload:

```json
{
  "status": "ATENDIDO"
}
```

O backend converte o status para uppercase.

Status válidos:

```text
PENDENTE
ATENDIDO
CANCELADO
FALTOU
```

Resposta:

```json
{
  "message": "status alterado com sucesso",
  "status": "ATENDIDO"
}
```

Transições permitidas:

```text
PENDENTE  -> ATENDIDO
PENDENTE  -> CANCELADO
PENDENTE  -> FALTOU

ATENDIDO  -> ATENDIDO
ATENDIDO  -> CANCELADO

FALTOU    -> FALTOU
FALTOU    -> CANCELADO

CANCELADO -> CANCELADO
```

Transições rejeitadas:

```text
CANCELADO -> PENDENTE
CANCELADO -> ATENDIDO
ATENDIDO  -> PENDENTE
FALTOU    -> ATENDIDO
```

Erro de transição:

```http
400 Bad Request
```

```json
{
  "error": "transição de status inválida para esse agendamento"
}
```

---

# 11. Regras de agenda

## Intervalos

Um agendamento é um intervalo:

```text
[horario_inicio, horario_fim)
```

A regra de conflito é:

```text
agendamento_existente.inicio < novo.fim
AND
agendamento_existente.fim > novo.inicio
```

## Exemplos

Agendamento existente:

```text
10:00–11:00
```

| Novo horário | Resultado |
|---|---|
| 09:30–10:30 | conflito |
| 10:30–11:30 | conflito |
| 09:00–10:00 | permitido |
| 11:00–12:00 | permitido |

## Cancelamento

Agendamentos com status:

```text
CANCELADO
```

não bloqueiam horários.

## Duração

O frontend deve enviar os serviços selecionados. O backend calcula:

```text
duração_total = soma das durações dos serviços
```

O frontend não deve confiar em uma duração calculada localmente para validar definitivamente o horário.

## Expediente

O backend verifica:

- horário inicial;
- horário final;
- dia de funcionamento;
- almoço;
- duração total.

O frontend pode mostrar validações antecipadas, mas o backend é a fonte final de verdade.

---

# 12. Formatos de data e hora

## Data

Usar:

```text
YYYY-MM-DD
```

Exemplo:

```text
2026-10-15
```

## Data/hora

Usar ISO 8601:

```text
2026-10-15T14:00:00
```

Idealmente, o frontend deve trabalhar com timezone explícito quando possível:

```text
2026-10-15T14:00:00-03:00
```

O backend utiliza:

```text
America/Fortaleza
```

e `USE_TZ=True`.

O frontend deve:

- evitar converter horários para UTC sem necessidade;
- exibir no timezone do negócio;
- não comparar strings de horário sem normalização;
- tratar `horario_inicio` e `horario_fim` como datetimes.

---

# 13. CORS e comportamento do navegador

Em Beta/produção:

```text
CORS_ALLOW_ALL_ORIGINS=False
```

O backend aceita somente origens configuradas em:

```text
CORS_ALLOWED_ORIGINS
```

O frontend oficial precisa realizar preflight para requisições com:

- `Authorization`;
- `Content-Type: application/json`;
- métodos como `PATCH`, `PUT` e `DELETE`.

O backend não utiliza credenciais de navegador:

```text
CORS_ALLOW_CREDENTIALS=False
```

Portanto, o React não deve usar:

```javascript
credentials: "include"
```

para autenticação da API.

Exemplo com `fetch`:

```javascript
fetch(`${API_URL}/api/agendar/read`, {
  method: "GET",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
});
```

Exemplo com JSON:

```javascript
fetch(`${API_URL}/api/public/barbearia-central/agendar`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    servicos: [1, 2],
    horario_inicio: "2026-10-15T14:00:00",
  }),
});
```

---

# 14. Separação de telas no React

## Fluxo profissional

1. Login ou registro.
2. Armazenar tokens.
3. Consultar `/api/usr/me`.
4. Consultar `/api/usr/me/profile`.
5. Configurar perfil.
6. Criar/listar serviços.
7. Listar clientes.
8. Criar agendamento.
9. Visualizar dashboard.
10. Visualizar agenda.
11. Atualizar status.
12. Cancelar agendamento.

Endpoints principais:

```text
POST  /api/usr/login
POST  /api/usr/register
GET   /api/usr/me
GET   /api/usr/me/profile
PATCH /api/usr/update

GET   /api/serv/read
POST  /api/serv/create
PATCH /api/serv/update/<id>
DELETE /api/serv/delete/<id>

GET   /api/cli/read/clients

GET   /api/agendar/dashboard
GET   /api/agendar/read
GET   /api/agendar/historico
POST  /api/agendar/create
PUT   /api/agendar/update/<id>
PATCH /api/agendar/status/<id>
DELETE /api/agendar/delete/<id>
```

## Fluxo cliente

1. Entrada por profissional/slug.
2. Receber tokens.
3. Consultar próprio perfil.
4. Consultar perfil da barbearia.
5. Consultar horários.
6. Selecionar horário.
7. Criar agendamento.
8. Renovar token quando necessário.

Endpoints principais:

```text
POST /api/cli/teste/<slug>
GET  /api/cli/read

GET  /api/public/<slug>/barbearia
GET  /api/public/<slug>/horarios
POST /api/public/<slug>/agendar

POST /api/usr/refresh
```

---

# 15. Diferenças importantes que podem causar conflitos no frontend

## 15.1 Endpoints “public” exigem cliente autenticado

Apesar do prefixo:

```text
/api/public/...
```

as views usam `client_required`.

Portanto, isto não funciona sem JWT de cliente:

```text
GET /api/public/<slug>/barbearia
GET /api/public/<slug>/horarios
POST /api/public/<slug>/agendar
```

## 15.2 `cliente_entry` é o ponto inicial do fluxo cliente

O React não deve tentar chamar horários ou agendamento antes de possuir token de cliente.

Fluxo:

```text
cliente_entry -> tokens -> endpoints public
```

## 15.3 O agendamento público não recebe `cliente_id`

Errado:

```json
{
  "cliente_id": 10,
  "servicos": [1],
  "horario_inicio": "..."
}
```

Correto:

```json
{
  "servicos": [1],
  "horario_inicio": "..."
}
```

O cliente é identificado pelo JWT.

## 15.4 O agendamento profissional recebe `cliente_id`

No fluxo do profissional:

```json
{
  "cliente_id": 10,
  "servicos": [1],
  "horario_inicio": "..."
}
```

Não confundir os dois fluxos.

## 15.5 Cancelamento usa DELETE, mas não exclui

O frontend deve chamar:

```text
DELETE /api/agendar/delete/<id>
```

mas atualizar a interface para:

```text
status = "CANCELADO"
```

Não remover necessariamente o item de forma definitiva do estado local se a tela exibir histórico.

## 15.6 Atualização de agendamento exige payload completo

Embora o método seja `PUT`, o backend exige:

```json
{
  "cliente_id": 10,
  "servicos": [1],
  "horario_inicio": "...",
  "status": "PENDENTE"
}
```

Não enviar apenas o campo alterado.

## 15.7 Resposta de criação profissional ainda possui nome provisório

A resposta atual usa:

```json
{
  "teste_de_response": {}
}
```

O agent React deve criar um adapter ou tratar esse formato até que o contrato seja alterado no backend.

## 15.8 Listas possuem nomes de campos inconsistentes

Exemplos atuais:

```text
serviços
serviço
preço
duracão
descrição
```

e em outros endpoints:

```text
servicos
preco
duracao
descricao
```

O frontend deve centralizar os adapters de resposta para evitar espalhar essas diferenças pelos componentes.

---

# 16. Tipos TypeScript sugeridos

Os tipos abaixo representam o contrato atual de forma prática:

```typescript
type Tokens = {
  access_token: string;
  refresh_token: string;
};

type ApiError = {
  error: string;
};

type Service = {
  id?: number;
  nome: string;
  preco: string | number;
  duracao: number;
  descricao: string;
  cor: string;
  ativo: boolean;
};

type Client = {
  id: number;
  nome: string;
  telefone: string;
};

type AppointmentStatus =
  | "PENDENTE"
  | "ATENDIDO"
  | "CANCELADO"
  | "FALTOU";

type Appointment = {
  id: number;
  cliente: string;
  horario_inicio: string;
  horario_fim: string;
  status: AppointmentStatus;
};

type ProfessionalBookingPayload = {
  cliente_id: number;
  servicos: number[];
  horario_inicio: string;
};

type ClientBookingPayload = {
  servicos: number[];
  horario_inicio: string;
};

type AvailableTime = {
  horario: string;
};
```

---

# 17. Responsividade e integração

A API não controla responsividade. O React deve organizar as telas considerando:

## Desktop profissional

- dashboard;
- agenda por dia;
- lista de clientes;
- catálogo de serviços;
- painel de perfil.

## Mobile profissional

- agenda em cards;
- ação rápida para alterar status;
- ação rápida para cancelar;
- criação de agendamento em etapas;
- lista de clientes com busca local.

## Cliente mobile

- seleção de barbearia;
- seleção de serviço;
- escolha de data;
- lista de horários;
- confirmação do agendamento.

## Estados que cada tela precisa tratar

- carregando;
- vazio;
- erro de rede;
- `401` e refresh;
- `403` sem permissão;
- `404` recurso inexistente;
- `409` conflito de horário;
- sucesso;
- formulário inválido;
- token expirado.

---

# 18. Checklist para o agent React

## Autenticação

- [ ] Adicionar `Authorization: Bearer`.
- [ ] Não usar cookies de autenticação.
- [ ] Não usar `credentials: "include"` para a API.
- [ ] Implementar refresh token.
- [ ] Evitar loop infinito de refresh.
- [ ] Limpar tokens ao receber refresh inválido.
- [ ] Redirecionar para login após falha definitiva.

## Profissional

- [ ] Listar somente serviços recebidos da API.
- [ ] Nunca assumir que um `service_id` de outra conta é válido.
- [ ] Usar `cliente_id` vindo de `/api/cli/read/clients`.
- [ ] Enviar payload completo para atualização de agendamento.
- [ ] Tratar cancelamento como alteração de status.
- [ ] Não exibir cancelados na agenda ativa.
- [ ] Exibir cancelados no histórico quando retornados.

## Cliente

- [ ] Obter token via `/api/cli/teste/<slug>`.
- [ ] Não enviar `cliente_id` no agendamento público.
- [ ] Enviar o token de cliente nas rotas `/api/public`.
- [ ] Selecionar somente serviços retornados para aquele profissional.
- [ ] Tratar `409` como horário ocupado.
- [ ] Recarregar disponibilidade após conflito.

## Dados

- [ ] Normalizar nomes de campos com adapters.
- [ ] Tratar datas como ISO 8601.
- [ ] Não calcular disponibilidade definitiva somente no frontend.
- [ ] Usar o backend como fonte final de verdade.
- [ ] Não confiar apenas no status HTTP `200`; validar o corpo quando necessário.

---

# 19. Pontos do backend que ainda são provisórios

Estes pontos podem causar ajustes no agent React:

1. Resposta de criação profissional usa `teste_de_response`.
2. Campos de serviços possuem acentos inconsistentes entre endpoints.
3. Endpoints `/public/...` exigem token de cliente apesar do nome.
4. `PUT /agendar/update/<id>` exige payload completo.
5. O fluxo de entrada do cliente é baseado em telefone.
6. Algumas mensagens possuem caracteres corrompidos na origem do arquivo.
7. `GET /api/cli/read/clients` deve ser tratado conforme o relacionamento ativo definido no backend.
8. Datas retornadas devem ser normalizadas pelo frontend antes de exibição.
9. O endpoint de criação profissional retorna HTTP `200`, enquanto o fluxo público retorna `201`.

---

# 20. Resumo para o agent

A regra principal é:

```text
JWT identifica o usuário.
O decorator define o papel.
O backend filtra o recurso pelo usuário autenticado.
O frontend nunca deve confiar apenas em IDs enviados.
```

Para profissional:

```text
request.user -> Profile -> próprios serviços/agendamentos/clientes relacionados
```

Para cliente:

```text
request.user -> Cliente -> próprio cliente
```

Para agendamento público:

```text
JWT do cliente
+ slug do profissional
+ relação ClienteProfissional ativa
+ serviços pertencentes ao profissional
+ disponibilidade válida
```

O frontend pode começar a integração imediatamente, desde que utilize adapters para as inconsistências atuais e mantenha separado:

- fluxo profissional;
- fluxo cliente;
- fluxo público autenticado;
- fluxo de refresh;
- cancelamento lógico;
- tratamento de `401`, `403`, `404` e `409`.