import { describe, it, expect, beforeEach } from "vitest";
import { Calculator } from "../utils";

/**
 * TESTES DE ANÁLISE DE VALOR LIMITE (Boundary Value Analysis)
 * Focam em comportamentos próximos a limites numéricos, precisão e casos especiais.
 */

describe("Calculator - Boundary Value Analysis", () => {
  let calc: ReturnType<typeof Calculator>;

  beforeEach(() => {
    calc = Calculator();
  });

  describe("Adição / Subtração - limites de precisão", () => {
    it("deve evidenciar possível perda de precisão ao ultrapassar MAX_SAFE_INTEGER", () => {
      const a = Number.MAX_SAFE_INTEGER; // 9007199254740991
      const result = calc.add(a, 1);
      // Não garantimos correção matemática exata (limitação do JS), apenas documentamos o comportamento
      expect(result).not.toBe(a); // será 9007199254740992, ainda representável
      expect(result).toBe(a + 1);
    });

    it("deve subtrair próximo ao limite superior", () => {
      const a = Number.MAX_SAFE_INTEGER;
      expect(calc.subtract(a, 1)).toBe(a - 1);
    });
  });

  describe("Multiplicação - overflow numérico", () => {
    it("multiplicação que excede MAX_SAFE_INTEGER causa perda de precisão (documentação)", () => {
      const a = Number.MAX_SAFE_INTEGER;
      const product = calc.multiply(a, 2);
      // Não validamos valor exato, apenas que é um número finito e maior que a
      expect(Number.isFinite(product)).toBe(true);
      expect(product).toBeGreaterThan(a);
    });
  });

  describe("Divisão - valores extremos", () => {
    it("divisão por número muito pequeno gera número muito grande", () => {
      const tiny = 1e-12;
      const result = calc.divide(1, tiny);
      expect(result).toBeCloseTo(1 / tiny);
    });

    it("divisão que resulta em número muito pequeno", () => {
      const result = calc.divide(1e-12, 1e6);
      expect(result).toBeCloseTo(1e-18);
    });
  });

  describe("Potenciação - casos especiais", () => {
    it("0^0 retorna 1 em JavaScript e deve ser documentado", () => {
      // O código não trata explicitamente, então segue comportamento de Math.pow
      expect(calc.power(0, 0)).toBe(1);
    });

    it("0^n (n>0) retorna 0", () => {
      expect(calc.power(0, 5)).toBe(0);
    });

    it("1^n sempre retorna 1 (mesmo para expoentes grandes)", () => {
      expect(calc.power(1, 1000)).toBe(1);
    });

    it("base negativa com expoente par resulta positivo", () => {
      expect(calc.power(-2, 4)).toBe(16);
    });

    it("base negativa com expoente ímpar resulta negativo", () => {
      expect(calc.power(-2, 3)).toBe(-8);
    });

    it("expoente grande moderado (2^20)", () => {
      expect(calc.power(2, 20)).toBe(1048576);
    });

    it("deve lançar erro para expoente negativo (boundary)", () => {
      expect(() => calc.power(2, -1)).toThrow("Negative exponents not supported");
    });
  });

  describe("Combinações de sinais", () => {
    it("soma envolvendo números muito pequenos e muito grandes (possível perda de precisão)", () => {
      const result = calc.add(Number.MAX_SAFE_INTEGER, 0.1);
      // Apenas documentamos que JS não preserva precisão aqui; verificamos se é number
      expect(typeof result).toBe("number");
    });

    it("multiplicação com zero e número negativo limítrofe", () => {
      expect(calc.multiply(-0, 5)).toBe(-0); // -0 existe em IEEE 754; toBe compara bits? JS trata -0 === 0
      // Normalizamos para comportamento: -0 === 0 -> aceitar ambos
      expect(Object.is(calc.multiply(-0, 5), -0) || calc.multiply(-0, 5) === 0).toBe(true);
    });
  });
});
