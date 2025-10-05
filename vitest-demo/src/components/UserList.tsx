import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ApiService } from "../services/apiService";
import type { User, Post } from "../services/apiService";

interface UserListProps {
  apiService?: ApiService;
  testId?: string;
}

export const UserList: React.FC<UserListProps> = ({
  apiService: externalApiService,
  testId = "user-list",
}) => {
  // Evita recriações do serviço e múltiplos reloads em modo Strict
  const apiService = useMemo(
    () => externalApiService ?? new ApiService(),
    [externalApiService]
  );
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const usersData = await apiService.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);
    setError("");

    try {
      const posts = await apiService.getUserPosts(user.id);
      setUserPosts(posts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load user posts"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid={testId} className="user-list">
      <div className="panel-header">
        <h2>Usuários (API)</h2>
        <div className="panel-description">
          Testes aqui validam integração com serviços externos usando mocks de
          API:
          <ul>
            <li>
              <strong>Carregamento inicial</strong>: sucesso, erro e lista
              vazia.
            </li>
            <li>
              <strong>Seleção de usuário</strong>: posts corretos, erro e
              ausência de posts.
            </li>
            <li>
              <strong>Refresh</strong>: recarrega e limpa estados de erro.
            </li>
            <li>
              <strong>Estados assíncronos</strong>: loading isolado por
              operação.
            </li>
          </ul>
        </div>
      </div>

      {/* Overlay agora restrito apenas à área da lista de usuários (.users) */}
      {error && (
        <div data-testid="error" className="error">
          Error: {error}
        </div>
      )}

      <div className="users-container">
        <div className="users">
          {loading && (
            <div
              className="loading-overlay"
              role="status"
              aria-live="polite"
              aria-busy="true"
              data-testid="loading"
            >
              <div className="spinner" />
              <span className="visually-hidden">Carregando</span>
            </div>
          )}
          <div className="users-header">
            <h3>Lista de Usuários</h3>
            <p>Clique em um usuário para ver seus posts.</p>
          </div>
          {users.map((user) => (
            <div
              key={user.id}
              data-testid={`user-item-${user.id}`}
              className={`user-item ${
                selectedUser?.id === user.id ? "selected" : ""
              }`}
              onClick={() => handleUserSelect(user)}
            >
              <strong>{user.name}</strong>
              <div>Username: @{user.username}</div>
              <div>Email: {user.email}</div>
            </div>
          ))}
        </div>

        {selectedUser && (
          <div className="user-details">
            <div className="users-header">
              <h3>Posts de: {selectedUser.name}</h3>
            </div>
            <div data-testid="user-posts">
              {userPosts.length === 0 && !loading && (
                <div className="empty-state" data-testid="no-posts">
                  Nenhum post para este usuário.
                </div>
              )}
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  data-testid={`post-${post.id}`}
                  className="post-item"
                >
                  <h4>{post.title}</h4>
                  <p>{post.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        data-testid="refresh-button"
        onClick={loadUsers}
        disabled={loading}
      >
        Atualizar
      </button>
    </div>
  );
};
