import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserList } from "./UserList";
import { ApiService } from "../../services/apiService";
import type { User, Post } from "../../services/apiService";

/**
 * TESTES DE INTEGRAÇÃO COM MOCKS - USER LIST COMPONENT
 * Demonstra isolamento de APIs em testes de componentes React
 */
describe("UserList - Testes de Integração com Mocks", () => {
  let mockApiService: ApiService;

  beforeEach(() => {
    mockApiService = {
      getUsers: vi.fn(),
      getUser: vi.fn(),
      getUserPosts: vi.fn(),
      createPost: vi.fn(),
    } as unknown as ApiService;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Carregamento inicial de usuários", () => {
    // Teste positivo - carregamento bem sucedido
    it("deve carregar e exibir lista de usuários", async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          username: "johndoe",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          username: "janesmith",
        },
      ];

      vi.mocked(mockApiService.getUsers).mockResolvedValue(mockUsers);

      render(<UserList apiService={mockApiService} />);

      // Verificar estado de loading
      expect(screen.getByTestId("loading")).toBeInTheDocument();

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });

      // Verificar usuários carregados
      expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("user-item-2")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();

      // Verificar que a API foi chamada
      expect(mockApiService.getUsers).toHaveBeenCalledTimes(1);
    });

    // Teste negativo - erro no carregamento
    it("deve exibir erro quando falha ao carregar usuários", async () => {
      vi.mocked(mockApiService.getUsers).mockRejectedValue(
        new Error("Network error")
      );

      render(<UserList apiService={mockApiService} />);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Network error"
        );
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });
    });

    // Teste com lista vazia
    it("deve exibir lista vazia quando não há usuários", async () => {
      vi.mocked(mockApiService.getUsers).mockResolvedValue([]);

      render(<UserList apiService={mockApiService} />);

      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
        expect(screen.queryByTestId("user-item-1")).not.toBeInTheDocument();
      });
    });
  });

  describe("Seleção de usuário e carregamento de posts", () => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        username: "johndoe",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        username: "janesmith",
      },
    ];

    beforeEach(async () => {
      vi.mocked(mockApiService.getUsers).mockResolvedValue(mockUsers);
      render(<UserList apiService={mockApiService} />);

      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });
    });

    // Teste positivo - carregamento de posts bem sucedido
    it("deve carregar posts ao selecionar usuário", async () => {
      const mockPosts: Post[] = [
        { id: 1, title: "Post 1", body: "Body of post 1", userId: 1 },
        { id: 2, title: "Post 2", body: "Body of post 2", userId: 1 },
      ];

      vi.mocked(mockApiService.getUserPosts).mockResolvedValue(mockPosts);

      // Clicar no primeiro usuário
      fireEvent.click(screen.getByTestId("user-item-1"));

      // Verificar loading state
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toBeInTheDocument();
      });

      // Aguardar carregamento dos posts
      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
        expect(
          screen.getByText(/Posts (de:|by)\s*John Doe/i)
        ).toBeInTheDocument();
        expect(screen.getByTestId("post-1")).toBeInTheDocument();
        expect(screen.getByTestId("post-2")).toBeInTheDocument();
      });

      // Verificar que a API foi chamada corretamente
      expect(mockApiService.getUserPosts).toHaveBeenCalledWith(1);
    });

    // Teste negativo - erro ao carregar posts
    it("deve exibir erro quando falha ao carregar posts", async () => {
      vi.mocked(mockApiService.getUserPosts).mockRejectedValue(
        new Error("Failed to load posts")
      );

      fireEvent.click(screen.getByTestId("user-item-1"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Failed to load posts"
        );
      });
    });

    // Teste com usuário sem posts
    it("deve exibir seção vazia quando usuário não tem posts", async () => {
      vi.mocked(mockApiService.getUserPosts).mockResolvedValue([]);

      fireEvent.click(screen.getByTestId("user-item-1"));

      await waitFor(() => {
        expect(
          screen.getByText(/Posts (de:|by)\s*John Doe/i)
        ).toBeInTheDocument();
        // Não deve haver posts
        expect(screen.queryByTestId("post-1")).not.toBeInTheDocument();
      });
    });

    // Teste de mudança de usuário selecionado
    it("deve carregar posts do novo usuário ao trocar seleção", async () => {
      const postsUser1: Post[] = [
        { id: 1, title: "John Post", body: "John body", userId: 1 },
      ];
      const postsUser2: Post[] = [
        { id: 2, title: "Jane Post", body: "Jane body", userId: 2 },
      ];

      // Primeiro usuário
      vi.mocked(mockApiService.getUserPosts).mockResolvedValueOnce(postsUser1);
      fireEvent.click(screen.getByTestId("user-item-1"));

      await waitFor(() => {
        expect(
          screen.getByText(/Posts (de:|by)\s*John Doe/i)
        ).toBeInTheDocument();
        expect(screen.getByText("John Post")).toBeInTheDocument();
      });

      // Segundo usuário
      vi.mocked(mockApiService.getUserPosts).mockResolvedValueOnce(postsUser2);
      fireEvent.click(screen.getByTestId("user-item-2"));

      await waitFor(() => {
        expect(
          screen.getByText(/Posts (de:|by)\s*Jane Smith/i)
        ).toBeInTheDocument();
        expect(screen.getByText("Jane Post")).toBeInTheDocument();
        expect(screen.queryByText("John Post")).not.toBeInTheDocument();
      });

      // Verificar chamadas corretas da API
      expect(mockApiService.getUserPosts).toHaveBeenCalledWith(1);
      expect(mockApiService.getUserPosts).toHaveBeenCalledWith(2);
      expect(mockApiService.getUserPosts).toHaveBeenCalledTimes(2);
    });
  });

  describe("Funcionalidade de refresh", () => {
    it("deve recarregar usuários ao clicar em refresh", async () => {
      const initialUsers: User[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          username: "johndoe",
        },
      ];
      const refreshedUsers: User[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          username: "johndoe",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          username: "janesmith",
        },
      ];

      // Primeiro carregamento
      vi.mocked(mockApiService.getUsers).mockResolvedValueOnce(initialUsers);
      render(<UserList apiService={mockApiService} />);

      await waitFor(() => {
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
        expect(screen.queryByTestId("user-item-2")).not.toBeInTheDocument();
      });

      // Refresh
      vi.mocked(mockApiService.getUsers).mockResolvedValueOnce(refreshedUsers);
      fireEvent.click(screen.getByTestId("refresh-button"));

      await waitFor(() => {
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
        expect(screen.getByTestId("user-item-2")).toBeInTheDocument();
      });

      // Verificar que foi chamado duas vezes
      expect(mockApiService.getUsers).toHaveBeenCalledTimes(2);
    });

    // Teste com refresh desabilitado durante loading
    it("deve desabilitar botão refresh durante carregamento", async () => {
      // Mock que demora para resolver
      vi.mocked(mockApiService.getUsers).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      render(<UserList apiService={mockApiService} />);

      const refreshButton = screen.getByTestId("refresh-button");
      expect(refreshButton).toBeDisabled();

      await waitFor(
        () => {
          expect(refreshButton).not.toBeDisabled();
        },
        { timeout: 200 }
      );
    });
  });

  describe("Estados de UI durante operações assíncronas", () => {
    it("deve mostrar loading correto para cada operação", async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          username: "johndoe",
        },
      ];

      // Mock com delay para simular carregamento
      vi.mocked(mockApiService.getUsers).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockUsers), 50))
      );
      vi.mocked(mockApiService.getUserPosts).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 50))
      );

      render(<UserList apiService={mockApiService} />);

      // Loading inicial
      expect(screen.getByTestId("loading")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
      });

      // Clicar em usuário
      fireEvent.click(screen.getByTestId("user-item-1"));

      // Loading dos posts
      expect(screen.getByTestId("loading")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });
    });

    it("deve limpar erros ao iniciar nova operação bem sucedida", async () => {
      // Primeiro, falha no carregamento
      vi.mocked(mockApiService.getUsers).mockRejectedValueOnce(
        new Error("Network error")
      );
      render(<UserList apiService={mockApiService} />);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toBeInTheDocument();
      });

      // Depois, sucesso no refresh
      const mockUsers: User[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          username: "johndoe",
        },
      ];
      vi.mocked(mockApiService.getUsers).mockResolvedValueOnce(mockUsers);

      fireEvent.click(screen.getByTestId("refresh-button"));

      await waitFor(() => {
        expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        expect(screen.getByTestId("user-item-1")).toBeInTheDocument();
      });
    });
  });
});
