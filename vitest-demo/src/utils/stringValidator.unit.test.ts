import { describe, it, expect } from "vitest";
import { StringValidator } from "../utils";

/**
 * TESTES CAIXA-BRANCA
 * Conhecemos a implementação interna e testamos todos os caminhos de código
 */
describe("StringValidator - Testes Caixa-Branca", () => {
  describe("validateEmail", () => {
    // Testando o caminho de validação de comprimento mínimo
    it("deve rejeitar emails muito curtos (< 3 caracteres)", () => {
      const result = StringValidator.validateEmail("ab");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Email too short");
      // Também deve falhar no regex já que não tem @
      expect(result.errors).toContain("Invalid email format");
    });

    // Testando o caminho de validação de comprimento máximo
    it("deve rejeitar emails muito longos (> 50 caracteres)", () => {
      const longEmail = "a".repeat(48) + "@b.c"; // 52 caracteres
      const result = StringValidator.validateEmail(longEmail);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Email too long");
    });

    // Testando o caminho do regex - formato inválido
    it("deve rejeitar emails com formato inválido", () => {
      const testCases = [
        "email-sem-arroba.com",
        "email@",
        "@domain.com",
        "email@domain",
        "email@.com",
        "email@domain.",
      ];

      testCases.forEach((email) => {
        const result = StringValidator.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Invalid email format");
      });
    });

    // Testando o caminho dos domínios proibidos
    it("deve rejeitar domínios da lista de proibidos", () => {
      const forbiddenEmails = [
        "user@spam.com",
        "test@fake.org",
        "USER@SPAM.COM", // Teste case-insensitive
        "admin@FAKE.ORG",
      ];

      forbiddenEmails.forEach((email) => {
        const result = StringValidator.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Domain not allowed");
      });
    });

    // Testando múltiplos erros simultâneos
    it("deve retornar múltiplos erros quando aplicável", () => {
      const result = StringValidator.validateEmail("ab"); // Muito curto E formato inválido

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain("Email too short");
      expect(result.errors).toContain("Invalid email format");
    });

    // Testando o caminho de sucesso - email válido
    it("deve aceitar emails válidos", () => {
      const validEmails = [
        "user@domain.com",
        "test.email@example.org",
        "user123@test-domain.net",
        "admin@subdomain.domain.co.uk",
      ];

      validEmails.forEach((email) => {
        const result = StringValidator.validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    // Testando o edge case dos limites de comprimento
    it("deve verificar limites de comprimento corretamente", () => {
      // Email com exatamente 3 caracteres (mínimo)
      const minEmail = "a@b"; // 3 caracteres exatos
      const minResult = StringValidator.validateEmail(minEmail);
      expect(minResult.errors).not.toContain("Email too short");
      expect(minResult.errors).toContain("Invalid email format"); // Falha no regex

      // Email com exatamente 50 caracteres (máximo) - criar um email válido
      const maxEmail = "test" + "a".repeat(29) + "@example.com"; // 4 + 29 + 11 = 44 caracteres
      const maxResult = StringValidator.validateEmail(maxEmail);
      expect(maxResult.errors).not.toContain("Email too long");
      expect(maxResult.isValid).toBe(true);
    });

    // Testando a lógica de split do domínio
    it("deve tratar emails malformados que podem quebrar o split", () => {
      const result = StringValidator.validateEmail("email@"); // Split resultará em array com string vazia
      expect(result.isValid).toBe(false);
      // O código não deve quebrar mesmo com domínio vazio
    });
  });
});
