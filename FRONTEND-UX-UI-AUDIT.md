# Auditoria de UX/UI do frontend — GerenciAgenda

**Data:** 16/10/2026
**Escopo:** frontend React/Vite, com leitura pontual do backend somente para confirmar regras que a interface precisa comunicar.
**Resultado da auditoria inicial:** foram identificados três problemas P1, sete P2 e dois P3. A implementação foi iniciada após aprovação do usuário; o estado atual e as validações estão registrados ao final deste documento.

## Resumo executivo

Os fluxos principais estão implementados e há bons padrões reutilizáveis para carregamento, listas vazias, erros, toque e responsividade. A navegação móvel fixa é compreensível, as telas de login e agendamento público renderizam sem rolagem horizontal nos tamanhos testados e os formulários de agenda pública têm associação explícita entre os campos de dados e seus rótulos.

Há, porém, três problemas que merecem correção prioritária:

1. Em desktop, o grid dá a maior coluna ao cartão de “Próximo atendimento” e deixa a agenda espremida; o cartão de atendimento perde a área do cliente e corta ações.
2. O cartão de atendimento é uma região interativa com botão interativo aninhado. Ao pressionar Enter no botão “Cancelar agendamento”, a página abre a edição em vez de executar o cancelamento.
3. As configurações permitem salvar dias de atendimento sem horários de expediente. Em um perfil recém-criado, que começa sem horários, o painel aceita a configuração, mas a página pública informa que o expediente não foi configurado e não oferece horários.

Também foram constatados atritos no início do fluxo público em dias não habilitados, em diálogos, em formulários de autenticação, na leitura de textos auxiliares e na interpretação de um indicador do dashboard.

## Como foi feita a auditoria

- Inspecionei as rotas, páginas, componentes compartilhados, serviços HTTP, estilos globais e estilos responsivos do projeto.
- Executei o Vite localmente e abri a interface em navegador integrado.
- Medi o layout em **360, 375, 390, 768 e 1366 px**. Usei respostas de API simuladas no próprio navegador para renderizar o dashboard e o fluxo público; nenhuma chamada ou operação foi executada em produção.
- Reproduzi o comportamento de teclado do botão de cancelamento e uma rota inexistente.
- Calculei o contraste dos tokens de texto usados em informações auxiliares.
- Não alterei código, configuração de produção nem dados persistidos.

## Áreas analisadas

- Login, cadastro e validação de sessão.
- Dashboard, estatísticas, próximo atendimento, agenda, cartão, botão flutuante e navegação.
- Wizard público: perfil, dados do cliente, seleção de serviço, data/horário e revisão.
- Histórico, clientes, serviços e configurações.
- Modais de agendamento, serviço e link público.
- Componentes compartilhados de campo, busca, estados de carregamento/erro/vazio e cabeçalho.
- Breakpoints e estilos globais, tipografia, contraste, foco e áreas de toque.

## Tabela resumida

| ID | Gravidade | Tela/fluxo | Problema | Esforço |
|---|---|---|---|---|
| UX-01 | P1 — Alto | Dashboard desktop | A agenda é a coluna estreita; conteúdo e ações do cartão são cortados | Baixo |
| UX-02 | P1 — Alto | Agenda / teclado | Enter no botão de cancelar abre edição e não cancela | Baixo |
| UX-03 | P1 — Alto | Ajustes → agendamento público | Dias podem ser salvos sem horários obrigatórios; agenda pública fica indisponível | Baixo |
| UX-04 | P2 — Médio | Página pública | A data inicial pode estar desabilitada e não aparecer entre os chips | Baixo |
| UX-05 | P2 — Médio | Modais | Diálogos fecham por clique externo e não gerenciam foco/tecla Escape consistentemente | Médio |
| UX-06 | P2 — Médio | Design system | Texto “muted” tem contraste insuficiente em superfícies escuras | Baixo |
| UX-07 | P2 — Médio | Login/cadastro | Placeholders substituem rótulos; erros genéricos; autocomplete incorreto no usuário do cadastro | Baixo |
| UX-08 | P2 — Médio | Histórico/clientes/serviços | Botão de limpar busca é filho interativo de um `<label>` | Baixo |
| UX-09 | P2 — Médio | Dashboard | Indicador mistura “Clientes hoje” com “Agendamentos” para uma contagem de agendamentos | Baixo |
| UX-10 | P2 — Médio | Navegação | Rota desconhecida renderiza tela vazia | Baixo |
| UX-11 | P3 — Baixo | Dashboard em 768 px | Botão flutuante ocupa quase toda a largura em tablet | Baixo |
| UX-12 | P3 — Baixo | Carregamentos | O elemento chamado spinner não possui animação de rotação | Baixo |

## Achados detalhados

### UX-01 — A agenda é comprimida e perde conteúdo em desktop

1. **Tela/componente:** dashboard, lista e cartão de agendamento.
2. **Categoria:** visual, responsividade e usabilidade.
3. **Problema:** em larguras acima de 900 px, o grid distribui `2fr 1fr`; a primeira coluna contém “Próximo atendimento” e a segunda contém a agenda. Assim, o cartão secundário recebe mais espaço que a lista de trabalho. O cartão de agendamento também usa colunas mínimas e `overflow: hidden`.
4. **Evidência:** `gerenci-agenda-front/src/pages/Dashboard_page.css:123-140`; `gerenci-agenda-front/src/components/AppointmentCard/AppointmentCard.css:1-10`. Em navegador local com dados simulados a 1366 px, a área da agenda mediu **344 px**; o cartão mediu **302 px**, mas tinha `scrollWidth` de **431 px**. A coluna do cliente mediu **0 px**, e as ações ultrapassaram o limite do cartão, que corta o excesso.
5. **Reprodução:** abrir o dashboard em desktop com um agendamento pendente.
6. **Impacto:** nome, serviços e ação de cancelamento podem ficar total ou parcialmente invisíveis/inutilizáveis. A consulta e gestão da agenda, tarefa central da tela, ficam prejudicadas.
7. **Gravidade/alcance:** **P1 — Alto**; afeta a agenda e seus cartões no desktop.
8. **Correção recomendada:** atribuir a maior fração do grid à agenda e a menor à próxima consulta; rever a largura mínima das colunas do cartão para que ações não transbordem nem sejam cortadas.
9. **Critério de conclusão:** em 1366 px, a agenda tem largura suficiente para cliente, status e ações; o nome do cliente tem largura positiva; `scrollWidth <= clientWidth` nos cartões; nenhum botão fica fora de sua borda visível.
10. **Esforço estimado:** baixo.

### UX-02 — Teclado no cancelamento abre a edição do agendamento

1. **Tela/componente:** `AppointmentCard`.
2. **Categoria:** acessibilidade e funcional.
3. **Problema:** o cartão inteiro é `role="button"` e trata Enter/Espaço no `onKeyDown`. Dentro dele existe o botão “Cancelar agendamento”. O evento de teclado sobe ao cartão e chama `onEdit`; Enter é interceptado pelo `preventDefault`, impedindo a ativação nativa esperada do botão filho.
4. **Evidência:** `gerenci-agenda-front/src/components/AppointmentCard/AppointmentCard.jsx:25-34` e `:74-85`. Reproduzido no dashboard local simulado: foco no botão de cancelar seguido de Enter abriu o diálogo “Editar Agendamento”; o diálogo de confirmação do cancelamento não apareceu.
5. **Reprodução:** usar Tab para focar “Cancelar agendamento” e pressionar Enter (Espaço também percorre o mesmo handler do cartão).
6. **Impacto:** usuários de teclado não conseguem executar a ação de cancelamento como o rótulo promete e são levados a uma operação diferente.
7. **Gravidade/alcance:** **P1 — Alto**; componente compartilhado por todos os agendamentos pendentes.
8. **Correção recomendada:** não aninhar controles interativos; separar a ação de abrir/editar em um botão próprio ou ignorar eventos originados em elementos interativos no handler do cartão.
9. **Critério de conclusão:** Enter/Espaço sobre “Cancelar agendamento” executa exclusivamente o fluxo de cancelamento; o cartão continua abrindo edição quando seu controle próprio é ativado.
10. **Esforço estimado:** baixo.

### UX-03 — É possível salvar dias sem configurar horários de atendimento

1. **Tela/fluxo:** configurações de funcionamento → página pública.
2. **Categoria:** usabilidade, feedback e regra de negócio refletida na interface.
3. **Problema:** a validação só compara início/fim se ambos estiverem preenchidos; não exige horários quando há dias habilitados. O cadastro cria um perfil sem horários. Dessa forma, um profissional pode selecionar dias, deixar os horários vazios e salvar sem erro, mas a API pública responde “expediente não configurado”.
4. **Evidência:** `gerenci-agenda-front/src/pages/SettingsPage.jsx:107-139` (validação), `:230-237` (campos de horário sem obrigatoriedade) e `:244-260` (salvamento); `../gerenci-agenda/users/views.py:57` cria o perfil; `../gerenci-agenda/public/views.py:64-70` rejeita disponibilidade se horários ou dias faltarem.
5. **Reprodução:** cadastrar conta, abrir Ajustes, selecionar um dia sem preencher início/fim e salvar; depois consultar a página pública.
6. **Impacto:** a interface confirma o salvamento de uma configuração que não permite agendamento; o profissional pode acreditar que já está disponível.
7. **Gravidade/alcance:** **P1 — Alto**; bloqueia o fluxo público para perfis nessa condição.
8. **Correção recomendada:** quando houver ao menos um dia selecionado, exigir início e fim do expediente com erros próximos aos campos; alternativamente, comunicar de forma explícita que a agenda continuará indisponível até os horários serem preenchidos.
9. **Critério de conclusão:** não é possível obter confirmação de configuração operacional sem horários válidos; o estado incompleto fica claro e acionável.
10. **Esforço estimado:** baixo.

### UX-04 — O wizard pode começar em uma data desabilitada

1. **Tela/componente:** etapa “Data e horário” da página pública.
2. **Categoria:** usabilidade e feedback.
3. **Problema:** `data` começa sempre como hoje, enquanto os chips são filtrados pelos dias habilitados. Se hoje não for um dia de atendimento, o input continua mostrando a data de hoje, mas nenhum chip corresponde a ela; a pessoa vê “Nenhum horário disponível para esta data” sem orientação de que a data selecionada está fechada.
4. **Evidência:** `gerenci-agenda-front/src/pages/Public_Page/Public_page.jsx:21-23`, `:212-229`, `:248-254` e `:279`. Reproduzido localmente com data atual 16/10/2026 (sexta-feira) e configuração `["segunda"]`: o input manteve `2026-10-16`, só apareceu o chip “Seg., 19”, e a etapa exibiu estado sem horários.
5. **Reprodução:** usar um perfil que atende apenas em um dia futuro dentro da semana e avançar para data/horário.
6. **Impacto:** o calendário parece não ter disponibilidade até o usuário perceber que precisa selecionar manualmente o próximo chip/data.
7. **Gravidade/alcance:** **P2 — Médio**; ocorre quando o dia corrente está desabilitado.
8. **Correção recomendada:** escolher inicialmente o próximo dia habilitado e futuro quando disponível, ou exibir texto explícito para data fechada; manter a data selecionada sempre representada no calendário.
9. **Critério de conclusão:** a primeira data mostrada é habilitada e tem correspondência visual no seletor, ou o estado informa claramente que o dia atual não funciona e como escolher outro.
10. **Esforço estimado:** baixo.

### UX-05 — Modais podem descartar dados e não contêm o foco

1. **Tela/componente:** modais de agendamento, serviço e edição do link público.
2. **Categoria:** acessibilidade, prevenção de erro e consistência.
3. **Problema:** as implementações fecham ao clicar no overlay, inclusive com formulário alterado. Os diálogos declaram `aria-modal="true"`, mas não movem/confinam o foco, não o restauram ao fechar e não tratam Escape de modo uniforme. O componente compartilhado `ui/Modal` tem Escape, mas os três modais de negócio implementam overlays próprios.
4. **Evidência:** `gerenci-agenda-front/src/components/ModalAgendamento/ModalAgendamento.jsx:158-165`, `ModalServico.jsx:69-76` e `ModalSlug.jsx:58-72`; `gerenci-agenda-front/src/components/ui/Modal.jsx:6-19`.
5. **Reprodução:** iniciar/editar um agendamento ou serviço, preencher campos e clicar fora do painel; para foco, abrir o diálogo e navegar com Tab.
6. **Impacto:** uma interação acidental pode apagar dados digitados; usuários de teclado/leitor de tela podem perder o contexto do diálogo.
7. **Gravidade/alcance:** **P2 — Médio**; padrão repetido em três modais.
8. **Correção recomendada:** centralizar o comportamento de diálogo, mover o foco para dentro, mantê-lo dentro enquanto aberto e restaurá-lo ao fechar; permitir Escape com regra consistente e confirmar descarte se houver alterações não salvas.
9. **Critério de conclusão:** tabulação não alcança conteúdo de fundo; foco volta ao acionador; alterações pendentes não são descartadas por clique fora sem confirmação.
10. **Esforço estimado:** médio.

### UX-06 — Texto auxiliar tem contraste abaixo do recomendado

1. **Tela/componente:** textos secundários “muted” em serviços, cartão de agenda e ajustes.
2. **Categoria:** acessibilidade visual.
3. **Problema:** o token `--color-text-muted: #6b7280` resulta em contraste baixo nas superfícies escuras, especialmente em texto pequeno.
4. **Evidência:** `gerenci-agenda-front/src/styles/variables.css:10`; usos em `pages/ServicesPage.css:121-124`, `components/AppointmentCard/AppointmentCard.css:126-129` e `pages/SettingsPage.css:112-114`. Cálculo sRGB: **3,04:1** sobre `#1f2937` e **2,56:1** sobre `#293548`; ambos abaixo de 4,5:1 para texto normal.
5. **Reprodução:** consultar descrições de serviços, contagem adicional de serviços e rótulos OFF em tema escuro.
6. **Impacto:** essas informações ficam difíceis de ler para pessoas com baixa visão ou em condições de brilho reduzido.
7. **Gravidade/alcance:** **P2 — Médio**; token compartilhado, várias telas.
8. **Correção recomendada:** ajustar o token e verificar o contraste das combinações reais de texto/superfície, sem depender apenas do estado de cor.
9. **Critério de conclusão:** texto normal atende pelo menos 4,5:1; texto grande atende pelo menos 3:1, mantendo estados distinguíveis.
10. **Esforço estimado:** baixo.

### UX-07 — Login/cadastro dependem de placeholders e dão feedback genérico

1. **Tela/componente:** login e cadastro.
2. **Categoria:** acessibilidade, formulário e feedback.
3. **Problema:** os campos não têm rótulos persistentes (só placeholders); falhas de rede/API viram `alert("Login inválido")` ou `alert("Cadastro inválido")`, sem indicar causa ou recuperação. No cadastro, o campo “Nome de usuário” usa `autoComplete="current-password"`.
4. **Evidência:** `gerenci-agenda-front/src/pages/Login_Page.jsx:16-27` e `:48-67`; `Register_page.jsx:17-28` e `:50-71`.
5. **Reprodução:** submeter credenciais inválidas/desconectar a API; digitar no campo cujo único rótulo era o placeholder; usar preenchimento automático no cadastro.
6. **Impacto:** a orientação do campo desaparece após digitação, o usuário não distingue erro de credencial de indisponibilidade e o navegador pode preencher incorretamente o nome de usuário.
7. **Gravidade/alcance:** **P2 — Médio**; afeta a entrada e o cadastro de todos os usuários.
8. **Correção recomendada:** usar labels visíveis associados, corrigir tokens de autocomplete (`username`, `current-password`, `new-password` conforme o campo), mostrar erro acessível na página e desabilitar o botão durante envio.
9. **Critério de conclusão:** cada campo tem label persistente; erros diferenciam credencial, validação e conexão; tentativas concorrentes não geram envios duplicados.
10. **Esforço estimado:** baixo.

### UX-08 — O controle “Limpar busca” está dentro de um `<label>`

1. **Tela/componente:** `SearchField`, reutilizado em histórico, clientes e serviços.
2. **Categoria:** acessibilidade e consistência.
3. **Problema:** o componente usa um `<label>` como contêiner e, quando há texto, inclui dentro dele um `<button>` independente. A estrutura coloca um controle interativo adicional dentro do rótulo do input.
4. **Evidência:** `gerenci-agenda-front/src/components/ui/SearchField.jsx:6-11`.
5. **Reprodução:** digitar em qualquer busca e navegar com leitor de tela/teclado até “Limpar busca”.
6. **Impacto:** a semântica do rótulo pode interferir na associação e na ativação do input; o mesmo controle aparece em três telas.
7. **Gravidade/alcance:** **P2 — Médio**; componente compartilhado.
8. **Correção recomendada:** usar um contêiner neutro, associar um `label` independente ao input e manter o botão de limpar como irmão do campo.
9. **Critério de conclusão:** árvore acessível expõe input e botão de limpar como controles irmãos, com nomes claros; limpar não aciona comportamento adicional do label.
10. **Esforço estimado:** baixo.

### UX-09 — A métrica do dashboard tem dois significados conflitantes

1. **Tela/componente:** cartão de estatística “Clientes hoje”.
2. **Categoria:** compreensão da informação e confiança.
3. **Problema:** o título diz “Clientes hoje”, mas o rodapé diz “Agendamentos”. O valor `stats.total` é a contagem de agendamentos do dia, não uma contagem distinta de clientes.
4. **Evidência:** `gerenci-agenda-front/src/components/DashboardStats/DashboardStats.jsx:18-27`; `../gerenci-agenda/agendamento/views.py:88-118` conta `agendamentos_hoje` e retorna esse número em `total`.
5. **Reprodução:** consultar o primeiro cartão do dashboard.
6. **Impacto:** o usuário pode interpretar incorretamente o número como quantidade de clientes únicos.
7. **Gravidade/alcance:** **P2 — Médio**; todos os usuários do dashboard.
8. **Correção recomendada:** escolher um único conceito e repetir o mesmo rótulo, ou implementar contagem distinta somente se essa métrica for uma regra desejada.
9. **Critério de conclusão:** título e descrição correspondem exatamente ao campo retornado pela API.
10. **Esforço estimado:** baixo.

### UX-10 — URL sem rota correspondente produz tela em branco

1. **Tela/componente:** roteamento da aplicação.
2. **Categoria:** navegação e orientação.
3. **Problema:** não há rota fallback para caminhos desconhecidos.
4. **Evidência:** `gerenci-agenda-front/src/App.jsx:16-28`. Navegar localmente para `/rota-inexistente` deixou o corpo vazio e registrou “No routes matched location”.
5. **Reprodução:** digitar uma URL incorreta ou abrir um link antigo.
6. **Impacto:** o usuário não recebe explicação nem caminho para retornar à aplicação.
7. **Gravidade/alcance:** **P2 — Médio**; qualquer rota inválida.
8. **Correção recomendada:** adicionar página de não encontrado com ação para início/login e manter o conteúdo semântico acessível.
9. **Critério de conclusão:** toda URL desconhecida apresenta mensagem e navegação de retorno, sem corpo em branco.
10. **Esforço estimado:** baixo.

### UX-11 — Ação flutuante fica quase em largura total em 768 px

1. **Tela/componente:** botão flutuante do dashboard.
2. **Categoria:** responsividade e hierarquia visual.
3. **Problema:** o botão vira largura total até 768 px, mas a navegação inferior muda para layout móvel somente até 767 px. Em 768 px, a navegação permanece horizontal no topo e o botão assume formato de barra larga na parte inferior.
4. **Evidência:** `gerenci-agenda-front/src/components/FloatingButton/FloatingButton.css:43-58`; breakpoint de navegação em `components/PanelNavigation/PanelNavigation.css:30-45`. Reproduzido localmente em 768 px: botão mediu **721 px** de largura em viewport de 768 px.
5. **Reprodução:** abrir o dashboard em viewport de 768 px.
6. **Impacto:** ação flutuante domina o tablet e sua apresentação não acompanha o modo de navegação.
7. **Gravidade/alcance:** **P3 — Baixo**; faixa próxima ao breakpoint tablet.
8. **Correção recomendada:** alinhar breakpoints e escolher apresentação proporcional ao modo de navegação.
9. **Critério de conclusão:** em 768 px o botão não vira barra quase full-width sem intenção de design e não encobre conteúdo.
10. **Esforço estimado:** baixo.

### UX-12 — Indicador chamado spinner não gira

1. **Tela/componente:** `LoadingState`.
2. **Categoria:** feedback e consistência.
3. **Problema:** o elemento visual é uma borda com uma cor diferente no topo, mas não há propriedade de animação nem `@keyframes` para rotação.
4. **Evidência:** `gerenci-agenda-front/src/components/ui/LoadingState.jsx:3`; `.ui-spinner` em `components/ui/ui.css:1`. Busca por `@keyframes` confirmou que não há animação associada ao spinner.
5. **Reprodução:** observar o carregamento de uma página que use `LoadingState`.
6. **Impacto:** o elemento parece um spinner parado; o texto de estado ainda informa que a operação está em andamento.
7. **Gravidade/alcance:** **P3 — Baixo**; todas as telas que reutilizam `LoadingState`.
8. **Correção recomendada:** animar o indicador respeitando `prefers-reduced-motion`, ou usar um indicador estático que não sugira rotação.
9. **Critério de conclusão:** o feedback visual é coerente com o estado e não força movimento para quem reduziu animações.
10. **Esforço estimado:** baixo.

## Melhorias de baixo esforço e alto impacto

1. Corrigir a proporção do grid do dashboard e impedir clipping nos cartões.
2. Separar o controle de edição do cartão do botão de cancelamento.
3. Tornar início/fim do expediente obrigatórios quando houver dias ativos.
4. Inicializar o agendamento público no próximo dia habilitado ou indicar claramente que a data corrente está fechada.
5. Corrigir labels e autocomplete em login/cadastro e substituir os `alert()` genéricos por feedback acessível.
6. Uniformizar os rótulos dos indicadores do dashboard.

## Componentes compartilhados que merecem atenção

- **`AppointmentCard`:** concentra o problema de teclado em todos os cartões de agendamento e também controla a largura mínima do conteúdo.
- **`SearchField`:** estrutura do label/button afeta histórico, clientes e serviços.
- **Diálogos:** `ModalAgendamento`, `ModalServico` e `ModalSlug` repetem implementação; o componente `ui/Modal` não é usado por esses fluxos e também precisaria de contenção/restauração de foco antes de ser adotado como solução completa.
- **Tokens de cor:** `--color-text-muted` propaga contraste baixo para qualquer tela que o reutilize.
- **`FloatingButton` e `PanelNavigation`:** breakpoints diferentes afetam a composição no tablet.
- **`LoadingState`:** compartilhado; a mensagem é informativa, mas o indicador não anima.

## O que funcionou bem / sem defeito confirmado nesta execução

- Login local a 360 px e páginas públicas a 360/375 px não apresentaram rolagem horizontal.
- A etapa pública usa botão de ação em fluxo normal de documento; em 360/375 px o conteúdo de revisão pode exigir rolagem vertical, mas não fica preso atrás de um botão fixo.
- Dashboard não apresentou rolagem horizontal em 360, 375, 390, 768 ou 1366 px; o problema desktop encontrado é clipping dentro do cartão, não largura horizontal global.
- Navegação móvel tem nomes curtos/ícones e áreas de toque declaradas de pelo menos 44 px.
- Histórico, clientes, serviços e ajustes reutilizam estados explícitos de carregamento, erro e ausência de registros; o carregamento é encerrado em `finally` nos carregadores examinados.
- Há tratamento de sessão expirada e refresh em interceptors; a auditoria não tentou validar credenciais reais nem alterar estado de conta.

## Riscos não verificados

- Não usei credenciais reais nem API de produção; dashboard e página pública foram renderizados com fixtures locais.
- Não validei em dispositivos físicos, Safari/iOS, teclado virtual real, zoom do sistema, leitores de tela ou ferramentas formais de contraste/auditoria WCAG.
- A posição de barras fixas quando o teclado virtual está aberto depende do navegador/OS; precisa de validação em dispositivo real.
- Tempos de resposta, erros reais da API e comportamento de refresh com sessões expirando não foram submetidos a falha controlada nesta auditoria.
- O relatório não substitui teste completo com dados de negócio reais ou validação por usuários.

## Plano recomendado de correção

1. **Primeiro:** corrigir o grid desktop e a interação teclado do cartão; cobrir ambas com testes de componente/regressão.
2. **Depois:** bloquear salvamento de expediente incompleto e ajustar a seleção inicial da data pública; testar pelo menos dia habilitado/desabilitado, configuração vazia e domingo.
3. **Em seguida:** padronizar modais e formulários de autenticação; testar teclado, foco e descarte de dados.
4. **Por fim:** ajustar contraste, busca, textos das métricas, fallback de rotas e breakpoint do botão flutuante.
5. Revalidar 360, 375, 390, 768 e 1366 px e testar teclado virtual em aparelho real.

## Status após aprovação para corrigir

As correções dos 12 achados foram implementadas no frontend:

- **UX-01–02:** grid do dashboard prioriza a agenda; cartão agora tem botões sem aninhamento para editar e cancelar.
- **UX-03–04:** configurações não salvam dias ativos sem início/fim do expediente; calendário público começa no próximo dia habilitado, oferece os próximos cinco dias de funcionamento e sinaliza tentativas de data fechada.
- **UX-05:** foco é movido e contido em diálogos, volta ao acionador no fechamento, Escape/overlay têm fechamento consistente e alterações pendentes pedem confirmação.
- **UX-06–10:** contraste do token muted corrigido; formulários de autenticação ganharam labels persistentes, autocomplete correto, estados de envio e mensagens inline; busca passou a usar label externo; métrica foi renomeada; rota inexistente ganhou fallback.
- **UX-11–12:** breakpoint do botão flutuante alinhado ao da navegação; spinner animado com respeito a `prefers-reduced-motion`.

### Validação da implementação

- Testes Vitest: **11 arquivos e 25 testes passaram**.
- `npm run lint`: executado com sucesso (exit code 0); permanecem avisos já existentes em `Dashboard_page.jsx` e nos contextos de autenticação.
- `npm run build`: executado com sucesso.
- Verificação visual local: login a 360 px sem overflow horizontal. Não foi possível verificar o dashboard renderizado no navegador porque não havia API local em `127.0.0.1:8000`; a tentativa resultou em `ERR_CONNECTION_REFUSED`. Portanto, o novo grid foi coberto por inspeção de CSS e regressões de componente, mas ainda precisa de confirmação visual com API disponível.
- Nenhum backend, dado real, configuração de produção ou deploy foi alterado.

**Próximo passo recomendado:** validar visualmente dashboard, cartões e botão flutuante com fixtures locais/API disponível em 360, 375, 768 e 1366 px; testar teclado virtual em dispositivo real.
