import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiService } from "../services/apiService";

/**
 * TESTES COM MOCKS - API SERVICE
 * Demonstra isolamento de dependências externas usando mocks
 */
describe("ApiService - Testes com Mocks", () => {
  let apiService: ApiService;

  beforeEach(() => {
    apiService = new ApiService();
    // Mock do fetch global
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getUsers", () => {
    // Teste positivo com mock de resposta bem sucedida
    it("deve retornar lista de usuários quando API responde corretamente", async () => {
      const mockUsers = [
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

      // Mock da resposta do fetch
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      } as Response);

      const result = await apiService.getUsers();

      expect(fetch).toHaveBeenCalledWith(
        "https://jsonplaceholder.typicode.com/users"
      );
      expect(result).toEqual(mockUsers);
    });

    // Teste negativo com mock de erro HTTP
    it("deve lançar erro quando API retorna status de erro", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(apiService.getUsers()).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });

    // Teste de exceção com mock de erro de rede
    it("deve lançar erro quando há falha de rede", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      await expect(apiService.getUsers()).rejects.toThrow("Network error");
    });
  });

  describe("getUser", () => {
    // Teste positivo
    it("deve retornar usuário específico", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        username: "johndoe",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      const result = await apiService.getUser(1);

      expect(fetch).toHaveBeenCalledWith(
        "https://jsonplaceholder.typicode.com/users/1"
      );
      expect(result).toEqual(mockUser);
    });

    // Teste negativo - usuário não encontrado
    it("deve lançar erro para usuário não encontrado", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(apiService.getUser(999)).rejects.toThrow(
        "HTTP error! status: 404"
      );
    });
  });

  describe("getUserPosts", () => {
    // Teste positivo
    it("deve retornar posts do usuário", async () => {
      const mockPosts = [
        { id: 1, title: "Post 1", body: "Body 1", userId: 1 },
        { id: 2, title: "Post 2", body: "Body 2", userId: 1 },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      } as Response);

      const result = await apiService.getUserPosts(1);

      expect(fetch).toHaveBeenCalledWith(
        "https://jsonplaceholder.typicode.com/posts?userId=1"
      );
      expect(result).toEqual(mockPosts);
    });

    // Teste com usuário sem posts
    it("deve retornar array vazio para usuário sem posts", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      const result = await apiService.getUserPosts(999);

      expect(result).toEqual([]);
    });
  });

  describe("createPost", () => {
    // Teste positivo
    it("deve criar novo post corretamente", async () => {
      const newPost = { title: "New Post", body: "New Body", userId: 1 };
      const createdPost = { id: 101, ...newPost };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdPost),
      } as Response);

      const result = await apiService.createPost(newPost);

      expect(fetch).toHaveBeenCalledWith(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPost),
        }
      );
      expect(result).toEqual(createdPost);
    });

    // Teste negativo - erro na criação
    it("deve lançar erro quando falha ao criar post", async () => {
      const newPost = { title: "New Post", body: "New Body", userId: 1 };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      await expect(apiService.createPost(newPost)).rejects.toThrow(
        "HTTP error! status: 400"
      );
    });
  });

  describe("Integração com diferentes tipos de resposta", () => {
    // Teste com resposta malformada
    it("deve lidar com resposta JSON inválida", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      } as Response);

      await expect(apiService.getUsers()).rejects.toThrow("Invalid JSON");
    });

    // Teste de timeout simulado
    it("deve lidar com timeout de requisição", async () => {
      vi.mocked(fetch).mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100)
          )
      );

      await expect(apiService.getUsers()).rejects.toThrow("Timeout");
    });
  });

  describe("Verificação de chamadas de API", () => {
    it("deve fazer apenas uma chamada para cada método", async () => {
      const mockUser = {
        id: 1,
        name: "John",
        email: "john@example.com",
        username: "john",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      await apiService.getUser(1);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("deve fazer múltiplas chamadas independentes corretamente", async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 1,
              name: "John",
              email: "john@example.com",
              username: "john",
            }),
        } as Response);

      await apiService.getUsers();
      await apiService.getUser(1);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        "https://jsonplaceholder.typicode.com/users"
      );
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        "https://jsonplaceholder.typicode.com/users/1"
      );
    });
  });
});
