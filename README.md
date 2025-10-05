# 🧪 Vitest - Demo Application

Uma aplicação completa de demonstração do **Vitest** com diferentes técnicas de teste, incluindo **testes caixa-preta**, **caixa-branca**, **caixa-cinza**, **testes unitários**, **testes de integração**, e **mocking de APIs**.

## 📋 Índice

- [Características](#características)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Configuração](#instalação-e-configuração)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Técnicas de Teste Demonstradas](#técnicas-de-teste-demonstradas)
- [Exemplos de Uso](#exemplos-de-uso)
- [Relatórios de Cobertura](#relatórios-de-cobertura)
- [Tipos de Teste Implementados](#tipos-de-teste-implementados)

## ✨ Características

- **Interface moderna** com React + TypeScript + Vite
- **Múltiplas técnicas de teste** (caixa-preta, caixa-branca, caixa-cinza)
- **Testes unitários e de integração** completos
- **Mocking de APIs** com isolamento de dependências
- **Interface de testes** interativa com `vitest --ui`
- **Modo watch** para desenvolvimento com `vitest --watch`
- **Relatórios de cobertura** detalhados
- **Componentes React** testáveis (Calculator, TodoList, UserList)

## 🛠 Tecnologias Utilizadas

- **React 19** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Vitest** - Framework de testes
- **Testing Library** - Utilitários para testar React
- **MSW** - Mock Service Worker para APIs
- **JSdom** - Ambiente DOM para testes

## 🚀 Instalação e Configuração

1. **Clone o repositório:**

```bash
git clone <url-do-repositorio>
cd vitest-demo
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Execute a aplicação:**

```bash
npm run dev
```

4. **Execute os testes:**

```bash
npm test
```

## 📜 Scripts Disponíveis

| Script                     | Descrição                            |
| -------------------------- | ------------------------------------ |
| `npm run dev`              | Inicia o servidor de desenvolvimento |
| `npm run build`            | Gera build de produção               |
| `npm test`                 | Executa testes em modo watch         |
| `npm run test:ui`          | **Interface gráfica do Vitest**      |
| `npm run test:watch`       | **Modo watch para desenvolvimento**  |
| `npm run test:run`         | Executa todos os testes uma vez      |
| `npm run test:coverage`    | **Gera relatório de cobertura**      |
| `npm run test:unit`        | Executa apenas testes unitários      |
| `npm run test:integration` | Executa apenas testes de integração  |

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── CalculatorComponent.tsx
│   ├── TodoList.tsx
│   ├── UserList.tsx
│   ├── *.integration.test.tsx  # Testes de integração
├── services/            # Serviços e APIs
│   ├── apiService.ts
│   └── *.unit.test.ts   # Testes unitários com mocks
├── utils/               # Utilitários e lógica de negócio
│   ├── index.ts         # Calculator, StringValidator, UserManager
│   └── *.unit.test.ts   # Testes unitários
├── test/
│   └── setup.ts         # Configuração global dos testes
├── App.tsx              # Componente principal
└── main.tsx             # Entry point
```

## 🔬 Técnicas de Teste Demonstradas

### 1. **Testes Caixa-Preta** 🔳

**Arquivo:** `src/utils/calculator.unit.test.ts`

Testamos apenas **entradas e saídas**, sem conhecer a implementação interna.

```typescript
// Exemplo: Testando função de adição
it("deve somar dois números positivos corretamente", () => {
  expect(calculator.add(2, 3)).toBe(5); // Entrada: 2, 3 → Saída: 5
});

// Teste negativo
it("deve lançar erro ao dividir por zero", () => {
  expect(() => calculator.divide(5, 0)).toThrow(
    "Division by zero is not allowed"
  );
});
```

### 2. **Testes Caixa-Branca** ⬜

**Arquivo:** `src/utils/stringValidator.unit.test.ts`

Conhecemos a **implementação interna** e testamos todos os caminhos de código.

```typescript
// Testando caminhos específicos do código
it("deve rejeitar domínios da lista de proibidos", () => {
  // Sabemos que existe uma lista interna: ['spam.com', 'fake.org']
  const result = StringValidator.validateEmail("user@spam.com");
  expect(result.errors).toContain("Domain not allowed");
});
```

### 3. **Testes Caixa-Cinza** 🔘

**Arquivo:** `src/utils/userManager.unit.test.ts`

**Combinação** de conhecimento interno + comportamento externo.

```typescript
// Sabemos que UserManager usa StringValidator internamente
it("deve rejeitar email inválido usando StringValidator", () => {
  expect(() => {
    userManager.createUser("João", "email-inválido");
  }).toThrow("Invalid email: Invalid email format");
});

// Sabemos sobre trim() e toLowerCase() internos
it("deve fazer trim do nome e converter email para lowercase", () => {
  const userId = userManager.createUser("  João  ", "JOAO@EMAIL.COM");
  const user = userManager.getUser(userId);

  expect(user?.name).toBe("João"); // trim aplicado
  expect(user?.email).toBe("joao@email.com"); // toLowerCase aplicado
});
```

## 🧪 Tipos de Teste Implementados

### **Testes Unitários**

- ✅ **Testes positivos** - Cenários de sucesso
- ✅ **Testes negativos** - Cenários de falha esperada
- ✅ **Testes de exceção** - Tratamento de erros
- ✅ **Testes de edge cases** - Casos limites

### **Testes de Integração**

- ✅ **Integração React + Lógica de negócio**
- ✅ **Eventos de UI + Estado**
- ✅ **Fluxos completos de usuário**

### **Testes com Mocks**

- ✅ **Isolamento de APIs** externas
- ✅ **Mock de fetch** e respostas HTTP
- ✅ **Simulação de erros** de rede
- ✅ **Verificação de chamadas** de API

## 📊 Exemplos de Uso

### 1. **Executar Interface Gráfica do Vitest**

```bash
npm run test:ui
```

Abre uma interface web interativa onde você pode:

- Ver todos os testes em tempo real
- Executar testes específicos
- Ver resultados detalhados
- Navegar pelos arquivos de teste

### 2. **Modo Watch para Desenvolvimento**

```bash
npm run test:watch
```

Os testes são executados automaticamente quando você modifica arquivos.

### 3. **Gerar Relatório de Cobertura**

```bash
npm run test:coverage
```

**Resultado esperado:**

```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   84.7  |   91.2   |  94.11  |   84.7  |
 src/components           |   98.76 |    90    |   100   |  98.76  |
 src/services             |   94.59 |   90.9   |   100   |  94.59  |
 src/utils                |   100   |   100    |   100   |   100   |
--------------------------|---------|----------|---------|---------|
```

### 4. **Executar Tipos Específicos de Teste**

```bash
# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration
```

## 📈 Relatórios de Cobertura

A aplicação gera relatórios de cobertura em **3 formatos**:

1. **Terminal** - Tabela resumida
2. **JSON** - Para integração com CI/CD
3. **HTML** - Relatório visual navegável

O relatório HTML é gerado em `coverage/index.html` e pode ser aberto no navegador para análise detalhada.

## 🎯 Componentes da Aplicação

### **Calculator Component**

- Operações matemáticas básicas (+ - × ÷ ^)
- Validação de entrada
- Tratamento de erros (divisão por zero, expoentes negativos)

### **TodoList Component**

- Adicionar, remover e marcar tarefas como concluídas
- Contadores de progresso
- Validação de entrada

### **UserList Component**

- Integração com API externa (JSONPlaceholder)
- Carregamento de usuários e posts
- Estados de loading e erro
- Mocking completo para testes

## 🔧 Configuração do Vitest

**Arquivo:** `vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Funções globais (describe, it, expect)
    environment: "jsdom", // Ambiente DOM para React
    setupFiles: ["./src/test/setup.ts"],
    css: true, // Suporte a CSS nos testes
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts"],
    },
  },
});
```

## 🚀 Próximos Passos

Para expandir ainda mais a demonstração, você pode:

1. **Adicionar testes E2E** com Playwright
2. **Implementar testes de performance**
3. **Configurar CI/CD** com GitHub Actions
4. **Adicionar testes de acessibilidade**
5. **Implementar testes de snapshot**

---

## 📝 Conclusão

Esta aplicação demonstra de forma completa e didática como implementar diferentes técnicas de teste com Vitest, desde **testes unitários** simples até **integrações complexas** com mocking de APIs.

**Principais aprendizados:**

- ✅ Diferenças entre **caixa-preta**, **caixa-branca** e **caixa-cinza**
- ✅ Como testar **componentes React** com Testing Library
- ✅ **Mocking efetivo** de APIs e dependências externas
- ✅ **Análise de cobertura** para garantir qualidade
- ✅ **Ferramentas visuais** para desenvolvimento orientado a testes
