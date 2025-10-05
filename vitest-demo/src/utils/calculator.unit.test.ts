import { describe, it, expect, beforeEach } from "vitest";
import { Calculator } from "../utils";

/**
 * TESTES CAIXA-PRETA
 * Testamos apenas entradas e saídas, sem conhecer a implementação interna
 */
describe("Calculator - Testes Caixa-Preta", () => {
  let calculator: ReturnType<typeof Calculator>;

  beforeEach(() => {
    calculator = Calculator();
  });

  describe("Adição", () => {
    // Teste positivo
    it("deve somar dois números positivos corretamente", () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    // Teste com zero
    it("deve tratar zero corretamente", () => {
      expect(calculator.add(0, 5)).toBe(5);
      expect(calculator.add(5, 0)).toBe(5);
      expect(calculator.add(0, 0)).toBe(0);
    });

    // Teste com números negativos
    it("deve somar números negativos corretamente", () => {
      expect(calculator.add(-2, -3)).toBe(-5);
      expect(calculator.add(-2, 3)).toBe(1);
      expect(calculator.add(2, -3)).toBe(-1);
    });

    // Teste com decimais
    it("deve somar números decimais corretamente", () => {
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
      expect(calculator.add(1.5, 2.5)).toBe(4);
    });

    // Teste com números grandes
    it("deve somar números grandes corretamente", () => {
      expect(calculator.add(1000000, 2000000)).toBe(3000000);
    });
  });

  describe("Subtração", () => {
    // Testes positivos
    it("deve subtrair números corretamente", () => {
      expect(calculator.subtract(5, 3)).toBe(2);
      expect(calculator.subtract(10, 15)).toBe(-5);
    });

    // Testes com zero
    it("deve tratar zero na subtração", () => {
      expect(calculator.subtract(5, 0)).toBe(5);
      expect(calculator.subtract(0, 5)).toBe(-5);
    });
  });

  describe("Multiplicação", () => {
    // Testes positivos
    it("deve multiplicar números positivos", () => {
      expect(calculator.multiply(3, 4)).toBe(12);
    });

    // Testes com zero
    it("deve retornar zero quando multiplica por zero", () => {
      expect(calculator.multiply(5, 0)).toBe(0);
      expect(calculator.multiply(0, 5)).toBe(0);
    });

    // Testes com números negativos
    it("deve multiplicar números negativos corretamente", () => {
      expect(calculator.multiply(-3, 4)).toBe(-12);
      expect(calculator.multiply(-3, -4)).toBe(12);
    });
  });

  describe("Divisão", () => {
    // Testes positivos
    it("deve dividir números corretamente", () => {
      expect(calculator.divide(10, 2)).toBe(5);
      expect(calculator.divide(9, 3)).toBe(3);
    });

    // Teste negativo - divisão por zero
    it("deve lançar erro ao dividir por zero", () => {
      expect(() => calculator.divide(5, 0)).toThrow(
        "Division by zero is not allowed"
      );
    });

    // Testes com decimais
    it("deve dividir decimais corretamente", () => {
      expect(calculator.divide(1, 3)).toBeCloseTo(0.333333);
    });
  });

  describe("Potenciação", () => {
    // Testes positivos
    it("deve calcular potências corretamente", () => {
      expect(calculator.power(2, 3)).toBe(8);
      expect(calculator.power(5, 2)).toBe(25);
      expect(calculator.power(10, 0)).toBe(1);
    });

    // Teste negativo - expoente negativo
    it("deve lançar erro para expoentes negativos", () => {
      expect(() => calculator.power(2, -1)).toThrow(
        "Negative exponents not supported"
      );
    });

    // Teste de exceção
    it("deve tratar casos especiais", () => {
      expect(calculator.power(0, 5)).toBe(0);
      expect(calculator.power(1, 100)).toBe(1);
    });
  });
});
