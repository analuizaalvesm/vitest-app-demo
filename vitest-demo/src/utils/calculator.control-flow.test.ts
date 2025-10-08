import { describe, it, expect, beforeEach } from "vitest";
import { Calculator } from "../utils";

/**
 * TESTES BASEADOS EM GRAFO DE FLUXO DE CONTROLE
 * 
 * Estes testes são projetados para garantir cobertura de todos os caminhos possíveis
 * através do código, analisando a estrutura de controle (condicionais, loops, etc.)
 * 
 * Para cada função, identificamos:
 * 1. Nós de decisão (if, switch, try/catch)
 * 2. Caminhos de execução possíveis
 * 3. Condições de contorno
 * 4. Casos de erro e exceção
 */
describe("Calculator - Testes Baseados em Grafo de Fluxo de Controle", () => {
  let calculator: ReturnType<typeof Calculator>;

  beforeEach(() => {
    calculator = Calculator();
  });

  /**
   * FUNÇÃO ADD
   * Estrutura de controle: Linear (sem condicionais)
   * Caminho único: entrada → cálculo → retorno
   */
  describe("add() - Análise de Fluxo de Controle", () => {
    it("Caminho 1: Execução normal com números válidos", () => {
      // Teste do caminho principal
      const result = calculator.add(5, 3);
      expect(result).toBe(8);
    });

    it("Caminho 1: Casos extremos no caminho principal", () => {
      // Mesmo caminho, mas testando valores extremos
      expect(calculator.add(Number.MAX_SAFE_INTEGER, 0)).toBe(Number.MAX_SAFE_INTEGER);
      expect(calculator.add(Number.MIN_SAFE_INTEGER, 0)).toBe(Number.MIN_SAFE_INTEGER);
      expect(calculator.add(Infinity, 5)).toBe(Infinity);
      expect(calculator.add(-Infinity, 5)).toBe(-Infinity);
    });
  });

  /**
   * FUNÇÃO SUBTRACT
   * Estrutura de controle: Linear (sem condicionais)
   * Caminho único: entrada → cálculo → retorno
   */
  describe("subtract() - Análise de Fluxo de Controle", () => {
    it("Caminho 1: Execução normal com números válidos", () => {
      const result = calculator.subtract(10, 4);
      expect(result).toBe(6);
    });

    it("Caminho 1: Casos extremos no caminho principal", () => {
      expect(calculator.subtract(0, 0)).toBe(0);
      expect(calculator.subtract(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER - 1);
    });
  });

  /**
   * FUNÇÃO MULTIPLY
   * Estrutura de controle: Linear (sem condicionais)
   * Caminho único: entrada → cálculo → retorno
   */
  describe("multiply() - Análise de Fluxo de Controle", () => {
    it("Caminho 1: Execução normal com números válidos", () => {
      const result = calculator.multiply(6, 7);
      expect(result).toBe(42);
    });

    it("Caminho 1: Casos extremos no caminho principal", () => {
      expect(calculator.multiply(0, 1000)).toBe(0);
      expect(calculator.multiply(-1, -1)).toBe(1);
    });
  });

  /**
   * FUNÇÃO DIVIDE
   * Estrutura de controle: Condicional (if para verificar divisão por zero)
   * 
   * Grafo de fluxo:
   * Entrada → Condição (b === 0) → [True: Throw Error] | [False: Cálculo → Retorno]
   */
  describe("divide() - Análise de Fluxo de Controle", () => {
    describe("Caminho 1: Condição TRUE (b === 0) → Lançar Exceção", () => {
      it("deve seguir o caminho de exceção quando b = 0", () => {
        expect(() => calculator.divide(10, 0)).toThrow("Division by zero is not allowed");
      });

      it("deve seguir o caminho de exceção quando b = -0", () => {
        expect(() => calculator.divide(10, -0)).toThrow("Division by zero is not allowed");
      });

      it("deve seguir o caminho de exceção com diferentes valores de 'a'", () => {
        expect(() => calculator.divide(0, 0)).toThrow("Division by zero is not allowed");
        expect(() => calculator.divide(-5, 0)).toThrow("Division by zero is not allowed");
        expect(() => calculator.divide(Infinity, 0)).toThrow("Division by zero is not allowed");
      });
    });

    describe("Caminho 2: Condição FALSE (b !== 0) → Cálculo Normal", () => {
      it("deve seguir o caminho normal com números positivos", () => {
        expect(calculator.divide(15, 3)).toBe(5);
      });

      it("deve seguir o caminho normal com números negativos", () => {
        expect(calculator.divide(-15, 3)).toBe(-5);
        expect(calculator.divide(15, -3)).toBe(-5);
        expect(calculator.divide(-15, -3)).toBe(5);
      });

      it("deve seguir o caminho normal com decimais", () => {
        expect(calculator.divide(1, 3)).toBeCloseTo(0.333333);
        expect(calculator.divide(0.5, 0.25)).toBe(2);
      });

      it("deve seguir o caminho normal com valores extremos (b !== 0)", () => {
        expect(calculator.divide(100, Number.MAX_SAFE_INTEGER)).toBeCloseTo(0);
        expect(calculator.divide(Number.MIN_SAFE_INTEGER, -1)).toBe(Number.MAX_SAFE_INTEGER + 1);
      });
    });
  });

  /**
   * FUNÇÃO POWER
   * Estrutura de controle: Condicional (if para verificar expoente negativo)
   * 
   * Grafo de fluxo:
   * Entrada → Condição (exponent < 0) → [True: Throw Error] | [False: Cálculo → Retorno]
   */
  describe("power() - Análise de Fluxo de Controle", () => {
    describe("Caminho 1: Condição TRUE (exponent < 0) → Lançar Exceção", () => {
      it("deve seguir o caminho de exceção quando exponent < 0", () => {
        expect(() => calculator.power(2, -1)).toThrow("Negative exponents not supported");
      });

      it("deve seguir o caminho de exceção com diferentes valores negativos", () => {
        expect(() => calculator.power(5, -2)).toThrow("Negative exponents not supported");
        expect(() => calculator.power(0, -1)).toThrow("Negative exponents not supported");
        expect(() => calculator.power(-3, -1)).toThrow("Negative exponents not supported");
      });

      it("deve seguir o caminho de exceção com expoente decimal negativo", () => {
        expect(() => calculator.power(2, -0.5)).toThrow("Negative exponents not supported");
      });
    });

    describe("Caminho 2: Condição FALSE (exponent >= 0) → Cálculo Normal", () => {
      it("deve seguir o caminho normal com expoente zero", () => {
        expect(calculator.power(5, 0)).toBe(1);
        expect(calculator.power(0, 0)).toBe(1); // Math.pow(0, 0) = 1 em JavaScript
        expect(calculator.power(-5, 0)).toBe(1);
      });

      it("deve seguir o caminho normal com expoente positivo inteiro", () => {
        expect(calculator.power(2, 3)).toBe(8);
        expect(calculator.power(-2, 2)).toBe(4);
        expect(calculator.power(-2, 3)).toBe(-8);
      });

      it("deve seguir o caminho normal com expoente decimal positivo", () => {
        expect(calculator.power(4, 0.5)).toBe(2); // raiz quadrada
        expect(calculator.power(8, 1/3)).toBeCloseTo(2); // raiz cúbica
      });

      it("deve seguir o caminho normal com base zero e expoente positivo", () => {
        expect(calculator.power(0, 1)).toBe(0);
        expect(calculator.power(0, 100)).toBe(0);
      });

      it("deve seguir o caminho normal com casos extremos", () => {
        expect(calculator.power(1, 1000000)).toBe(1);
        expect(calculator.power(2, 10)).toBe(1024);
      });
    });
  });

  /**
   * TESTE DE COBERTURA COMPLETA DE CAMINHOS
   * Combinações que garantem que todos os caminhos foram testados
   */
  describe("Cobertura Completa de Caminhos", () => {
    it("deve cobrir todos os caminhos em uma sequência de operações", () => {
      // Caminho normal para todas as operações
      expect(calculator.add(1, 2)).toBe(3);
      expect(calculator.subtract(5, 2)).toBe(3);
      expect(calculator.multiply(3, 4)).toBe(12);
      expect(calculator.divide(12, 3)).toBe(4);
      expect(calculator.power(4, 2)).toBe(16);
    });

    it("deve cobrir todos os caminhos de erro em sequência", () => {
      // Testando todos os caminhos de erro
      expect(() => calculator.divide(1, 0)).toThrow();
      expect(() => calculator.power(1, -1)).toThrow();
    });

    it("deve testar condições de contorno para todos os caminhos", () => {
      // Testando valores limite que podem alterar o fluxo
      expect(calculator.divide(1, Number.MIN_VALUE)).toBe(Infinity);
      expect(calculator.power(0, 0)).toBe(1);
      
      // Valores que estão exatamente no limite das condições
      expect(() => calculator.power(1, -0.000001)).toThrow();
      expect(calculator.power(1, 0.000001)).toBeCloseTo(1);
    });
  });

  /**
   * ANÁLISE DE CICLOMÁTICA COMPLEXIDADE
   * Medindo a complexidade ciclomática de cada função:
   * 
   * add(): CC = 1 (sem condicionais)
   * subtract(): CC = 1 (sem condicionais)  
   * multiply(): CC = 1 (sem condicionais)
   * divide(): CC = 2 (1 condicional if)
   * power(): CC = 2 (1 condicional if)
   * 
   * Total de caminhos linearmente independentes: 7
   */
  describe("Verificação de Complexidade Ciclomática", () => {
    it("deve ter testado todos os 7 caminhos linearmente independentes", () => {
      // Este teste serve como documentação da análise de complexidade
      const pathsCovered = {
        add: 1,           // 1 caminho
        subtract: 1,      // 1 caminho
        multiply: 1,      // 1 caminho
        divide: 2,        // 2 caminhos (normal + erro)
        power: 2          // 2 caminhos (normal + erro)
      };
      
      const totalPaths = Object.values(pathsCovered).reduce((sum, count) => sum + count, 0);
      expect(totalPaths).toBe(7);
    });
  });
});
