import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TodoList, type Todo } from "./TodoList";

/**
 * TESTES BASEADOS EM GRAFO DE FLUXO DE CONTROLE - TODO LIST
 *
 * Funções analisadas:
 * - addTodo():
 *    1) Entrada → validação `newTodoText.trim()===""` → [True: return] | [False: cria todo]
 *    2) Criação (id=nextId, text=trim, completed=false)
 *    3) setTodos([...todos, newTodo]) → limpa input → incrementa nextId
 *    CC aprox.: 2 (if) + fluxo linear pós-else
 *
 * - toggleTodo(id):
 *    1) map → (todo.id===id) ? toggle completed : mantém
 *    CC aprox.: 2 (ramo encontrado vs não encontrado)
 *
 * - deleteTodo(id):
 *    1) filter → remove item com id
 *    CC aprox.: 1 (linear)
 *
 * - Renderização/estados:
 *    - botão "Adicionar" desabilitado quando input vazio (branch UI)
 *    - `onKeyPress(Enter)` também chama addTodo (branch de evento)
 *    - estatísticas/empty-state alternam por contagem (branch UI)
 */

const setup = (initialTodos: Todo[] = []) => {
  render(<TodoList initialTodos={initialTodos} />);
  const getInput = () => screen.getByTestId("new-todo-input") as HTMLInputElement;
  const clickAdd = () => fireEvent.click(screen.getByTestId("add-todo-button"));
  const stats = () => screen.getByTestId("todo-stats");
  const item = (id: number) => screen.getByTestId(`todo-item-${id}`);
  const checkbox = (id: number) => screen.getByTestId(`todo-checkbox-${id}`) as HTMLInputElement;
  const deleteBtn = (id: number) => screen.getByTestId(`delete-todo-${id}`);
  const text = (id: number) => screen.getByTestId(`todo-text-${id}`);
  return { getInput, clickAdd, stats, item, checkbox, deleteBtn, text };
};

describe("TodoList - Testes de Fluxo de Controle", () => {
  beforeEach(() => {
    // sem-op: cada teste renderiza seu próprio componente
  });

  /**
   * Caminho addTodo() - branch de validação (texto vazio)
   */
  describe("Caminho addTodo: validação de entrada", () => {
    it("não deve adicionar quando input estiver vazio (branch TRUE do if)", () => {
      const { getInput, clickAdd, stats } = setup();
      expect(getInput().value).toBe("");
      // Botão desabilitado quando vazio
      expect(screen.getByTestId("add-todo-button")).toBeDisabled();

      clickAdd();

      // Sem itens → empty-state
      expect(stats()).toHaveTextContent("Você não possui nenhuma tarefa.");
      expect(screen.queryByTestId(/todo-item-/)).not.toBeInTheDocument();
    });

    it("não deve adicionar quando input for whitespace", () => {
      const { getInput, clickAdd, stats } = setup();
      fireEvent.change(getInput(), { target: { value: "    " } });
      expect(screen.getByTestId("add-todo-button")).toBeDisabled();

      clickAdd();

      expect(stats()).toHaveTextContent("Você não possui nenhuma tarefa.");
    });
  });

  /**
   * Caminho addTodo() - branch de criação (texto válido)
   */
  describe("Caminho addTodo: criação de item", () => {
    it("deve adicionar um todo, limpar input e atualizar estatísticas", () => {
      const { getInput, clickAdd, stats, item, text, checkbox } = setup();

      fireEvent.change(getInput(), { target: { value: "Estudar Vitest" } });
      expect(screen.getByTestId("add-todo-button")).toBeEnabled();

      clickAdd();

      const todo = item(1);
      expect(todo).toBeInTheDocument();
      expect(text(1)).toHaveTextContent("Estudar Vitest");
      expect(checkbox(1).checked).toBe(false);
      expect(getInput().value).toBe(""); // input limpo
      expect(stats()).toHaveTextContent("0 de 1 concluídos");
    });

    it("deve adicionar via tecla Enter (evento alternativo)", () => {
      const { getInput, item } = setup();
      fireEvent.change(getInput(), { target: { value: "Tarefa via Enter" } });

      // onKeyPress (Enter) chama addTodo
      fireEvent.keyPress(getInput(), { key: "Enter", charCode: 13 });

      expect(item(1)).toBeInTheDocument();
    });

    it("deve incrementar id (nextId) a cada adição", () => {
      const { getInput, clickAdd, item } = setup();

      fireEvent.change(getInput(), { target: { value: "A" } });
      clickAdd();
      expect(item(1)).toBeInTheDocument();

      fireEvent.change(getInput(), { target: { value: "B" } });
      clickAdd();
      expect(item(2)).toBeInTheDocument();

      fireEvent.change(getInput(), { target: { value: "C" } });
      clickAdd();
      expect(item(3)).toBeInTheDocument();
    });
  });

  /**
   * Caminho toggleTodo(id) - dois ramos (id encontrado → toggla; demais → mantém)
   */
  describe("Caminho toggleTodo: alternância de completed", () => {
    it("deve alternar completed de false→true e atualizar estatísticas", () => {
      const initial: Todo[] = [{ id: 1, text: "X", completed: false }];
      const { checkbox, stats, item } = setup(initial);

      expect(checkbox(1).checked).toBe(false);
      fireEvent.click(checkbox(1));
      expect(checkbox(1).checked).toBe(true);

      // classe CSS "completed" aplicada
      expect(item(1)).toHaveClass("completed");

      // stats 1 de 1 concluídos
      expect(stats()).toHaveTextContent("1 de 1 concluídos");
    });

    it("não deve afetar outros itens (ramo else do map)", () => {
      const initial: Todo[] = [
        { id: 1, text: "A", completed: false },
        { id: 2, text: "B", completed: false },
      ];
      const { checkbox } = setup(initial);

      fireEvent.click(checkbox(1));
      expect(checkbox(1).checked).toBe(true);
      expect(checkbox(2).checked).toBe(false);
    });
  });

  /**
   * Caminho deleteTodo(id) - remoção e empty-state
   */
  describe("Caminho deleteTodo: remoção e empty-state", () => {
    it("deve remover o item selecionado e manter os demais", () => {
      const initial: Todo[] = [
        { id: 1, text: "A", completed: false },
        { id: 2, text: "B", completed: true },
      ];
      const { deleteBtn } = setup(initial);

      fireEvent.click(deleteBtn(1));
      expect(screen.queryByTestId("todo-item-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("todo-item-2")).toBeInTheDocument();
    });

    it("deve exibir empty-state quando remover o último item", () => {
      const initial: Todo[] = [{ id: 1, text: "Único", completed: false }];
      const { deleteBtn, stats } = setup(initial);

      fireEvent.click(deleteBtn(1));
      expect(screen.queryByTestId("todo-item-1")).not.toBeInTheDocument();
      expect(stats()).toHaveTextContent("Você não possui nenhuma tarefa.");
    });
  });

  /**
   * Verificação de caminhos cobertos
   */
  describe("Cobertura de Caminhos (resumo)", () => {
    it("cobre branches principais de add / toggle / delete / UI", () => {
      // Este teste existe como marcador documental semelhante ao da calculadora.
      // A validação real está distribuída nos casos acima.
      expect(true).toBe(true);
    });
  });
});
