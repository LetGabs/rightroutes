# Instruções do projeto RightRoutes

## Objetivo principal

Este projeto é um sistema interno de controle e logística de entregas para uma farmácia de manipulação.

O objetivo do Copilot é auxiliar principalmente no desenvolvimento e evolução do FRONTEND, mantendo a arquitetura, banco de dados e regras de negócio existentes intactos.

---

# REGRA PRINCIPAL

Priorize alterações no FRONTEND.

Antes de alterar qualquer coisa relacionada ao backend, Supabase, banco de dados ou regras de negócio, peça autorização explícita.

Não faça alterações destrutivas ou estruturais sem autorização.

---

# PODE ALTERAR

O Copilot pode alterar livremente, quando solicitado:

- Componentes React
- Páginas
- Layouts
- TailwindCSS
- CSS
- Responsividade
- UX/UI
- Animações
- Ícones
- Tipografia
- Espaçamentos
- Cores
- Bordas
- Sombras
- Cards
- Tabelas
- Kanban
- Modais
- Dropdowns
- Menus
- Formulários
- Botões
- Componentes visuais
- Estados visuais
- Loading states
- Empty states
- Mensagens de erro visuais
- Organização visual das páginas
- Acessibilidade
- Experiência em desktop e mobile

Pode refatorar componentes de frontend quando isso melhorar organização, manutenção ou desempenho, desde que não altere regras de negócio.

---

# NÃO ALTERAR SEM AUTORIZAÇÃO

Não alterar sem autorização explícita:

- Banco de dados
- Tabelas do Supabase
- Colunas
- Tipos ENUM
- Foreign keys
- Triggers
- Functions
- Policies
- RLS
- Migrations
- Views
- RPCs
- Estrutura do PostgreSQL
- Autenticação
- Autorização
- Roles
- Permissões
- Variáveis secretas
- Chaves secretas
- Regras de negócio
- Fluxos críticos de entrega
- Integrações existentes
- Estrutura de produção do Supabase

Nunca executar comandos destrutivos no banco.

Não executar DROP, DELETE, TRUNCATE, ALTER TABLE ou comandos equivalentes no Supabase sem autorização explícita.

---

# SUPABASE

O projeto utiliza Supabase para:

- Autenticação
- PostgreSQL
- Dados das entregas
- Usuários
- Perfis
- Roles
- Motoboys
- Unidades
- Dados relacionados à logística

Preserve a integração existente.

Não substitua a URL do Supabase.

Não substitua as chaves do Supabase.

Não altere o modelo de dados apenas para resolver um problema visual.

Se uma alteração aparentemente exigir mudança no banco, pare e informe o motivo antes de fazer qualquer alteração.

---

# AUTENTICAÇÃO

A autenticação existente deve ser preservada.

Não alterar:

- Login
- Logout
- Sessões
- Recuperação de sessão
- Roles
- Permissões
- Middleware de autenticação
- Proteção de rotas

A menos que o usuário peça explicitamente.

---

# REGRAS DE NEGÓCIO

Não modificar regras de negócio existentes apenas para melhorar o frontend.

Antes de alterar qualquer comportamento relacionado a:

- Entregas
- Pedidos
- Romaneios
- Logística
- Vendedores
- Motoboys
- Status
- Transferências
- Unidades
- Rotas
- Permissões

confirme se a mudança é realmente necessária.

Se for apenas uma mudança visual, mantenha a lógica atual.

---

# PAINEL DE LOGÍSTICA

O painel de logística utiliza uma interface semelhante a Kanban.

Ao modificar o painel:

- Preserve os status existentes.
- Preserve as regras de movimentação.
- Preserve os dados vindos do Supabase.
- Preserve seleção múltipla quando existente.
- Priorize usabilidade.
- Priorize clareza visual.
- Mantenha o painel responsivo.
- Evite alterações desnecessárias na lógica.

Quando houver listas grandes, priorize uma interface rápida e organizada.

---

# FRONTEND

Tecnologias principais:

- React
- TypeScript
- Vite
- TailwindCSS
- Radix UI
- TanStack

Respeite os padrões já utilizados no projeto.

Não introduza outra biblioteca ou framework sem necessidade.

Antes de criar um novo componente, verifique se já existe um componente reutilizável no projeto.

Prefira reutilizar componentes existentes.

---

# DESIGN

Ao melhorar uma interface:

1. Preserve a identidade visual existente quando possível.
2. Melhore hierarquia visual.
3. Melhore espaçamento.
4. Melhore legibilidade.
5. Melhore responsividade.
6. Evite excesso de elementos.
7. Mantenha aparência profissional.
8. Priorize facilidade de uso.
9. Evite mudanças visuais que prejudiquem funcionalidades existentes.

---

# RESPONSIVIDADE

Toda alteração visual deve considerar:

- Desktop
- Notebook
- Tablet
- Celular

Não criar layouts que dependam exclusivamente de uma resolução específica.

Evite overflow horizontal desnecessário.

---

# PERFORMANCE

Evite:

- Renderizações desnecessárias
- Requisições duplicadas
- Componentes excessivamente pesados
- Bibliotecas desnecessárias
- Código duplicado

Não faça otimizações complexas sem necessidade.

Priorize soluções simples e fáceis de manter.

---

# SEGURANÇA

Nunca exponha:

- Senhas
- Service role keys
- Tokens privados
- Secrets
- Credenciais

Nunca coloque credenciais privadas diretamente no frontend.

Não modificar arquivos `.env` sem autorização explícita.

Nunca imprimir secrets no código ou nos logs.

---

# GIT

Antes de realizar alterações grandes:

- Analise os arquivos existentes.
- Entenda a implementação atual.
- Evite sobrescrever alterações existentes.

Não executar:

- git reset --hard
- git clean
- force push
- comandos que possam apagar trabalho existente

sem autorização explícita.

---

# PROCESSO DE ALTERAÇÃO

Antes de modificar arquivos:

1. Entenda o código existente.
2. Identifique os arquivos necessários.
3. Faça a menor alteração necessária.
4. Preserve funcionalidades existentes.
5. Verifique possíveis erros TypeScript.
6. Verifique possíveis erros de lint.
7. Verifique se a aplicação continua funcionando.

Quando possível, valide a alteração após implementá-la.

---

# QUANDO O USUÁRIO PEDIR UMA ALTERAÇÃO VISUAL

Exemplo:

"Deixe o painel de logística mais moderno."

Interprete isso como uma solicitação de FRONTEND.

Você pode alterar:

- JSX
- componentes
- Tailwind
- CSS
- layout
- responsividade
- UX

Não altere:

- Supabase
- banco
- RLS
- autenticação
- roles
- regras de negócio

a menos que seja solicitado explicitamente.

---

# QUANDO UMA ALTERAÇÃO EXIGIR BACKEND

Se perceber que uma solicitação exige alteração no banco ou backend:

NÃO faça automaticamente.

Explique:

1. Qual alteração seria necessária.
2. Por que ela é necessária.
3. Quais arquivos/tabelas seriam afetados.

Depois aguarde autorização do usuário.

---

# IMPORTANTE

O usuário pode solicitar explicitamente alterações no backend.

Nesse caso, siga a solicitação, mas:

- Explique o que será alterado.
- Evite alterações destrutivas.
- Preserve dados existentes.
- Preserve RLS e segurança.
- Faça alterações mínimas.
- Nunca apague dados sem confirmação explícita.

---

# PRINCÍPIO FINAL

Quando houver dúvida entre alterar FRONTEND ou BACKEND:

PRIORIZE O FRONTEND.

Quando uma solução puder ser feita somente no frontend, não altere o backend.

Sempre preserve o funcionamento atual do sistema.