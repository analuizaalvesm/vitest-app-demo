import { describe, it, expect, beforeEach } from "vitest";
import { UserManager } from "../utils";

/**
 * TESTES CAIXA-CINZA
 * Combinação de conhecimento da implementação interna com testes de comportamento externo
 * Sabemos que UserManager usa StringValidator internamente, mas também testamos como caixa-preta
 */
describe("UserManager - Testes Caixa-Cinza", () => {
  let userManager: UserManager;

  beforeEach(() => {
    userManager = new UserManager();
  });

  describe("createUser", () => {
    // Teste caixa-preta: comportamento esperado
    it("deve criar usuário com dados válidos", () => {
      const userId = userManager.createUser("João Silva", "joao@email.com");

      expect(userId).toBe(1); // Sabemos que IDs começam em 1

      const user = userManager.getUser(userId);
      expect(user).toEqual({
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
        active: true,
      });
    });

    // Teste caixa-branca: sabemos que usa StringValidator.validateEmail
    it("deve rejeitar email inválido usando StringValidator", () => {
      // Sabemos internamente que usa StringValidator, então testamos cenários específicos
      expect(() => {
        userManager.createUser("João", "email-inválido");
      }).toThrow("Invalid email: Invalid email format");
    });

    // Teste caixa-branca: sabemos sobre a validação de domínios proibidos
    it("deve rejeitar domínios proibidos", () => {
      expect(() => {
        userManager.createUser("João", "user@spam.com");
      }).toThrow("Invalid email: Domain not allowed");
    });

    // Teste caixa-preta: múltiplos erros de validação
    it("deve reportar múltiplos erros de validação", () => {
      expect(() => {
        userManager.createUser("João", "ab"); // Muito curto E formato inválido
      }).toThrow("Invalid email: Email too short, Invalid email format");
    });

    // Teste caixa-branca: sabemos sobre o trim() do nome
    it("deve fazer trim do nome do usuário", () => {
      const userId = userManager.createUser("  João Silva  ", "joao@email.com");
      const user = userManager.getUser(userId);

      expect(user?.name).toBe("João Silva"); // Sem espaços extras
    });

    // Teste caixa-branca: sabemos sobre toLowerCase() do email
    it("deve converter email para lowercase", () => {
      const userId = userManager.createUser("João", "JOAO@EMAIL.COM");
      const user = userManager.getUser(userId);

      expect(user?.email).toBe("joao@email.com");
    });

    // Teste caixa-branca: sabemos sobre a sequência de IDs
    it("deve gerar IDs sequenciais", () => {
      const id1 = userManager.createUser("User 1", "user1@email.com");
      const id2 = userManager.createUser("User 2", "user2@email.com");
      const id3 = userManager.createUser("User 3", "user3@email.com");

      expect(id1).toBe(1);
      expect(id2).toBe(2);
      expect(id3).toBe(3);
    });

    // Teste caixa-branca: usuários são criados como ativos por padrão
    it("deve criar usuários como ativos por padrão", () => {
      const userId = userManager.createUser("João", "joao@email.com");
      const user = userManager.getUser(userId);

      expect(user?.active).toBe(true);
    });
  });

  describe("getUser", () => {
    // Teste caixa-preta: comportamento básico
    it("deve retornar usuário existente", () => {
      const userId = userManager.createUser("João", "joao@email.com");
      const user = userManager.getUser(userId);

      expect(user).toBeDefined();
      expect(user?.id).toBe(userId);
    });

    // Teste negativo
    it("deve retornar undefined para usuário inexistente", () => {
      const user = userManager.getUser(999);
      expect(user).toBeUndefined();
    });
  });

  describe("getAllUsers", () => {
    // Teste caixa-preta: lista vazia inicialmente
    it("deve retornar lista vazia inicialmente", () => {
      const users = userManager.getAllUsers();
      expect(users).toEqual([]);
    });

    // Teste caixa-branca: retorna cópia do array (sabemos da implementação [...this.users])
    it("deve retornar uma cópia dos usuários (não a referência original)", () => {
      userManager.createUser("João", "joao@email.com");

      const users1 = userManager.getAllUsers();
      const users2 = userManager.getAllUsers();

      // Devem ter o mesmo conteúdo mas serem objetos diferentes
      expect(users1).toEqual(users2);
      expect(users1).not.toBe(users2); // Diferentes referências
    });

    // Teste com múltiplos usuários
    it("deve retornar todos os usuários criados", () => {
      userManager.createUser("João", "joao@email.com");
      userManager.createUser("Maria", "maria@email.com");

      const users = userManager.getAllUsers();
      expect(users).toHaveLength(2);
      expect(users.map((u) => u.name)).toContain("João");
      expect(users.map((u) => u.name)).toContain("Maria");
    });
  });

  describe("deactivateUser", () => {
    // Teste positivo
    it("deve desativar usuário existente", () => {
      const userId = userManager.createUser("João", "joao@email.com");
      const result = userManager.deactivateUser(userId);

      expect(result).toBe(true);

      const user = userManager.getUser(userId);
      expect(user?.active).toBe(false);
    });

    // Teste negativo
    it("deve retornar false para usuário inexistente", () => {
      const result = userManager.deactivateUser(999);
      expect(result).toBe(false);
    });

    // Teste de integração: verificar que não afeta outros usuários
    it("deve desativar apenas o usuário especificado", () => {
      const id1 = userManager.createUser("João", "joao@email.com");
      const id2 = userManager.createUser("Maria", "maria@email.com");

      userManager.deactivateUser(id1);

      const user1 = userManager.getUser(id1);
      const user2 = userManager.getUser(id2);

      expect(user1?.active).toBe(false);
      expect(user2?.active).toBe(true); // Não deve ser afetado
    });
  });

  // Teste de cenário completo (caixa-preta + conhecimento interno)
  describe("Cenário completo", () => {
    it("deve gerenciar ciclo de vida completo do usuário", () => {
      // Criar usuário
      const userId = userManager.createUser("  JOÃO SILVA  ", "JOAO@EMAIL.COM");

      // Verificar normalização (caixa-branca)
      let user = userManager.getUser(userId);
      expect(user?.name).toBe("JOÃO SILVA"); // O trim() apenas remove espaços, não altera case
      expect(user?.email).toBe("joao@email.com");
      expect(user?.active).toBe(true);

      // Verificar na lista
      let allUsers = userManager.getAllUsers();
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0].active).toBe(true);

      // Desativar usuário
      const deactivated = userManager.deactivateUser(userId);
      expect(deactivated).toBe(true);

      // Verificar desativação
      user = userManager.getUser(userId);
      expect(user?.active).toBe(false);

      // Usuário ainda está na lista, mas inativo
      allUsers = userManager.getAllUsers();
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0].active).toBe(false);
    });
  });
});
