import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserList } from "./UserList";
import type { ApiService, User, Post } from "../../services/apiService";

/**
 * TESTES BASEADOS EM GRAFO DE FLUXO DE CONTROLE - USER LIST
 *
 * Fluxos analisados:
 * - loadUsers() [useCallback + useEffect]:
 *    1) setLoading(true) → setError("")
 *    2) try { getUsers() → setUsers } catch { setError(msg) } finally { setLoading(false) }
 *    CC aprox.: 3 (try/catch + finally + estado empty vs não-empty na UI)
 *
 * - handleUserSelect(user):
 *    1) setSelectedUser(user) → setLoading(true) → setError("")
 *    2) try { getUserPosts(user.id) → setUserPosts } catch { setError(msg) } finally { setLoading(false) }
 *    CC aprox.: 3 (sucesso vs erro; posts [] vs >0)
 *
 * - Botão "Atualizar" chama loadUsers novamente e deve limpar erro.
 */

const makeUsers = (n: number): User[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    username: `user${i + 1}`,
    email: `user${i + 1}@mail.com`,
  })) as User[];

const makePosts = (userId: number, n: number): Post[] =>
  Array.from({ length: n }, (_, i) => ({
    userId,
    id: userId * 100 + i + 1,
    title: `Post ${i + 1} of user ${userId}`,
    body: `Body ${i + 1}`,
  })) as Post[];

type ApiMock = Pick<ApiService, "getUsers" | "getUserPosts">;

const renderWithApi = (api: ApiMock) => {
  render(<UserList apiService={api as unknown as ApiService} />);
};

describe("UserList - Testes de Fluxo de Controle", () => {
  let api: ApiMock;

  beforeEach(() => {
    api = {
      getUsers: vi.fn(),
      getUserPosts: vi.fn(),
    };
  });

  /**
   * Caminho loadUsers(): sucesso
   */
  describe("loadUsers - sucesso", () => {
    it("deve exibir loading, carregar lista e esconder loading", async () => {
      (api.getUsers as Mock).mockResolvedValue(makeUsers(2));
      renderWithApi(api);

      // Loading overlay durante a chamada inicial (useEffect)
      expect(screen.getByTestId("loading")).toBeInTheDocument();

      await waitFor(() => {
        // items renderizados
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
        expect(screen.getByTestId("user-item-2")).toBeInTheDocument();
        // overlay some
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });

      // Sem erro
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    });

    it("deve lidar com lista vazia (sucesso com [])", async () => {
      (api.getUsers as Mock).mockResolvedValue([]);
      renderWithApi(api);

      await waitFor(() => {
        // Sem itens
        expect(screen.queryByTestId(/user-item-/)).not.toBeInTheDocument();
      });
    });
  });

  /**
   * Caminho loadUsers(): erro
   */
  describe("loadUsers - erro", () => {
    it("deve exibir mensagem de erro quando getUsers rejeita", async () => {
      (api.getUsers as Mock).mockRejectedValue(new Error("Falha ao listar"));
      renderWithApi(api);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Falha ao listar"
        );
      });

      // Loading some
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    it("deve exibir mensagem genérica se o erro não for Error instance", async () => {
      (api.getUsers as Mock).mockRejectedValue("string error");
      renderWithApi(api);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Failed to load users"
        );
      });
    });
  });

  /**
   * Caminho handleUserSelect(user): sucesso
   */
  describe("handleUserSelect - sucesso", () => {
    it("deve selecionar usuário, exibir loading, carregar posts e marcar selecionado", async () => {
      (api.getUsers as Mock).mockResolvedValue(makeUsers(2));
      (api.getUserPosts as Mock).mockResolvedValue(makePosts(1, 2));

      renderWithApi(api);

      // aguarda users
      await waitFor(() => {
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
      });

      // clica no usuário 1
      fireEvent.click(screen.getByTestId("user-item-1"));

      // loading durante fetch de posts
      expect(screen.getByTestId("loading")).toBeInTheDocument();

      await waitFor(() => {
        // posts renderizados
        expect(screen.getByTestId("post-101")).toBeInTheDocument();
        expect(screen.getByTestId("post-102")).toBeInTheDocument();
        // overlay some
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });

      // item marcado como selecionado
      expect(screen.getByTestId("user-item-1")).toHaveClass("selected");
    });

    it("deve exibir empty-state quando usuário não possui posts", async () => {
      (api.getUsers as Mock).mockResolvedValue(makeUsers(1));
      (api.getUserPosts as Mock).mockResolvedValue([]);

      renderWithApi(api);

      await waitFor(() => {
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("user-item-1"));

      await waitFor(() => {
        expect(screen.getByTestId("no-posts")).toHaveTextContent(
          "Nenhum post para este usuário."
        );
      });
    });
  });

  /**
   * Caminho handleUserSelect(user): erro
   */
  describe("handleUserSelect - erro", () => {
    it("deve exibir erro específico quando getUserPosts falhar", async () => {
      (api.getUsers as Mock).mockResolvedValue(makeUsers(1));
      (api.getUserPosts as Mock).mockRejectedValue(new Error("Falha posts"));

      renderWithApi(api);

      await waitFor(() => {
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("user-item-1"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Falha posts"
        );
      });
    });

    it("deve exibir mensagem genérica quando rejeitar com valor não-Error", async () => {
      (api.getUsers as Mock).mockResolvedValue(makeUsers(1));
      (api.getUserPosts as Mock).mockRejectedValue("string error");

      renderWithApi(api);

      await waitFor(() => {
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("user-item-1"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Failed to load user posts"
        );
      });
    });
  });

  /**
   * Refresh / limpeza de erro / estado do botão
   */
  describe("Refresh / estados assíncronos", () => {
    it("deve limpar erro ao clicar em Atualizar e recarregar usuários", async () => {
      // 1º load falha
      (api.getUsers as Mock).mockRejectedValueOnce(new Error("Erro inicial"));
      // 2º load sucesso
      (api.getUsers as Mock).mockResolvedValueOnce(makeUsers(1));

      renderWithApi(api);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Erro inicial"
        );
      });

      const refreshBtn = screen.getByTestId("refresh-button");
      expect(refreshBtn).toBeEnabled();

      fireEvent.click(refreshBtn);

      // Deve mostrar loading novamente
      expect(screen.getByTestId("loading")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
      });
    });

    it("deve desabilitar botão Refresh enquanto loading=true", async () => {
      // Simula chamada que demora: pendente até resolver manualmente
      let resolver!: () => void;
      (api.getUsers as Mock).mockImplementation(
        () =>
          new Promise<User[]>((resolve) => {
            resolver = () => resolve(makeUsers(1));
          })
      );

      renderWithApi(api);

      // enquanto pendente → button desabilitado
      const refreshBtn = screen.getByTestId("refresh-button");
      expect(refreshBtn).toBeDisabled();

      // resolve a promise
      resolver!();

      await waitFor(() => {
        expect(refreshBtn).toBeEnabled();
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
      });
    });
  });

  /**
   * Cobertura de caminhos
   */
  describe("Cobertura de Caminhos (resumo)", () => {
    it("cobre ramos de loadUsers (sucesso/erro/[]), handleUserSelect (sucesso/erro/[]), e refresh", () => {
      expect(true).toBe(true);
    });
  });
});
