# Guia: Testes Baseados em Grafo de Fluxo de Controle

## O que são Testes Baseados em Grafo de Fluxo de Controle?

Os **testes baseados em grafo de fluxo de controle** são uma técnica de teste estrutural (caixa-branca) que analisa a estrutura interna do código para garantir que todos os caminhos possíveis de execução sejam testados.

### Conceitos Fundamentais

#### 1. Grafo de Fluxo de Controle (CFG)
- **Nós**: Representam declarações ou blocos de código
- **Arestas**: Representam possíveis fluxos de execução
- **Nós de Decisão**: Pontos onde o fluxo pode seguir diferentes caminhos (if, switch, loops)

#### 2. Complexidade Ciclomática
A complexidade ciclomática mede o número de caminhos linearmente independentes através do código:
```
V(G)=P+1
```

## Implementação na Calculadora

### Análise das Funções

#### 1. Funções Lineares (V(G) = 1)
```typescript
// add(), subtract(), multiply()
// Estrutura: entrada → cálculo → retorno
// Apenas 1 caminho possível
```

#### 2. Funções com Condicionais (V(G) = 2)
```typescript
// divide()
function divide(a: number, b: number): number {
  if (b === 0) {           // Ponto de decisão
    throw new Error(...);   // Caminho 1
  }
  return a / b;            // Caminho 2
}

// power()
function power(base: number, exponent: number): number {
  if (exponent < 0) {      // Ponto de decisão
    throw new Error(...);   // Caminho 1
  }
  return Math.pow(...);    // Caminho 2
}
```

#### 3. Função com Switch (V(G) = 8)
```typescript
// handleCalculate() no componente React
function handleCalculate() {
  setError("");                    // Nó 1
  const n1 = parseFloat(num1);     // Nó 2
  const n2 = parseFloat(num2);     // Nó 3
  
  if (isNaN(n1) || isNaN(n2)) {   // Decisão 1
    setError("...");               // Caminho 1A
    return;
  }
  
  try {
    switch (operation) {           // Decisão 2 (5 casos)
      case "add":                  // Caminho 2A
        result = calculator.add(n1, n2);
        break;
      case "subtract":             // Caminho 2B
        result = calculator.subtract(n1, n2);
        break;
      case "multiply":             // Caminho 2C
        result = calculator.multiply(n1, n2);
        break;
      case "divide":               // Caminho 2D
        result = calculator.divide(n1, n2);
        break;
      case "power":                // Caminho 2E
        result = calculator.power(n1, n2);
        break;
      default:                     // Caminho 2F
        throw new Error("Invalid operation");
    }
    setResult(result.toString());  // Nó sucesso
  } catch (err) {                  // Caminho 3 (catch)
    setError(err.message);
  }
}
```

**Cálculo da Complexidade:**
- 1 (base) + 1 (if isNaN) + 5 (switch cases) + 1 (try/catch) = 8 caminhos

## Estratégias de Teste

### 1. Cobertura de Caminhos
Cada caminho linearmente independente deve ter pelo menos um teste:

```typescript
describe("Cobertura de Caminhos", () => {
  // Caminho 1: Entrada inválida
  it("deve tratar entrada inválida", () => {
    // Teste com NaN
  });
  
  // Caminhos 2A-2E: Cada operação
  it("deve executar adição", () => { /* ... */ });
  it("deve executar subtração", () => { /* ... */ });
  // ... etc
  
  // Caminho 2F: Operação inválida
  it("deve tratar operação inválida", () => { /* ... */ });
  
  // Caminho 3: Exceções
  it("deve tratar exceções das operações", () => { /* ... */ });
});
```

### 2. Testes de Condições de Contorno
Valores que estão exatamente nos limites das condições:

```typescript
describe("Condições de Contorno", () => {
  // Para divide(): b === 0 vs b !== 0
  it("deve tratar b = 0", () => { /* divisão por zero */ });
  it("deve tratar b = Number.MIN_VALUE", () => { /* menor valor não-zero */ });
  
  // Para power(): exponent < 0 vs exponent >= 0
  it("deve tratar exponent = -0.000001", () => { /* ligeiramente negativo */ });
  it("deve tratar exponent = 0", () => { /* exatamente zero */ });
  it("deve tratar exponent = 0.000001", () => { /* ligeiramente positivo */ });
});
```

### 3. Testes de Robustez
Cenários que podem quebrar as condições esperadas:

```typescript
describe("Testes de Robustez", () => {
  it("deve tratar valores extremos", () => {
    expect(calculator.add(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER + 1);
    expect(calculator.divide(1, Number.MIN_VALUE)).toBe(Infinity);
  });
  
  it("deve tratar entradas malformadas que parseFloat pode interpretar", () => {
    // "5.5abc" -> parseFloat = 5.5 (não NaN!)
    fireEvent.change(input, { target: { value: "5.5abc" } });
    // Testa se o sistema lida corretamente com isso
  });
});
```

## Vantagens dos Testes de Fluxo de Controle

### 1. **Cobertura Garantida**
- Todos os caminhos de execução são testados
- Reduz a chance de bugs em caminhos não testados

### 2. **Detecção de Código Morto**
- Identifica caminhos que nunca são executados
- Ajuda na refatoração e limpeza do código

### 3. **Análise de Complexidade**
- Mede objetivamente a complexidade do código
- Identifica funções que precisam ser simplificadas

### 4. **Testes Sistemáticos**
- Abordagem metodológica para criação de testes
- Documentação clara dos cenários cobertos

## Ferramentas e Métricas

### 1. Cobertura de Código
```bash
npm run test:coverage
```

### 2. Análise de Complexidade
Ferramentas como **ESLint** com regras de complexidade:
```json
{
  "rules": {
    "complexity": ["error", 10]
  }
}
```

### 3. Visualização de CFG
Ferramentas como **Madge** podem gerar grafos de dependência e fluxo.

## Exemplo Prático: Executando os Testes

```bash
# Executar todos os testes de fluxo de controle
npm test calculator.control-flow.test.ts

# Executar com cobertura
npm run test:coverage

# Executar testes específicos
npm test -- --grep "Fluxo de Controle"
```

## Limitações e Considerações

### 1. **Explosão Combinatória**
- Em funções muito complexas, o número de caminhos pode crescer exponencialmente
- Estratégia: dividir funções complexas em funções menores

### 2. **Caminhos Impossíveis**
- Nem todos os caminhos teoricamente possíveis são alcançáveis na prática
- Análise estática pode identificar alguns desses casos

### 3. **Manutenibilidade**
- Testes de fluxo de controle são intimamente ligados à implementação
- Mudanças no código podem quebrar muitos testes

## Conclusão

Os testes baseados em grafo de fluxo de controle oferecem uma abordagem sistemática e completa para garantir a qualidade do software. Embora exijam mais esforço inicial, eles proporcionam maior confiança na robustez do código e ajudam a identificar problemas que outros tipos de teste podem perder.

### Próximos Passos
1. Execute os testes criados
2. Analise a cobertura de código gerada
3. Identifique áreas com baixa cobertura
4. Refatore funções com alta complexidade ciclomática
5. Considere automatizar a análise de complexidade no CI/CD
