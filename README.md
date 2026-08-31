# Entrega Fácil

Prompt Completo — Sistema de Controle de Entregas (com ajustes incorporados)

Crie um sistema web interno para uma farmácia de manipulação chamado Sistema de Controle de Entregas.

O objetivo é substituir uma planilha atualmente utilizada para acompanhar as entregas de medicamentos.

O sistema deve ser simples, rápido, intuitivo, responsivo e focado na rotina real da farmácia.

1. FLUXO REAL DA OPERAÇÃO

O fluxo deve funcionar da seguinte maneira:

Vendedor cadastra a entrega → Logística recebe e envia para impressão de romaneios → Logística imprime os romaneios → Logística separa/organiza os pedidos → Logística entrega o romaneio ao motoboy → Motoboy realiza as entregas → Motoboy retorna com os romaneios → Logística confere os romaneios → Logística marca as entregas como concluídas.

Sequência operacional completa

Vendedor cadastra a entrega;

Entrega fica em Aguardando logística;

Logística envia para Impressão de romaneios;

Logística imprime os romaneios;

Logística separa e organiza os pedidos;

Entregas passam para Pronto para saída;

Logística entrega os romaneios ao motoboy;

Entregas passam para Em rota;

Motoboy realiza as entregas;

Motoboy retorna com os romaneios;

Entregas ficam em Aguardando conferência;

Logística confere os romaneios;

Entregas passam para Concluído.

IMPORTANTE:

O motoboy NÃO precisa utilizar o sistema.

O motoboy não terá login.

O motoboy não precisa registrar cada entrega em tempo real.

A confirmação da entrega será feita pela equipe de logística quando os romaneios retornarem.

Uma entrega pode ter sido realizada em um dia e ser confirmada no sistema no dia seguinte.

A data da entrega e a data da conferência devem ser armazenadas separadamente.

2. PERFIS DE USUÁRIO

Criar autenticação com login e senha.

Ter dois perfis:

VENDEDOR

Pode:

Cadastrar uma nova entrega;

Visualizar e pesquisar TODAS as entregas cadastradas no sistema, independentemente de qual vendedor realizou o cadastro (não apenas as próprias);

Consultar o status de qualquer entrega;

Pesquisar pelo número do pedido, número do romaneio ou nome do cliente, em toda a base de entregas.

Ajuste importante: o campo "Vendedor responsável" deve continuar existindo e mostrando quem cadastrou a entrega, mas isso não deve restringir a visualização. Exemplo: se o cliente entrar em contato com qualquer vendedor perguntando se o pedido já saiu para entrega, esse vendedor deve conseguir pesquisar pelo número do pedido, número do romaneio ou nome do cliente e visualizar a entrega, mesmo que não tenha sido ele quem a cadastrou.

Não pode:

Marcar entrega como concluída;

Alterar o status operacional;

Atribuir motoboy;

Realizar conferência;

Acessar informações administrativas desnecessárias.

LOGÍSTICA / ADMINISTRADOR

Pode:

Visualizar todas as entregas;

Alterar status;

Organizar entregas;

Atribuir motoboy;

Colocar entregas em rota;

Fazer conferência dos romaneios;

Marcar entregas como concluídas;

Marcar entrega como não entregue;

Informar motivo da não entrega;

Editar informações;

Visualizar histórico;

Utilizar conferência em lote;

Visualizar relatórios;

Gerenciar usuários.

As permissões devem ser aplicadas também no backend/banco de dados.

3. CADASTRO DE ENTREGA

O vendedor deve possuir um botão:

+ Nova Entrega

Criar formulário com apenas os dados necessários para o controle logístico:

Dados da entrega

Número do pedido;

Número do romaneio;

Nome do cliente;

~~Telefone do cliente~~ (REMOVIDO — ver observação abaixo);

Data prevista para entrega;

Período da entrega;

Observações.

Ajuste importante — remoção do campo telefone: Remover o campo telefone do cliente do cadastro, da visualização e de qualquer outra parte do sistema onde ele tenha sido incluído. O telefone já consta no romaneio físico gerado pelo Fórmula Certa, portanto não é necessário armazená-lo no sistema. Não criar nenhum campo substituto para essa informação.

IMPORTANTE

NÃO solicitar:

Endereço;

Medicamento;

Produto;

Quantidade;

Telefone do cliente;

Qualquer outra informação que não seja necessária para o controle da entrega.

O endereço já está disponível no romaneio gerado pelo sistema Fórmula Certa.

O número do romaneio será o principal identificador operacional da entrega.

O número do romaneio é obrigatório.

4. PERÍODO DE ENTREGA

A farmácia não trabalha com horário exato de entrega.

Trabalha somente com duas janelas de entrega:

Manhã 10:00 às 13:00

Tarde/Noite 15:00 às 19:00

Criar o campo:

Período da entrega

Ao selecionar o período, o sistema deve preencher automaticamente a janela correspondente.

IMPORTANTE:

Nunca tratar isso como um horário agendado.

Não exibir horários específicos como "11:30".

Exibir sempre:

10:00 às 13:00

ou

15:00 às 19:00

Não existe rastreamento em tempo real para o cliente.

5. STATUS DAS ENTREGAS

Criar os seguintes status:

Aguardando logística

Impressão de romaneios

Pronto para saída

Em rota

Aguardando conferência

Concluído

Não entregue

Cancelado

Regras

Quando o vendedor cadastrar: Aguardando logística

Quando a logística selecionar as entregas para providenciar a impressão dos romaneios: Impressão de romaneios

A impressão do romaneio não significa que a entrega foi realizada nem que saiu para entrega — é apenas uma etapa preparatória.

Quando os romaneios já tiverem sido impressos e os pedidos separados/organizados: Pronto para saída

Quando o romaneio for entregue ao motoboy: Em rota

Quando o motoboy estiver fora realizando as entregas e ainda não tiver retornado com o romaneio: Aguardando conferência

Quando a logística receber o romaneio de volta e confirmar: Concluído

Se a entrega não for realizada: Não entregue

6. REGRA SOBRE PRAZO E CONFERÊNCIA

Não marcar automaticamente uma entrega como concluída quando o horário terminar.

O horário representa apenas a janela informada ao cliente.

Exemplo:

Data prevista: 27/08/2026 Período: 15:00 às 19:00

O motoboy pode realizar a entrega no dia 27/08 e retornar à farmácia somente no dia 28/08.

Nesse caso:

27/08 → Em rota / Aguardando conferência

28/08 → Logística recebe o romaneio → Confirma → Concluído.

Registrar separadamente:

Data prevista da entrega;

Período da entrega;

Data em que a entrega foi conferida;

Horário da conferência;

Usuário que realizou a conferência.

7. MOTOBOYS

Não criar login ou aplicativo para motoboys nesta primeira versão.

Criar cadastro de motoboys com:

Nome;

Telefone;

Status ativo/inativo.

A logística poderá atribuir um motoboy às entregas, tanto individualmente quanto em lote (ver seção 9).

8. PAINEL DE LOGÍSTICA (KANBAN) — COM SELEÇÃO E AÇÕES EM LOTE

Criar uma página específica para a logística, funcionando como um Kanban, organizando visualmente as entregas por etapa:

Aguardando logística — entregas cadastradas pelos vendedores;

Impressão de romaneios — entregas cujos romaneios precisam ser impressos;

Pronto para saída — entregas com romaneio já impresso, organizadas pela logística;

Em rota — entregas entregues aos motoboys;

Aguardando conferência — entregas realizadas ou em retorno, aguardando a conferência dos romaneios;

Concluídas — entregas confirmadas pela logística;

Não entregues — entregas que não foram realizadas.

Também disponibilizar visualização em tabela.

8.1 Seleção múltipla nos cards

Cada card do Kanban deve possuir uma caixa de seleção, permitindo selecionar várias entregas simultaneamente.

8.2 Etapa "Impressão de romaneios" e impressão em lote

A etapa Impressão de romaneios representa as entregas cujos romaneios ainda precisam ser impressos pela logística, antes de serem separadas e organizadas para saída.

Fluxo de entrada na etapa:

Entregas cadastradas pelos vendedores chegam em Aguardando logística;

A logística seleciona várias entregas (seleção múltipla, ver 8.1) e as transfere em lote para Impressão de romaneios.

Impressão em lote:

Na etapa Impressão de romaneios, permitir:

Selecionar vários romaneios e usar a ação Imprimir romaneios selecionados;

Usar a opção Imprimir todos, para imprimir de uma só vez todos os romaneios que estão aguardando impressão nessa etapa, sem precisar selecioná-los manualmente um a um.

A impressão deve ser pensada para a rotina da logística: imprimir vários romaneios de uma única vez, sem precisar abrir cada entrega individualmente.

Após a impressão:

Registrar automaticamente no histórico da entrega:

Data da impressão;

Hora da impressão;

Usuário que realizou a impressão.

A entrega permanece em Impressão de romaneios até a logística separar/organizar o pedido e movê-la (individualmente ou em lote) para Pronto para saída.

IMPORTANTE: a impressão do romaneio não altera o status para "Pronto para saída" automaticamente — a mudança de etapa continua sendo uma ação explícita da logística (individual ou em lote), representando que o pedido já foi separado e organizado.

8.3 Barra de ações em lote

Quando houver uma ou mais entregas selecionadas, exibir uma barra de ações com as opções:

Mover para… — permite transferir todas as entregas selecionadas para outro quadro/status de uma só vez (incluindo para/de Impressão de romaneios). Exemplo:

☑ Romaneio 45872
☑ Romaneio 45873
☑ Romaneio 45874
Mover para → Em rota


As três entregas devem ser transferidas simultaneamente.

Atribuir motoboy — permite selecionar várias entregas e atribuir o mesmo motoboy a todas elas de uma vez. Exemplo:

☑ 45872
☑ 45873
☑ 45874
Atribuir motoboy → Carlos


Todas as entregas selecionadas devem receber Carlos como motoboy responsável.

Imprimir romaneios selecionados — disponível quando as entregas selecionadas estiverem na etapa Impressão de romaneios (ver 8.2).

Limpar seleção — desmarca todas as entregas selecionadas.

Manter também a possibilidade de mover, atribuir motoboy ou imprimir romaneio a uma única entrega individualmente, sem necessidade de seleção múltipla.

8.4 Comportamento sticky/fixo da barra de ações

A barra de ações que aparece quando existem entregas selecionadas deve permanecer fixa/visível durante o scroll da página (comportamento sticky).

Exemplo:

4 entregas selecionadas
[ Mover para… ] [ Atribuir motoboy ] [ Limpar seleção ]


Essa barra deve continuar acessível mesmo quando o usuário estiver no final da lista de entregas — não é necessário voltar ao topo para movimentar as entregas selecionadas.

Regras da barra de ações:

Aparecer somente quando houver pelo menos uma entrega selecionada;

Permanecer visível durante o scroll (sticky/fixed);

Não cobrir os cards do Kanban;

Funcionar em computador, tablet e celular;

Manter a seleção durante o scroll;

Não recarregar a página ao executar uma ação em lote;

Desaparecer automaticamente quando todas as entregas forem desmarcadas.

9. CONFERÊNCIA DE ROMANEIOS

Esta é uma das funcionalidades mais importantes.

Criar uma página:

Conferência de entregas

Mostrar principalmente as entregas que estão:

Aguardando conferência

Exibir:

Número do romaneio;

Número do pedido;

Cliente;

Data prevista;

Período;

Motoboy;

Status.

A logística deve conseguir selecionar várias entregas ao mesmo tempo.

Exemplo:

☑️ Romaneio 45872
☑️ Romaneio 45873
☑️ Romaneio 45874
☑️ Romaneio 45875


Criar botão:

CONFIRMAR ENTREGAS SELECIONADAS

Ao clicar:

Todas as entregas selecionadas passam para "Concluído";

Registrar data e hora da conferência;

Registrar o usuário que realizou a conferência;

Manter a data prevista da entrega separada da data da conferência.

10. CONFERÊNCIA INDIVIDUAL

Também permitir abrir uma entrega individual e escolher:

✅ Entregue

ou

❌ Não entregue

Se escolher "Não entregue", exigir um motivo.

Motivos:

Cliente ausente;

Cliente recusou;

Endereço não localizado;

Problema com o pedido;

Problema com o transporte;

Outro.

Permitir observação adicional.

11. DASHBOARD

Criar um dashboard inicial para a logística.

Mostrar:

Total de entregas;

Aguardando logística;

Prontas para saída;

Em rota;

Aguardando conferência;

Concluídas;

Não entregues;

Canceladas;

Prazo encerrado.

Criar seção:

Entregas de hoje

Mostrar as entregas previstas para o dia atual.

Permitir filtrar:

Todos;

Manhã — 10h às 13h;

Tarde/Noite — 15h às 19h.

12. BUSCA

Criar busca por:

Número do romaneio;

Número do pedido;

Nome do cliente;

Vendedor;

Motoboy.

A busca deve funcionar sobre toda a base de entregas para o perfil vendedor, não apenas sobre as entregas cadastradas por ele (ver seção 2).

NÃO criar busca por medicamento, produto ou telefone.

13. FILTROS

Criar filtros por:

Status;

Data prevista;

Período;

Vendedor;

Motoboy;

Prazo encerrado.

NÃO criar filtro por medicamento ou produto.

14. HISTÓRICO

Cada entrega deve possuir um histórico completo.

Exemplo:

27/08 — 09:15
Entrega cadastrada
Vendedor: João

27/08 — 09:40
Enviada para impressão de romaneios
Logística: Maria

27/08 — 10:05
Romaneio impresso
Logística: Maria

27/08 — 10:30
Pronto para saída
Logística: Maria

27/08 — 14:50
Em rota
Motoboy: Carlos

28/08 — 09:20
Conferência realizada
Logística: Maria

Status final: Concluído


Registrar automaticamente:

Data;

Hora;

Usuário;

Ação;

Status anterior;

Novo status;

Observação, quando houver.

Ações em lote (movimentação em massa no Kanban, atribuição de motoboy em lote, impressão de romaneios em lote, conferência em lote) também devem gerar um registro de histórico individual para cada entrega afetada.

15. ALERTA DE PRAZO

O sistema deve identificar quando a janela de entrega terminou e a entrega ainda não foi concluída.

Exemplo:

Entrega:
27/08
15:00–19:00


Após 19:00, se ainda não estiver concluída:

⚠️ Prazo de entrega encerrado

IMPORTANTE:

Isso NÃO deve alterar automaticamente o status para "Não entregue".

A entrega pode ter sido realizada, mas o romaneio ainda pode estar com o motoboy e retornar somente no dia seguinte.

16. RELATÓRIOS

Criar uma página de relatórios para a gerência.

Permitir consultar:

Total de entregas;

Entregas concluídas;

Entregas não realizadas;

Entregas canceladas;

Entregas por vendedor;

Entregas por motoboy;

Entregas por período;

Entregas com prazo encerrado;

Tempo entre a data prevista e a conferência.

Permitir filtrar por período.

Não incluir relatórios relacionados a medicamentos, produtos ou telefone.

17. BANCO DE DADOS

Criar estrutura para:

Usuários

ID;

Nome;

E-mail;

Perfil;

Status;

Data de criação.

Entregas

ID;

Número do pedido;

Número do romaneio;

Nome do cliente;

~~Telefone~~ (campo removido — não incluir na tabela);

Data prevista;

Período;

Status;

Vendedor responsável;

Motoboy;

Observações;

Data de criação;

Data da última atualização;

Data da conferência;

Horário da conferência;

Usuário que realizou a conferência;

Data da impressão do romaneio;

Horário da impressão do romaneio;

Usuário que realizou a impressão.

Histórico

ID;

ID da entrega;

Usuário;

Ação;

Status anterior;

Novo status;

Data;

Hora;

Observação.

Motoboys

ID;

Nome;

Telefone;

Status ativo/inativo.

18. SEGURANÇA

Implementar autenticação segura.

Aplicar as permissões também no backend/banco de dados.

Um vendedor não pode alterar o status simplesmente modificando elementos no navegador.

O vendedor pode ler/pesquisar todas as entregas (leitura ampla), mas continua sem permissão de escrita sobre:

Alterar status;

Atribuir motoboy;

Confirmar entrega;

Marcar como não entregue;

Realizar conferência (individual ou em lote);

Movimentar entregas no Kanban;

Acessar relatórios gerais;

Gerenciar usuários.

Somente logística/administradores podem realizar as ações acima.

19. DESIGN

Criar uma interface:

Moderna;

Limpa;

Profissional;

Responsiva;

Fácil de utilizar;

Pensada principalmente para computador;

Compatível com celular e tablet.

Priorizar produtividade e poucos cliques.

Os status devem possuir identificação visual clara, mas não depender somente de cores. Sempre mostrar o texto do status.

Evitar animações desnecessárias.

A barra de ações em lote do Kanban (seção 8.4) deve seguir o mesmo padrão visual do restante do sistema, com comportamento sticky/fixo, sem cobrir os cards e sem prejudicar a usabilidade em telas menores.

20. REGRAS FINAIS

Estas regras são obrigatórias:

O vendedor cadastra a entrega.

O motoboy não utiliza o sistema.

O número do romaneio é o principal identificador.

Não cadastrar endereço.

Não cadastrar medicamento.

Não cadastrar produto.

Não cadastrar quantidade.

Não cadastrar telefone do cliente.

Não criar busca por medicamento.

Não criar filtro por medicamento.

Não criar relatórios de medicamentos.

A entrega possui uma janela de horário, não um horário exato.

Manhã = 10:00 às 13:00.

Tarde/Noite = 15:00 às 19:00.

Não existe rastreamento em tempo real.

Somente a logística pode confirmar uma entrega como concluída.

O motoboy pode retornar com os romaneios somente no dia seguinte.

A data da entrega e a data da conferência devem ser armazenadas separadamente.

A conferência em lote é obrigatória.

O sistema não deve marcar automaticamente uma entrega como concluída quando o prazo terminar.

O sistema deve manter histórico das alterações, inclusive para ações em lote.

O sistema deve possuir controle de permissões.

Todos os vendedores devem conseguir visualizar e pesquisar todas as entregas cadastradas, independentemente de quem as cadastrou, mantendo o campo "Vendedor responsável" apenas como informação de registro, não como restrição de acesso.

O painel de logística (Kanban) deve permitir seleção múltipla de cards, com movimentação em lote entre status e atribuição de motoboy em lote, mantendo também a movimentação individual.

A barra de ações em lote deve ser sticky/fixa durante o scroll, aparecendo somente quando houver seleção e desaparecendo quando a seleção for limpa, sem recarregar a página ao executar ações.

Existe uma etapa "Impressão de romaneios" entre "Aguardando logística" e "Pronto para saída", com suporte a impressão em lote (selecionados ou "Imprimir todos") e impressão individual.

A impressão do romaneio não significa que a entrega foi realizada nem que saiu para entrega — é apenas uma etapa preparatória, registrada no histórico com data, hora e usuário responsável.

Não adicionar funcionalidades desnecessárias nesta primeira versão.

MVP a construir

Construir o MVP completo e funcional com:

Autenticação;

Controle de permissões (incluindo leitura ampla de entregas para vendedores);

Banco de dados (sem campo de telefone do cliente);

Cadastro de entregas;

Painel do vendedor (com busca/visualização em toda a base de entregas);

Painel da logística (Kanban com seleção múltipla, ações em lote, etapa de impressão de romaneios e barra sticky);

Dashboard;

Gestão de status;

Cadastro de motoboys;

Atribuição de motoboy (individual e em lote);

Conferência individual;

Conferência em lote;

Histórico (incluindo ações em lote);

Busca;

Filtros;

Controle de prazo.

Priorize a simplicidade e a fidelidade ao fluxo operacional descrito acima.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rightroute.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c62ae0c8-f5f7-4f37-8d67-9cb45b346377).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
