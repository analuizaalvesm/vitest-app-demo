import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TodoList } from "./TodoList";
import type { Todo } from "./TodoList";

/**
 * TESTES DE INTEGRAÇÃO - TODO LIST COMPONENT
 * Testamos integração entre estado do React, eventos de UI e lógica de negócio
 */
describe("TodoList - Testes de Integração", () => {
  describe("Renderização inicial", () => {
    it("deve renderizar lista vazia corretamente", () => {
      render(<TodoList />);

      expect(
        screen.getByText(/To-?do List|Lista de Tarefas/i)
      ).toBeInTheDocument();
      
      expect(
        screen.getByPlaceholderText(
          /Enter a new todo\.{3}|Adicione uma nova tarefa/i
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /Add Todo|Adicionar/i })
      ).toBeInTheDocument();
      
      expect(screen.getByTestId("todo-stats")).toHaveTextContent(
        /No todos yet|Você não possui nenhuma tarefa\./i
      );
    });

    it("deve renderizar com todos iniciais", () => {
      const initialTodos: Todo[] = [
        { id: 1, text: "Task 1", completed: false },
        { id: 2, text: "Task 2", completed: true },
      ];

      render(<TodoList initialTodos={initialTodos} />);

      expect(screen.getByTestId("todo-stats")).toHaveTextContent(
        /1 (of|de) 2 (completed|concluídos)/i
      );
      expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("todo-item-2")).toBeInTheDocument();
    });
  });

  describe("Adição de todos", () => {
    beforeEach(() => {
      render(<TodoList />);
    });

    // Teste positivo
    it("deve adicionar novo todo corretamente", async () => {
      const input = screen.getByTestId("new-todo-input");
      const addButton = screen.getByTestId("add-todo-button");

      fireEvent.change(input, { target: { value: "Nova tarefa" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
        expect(screen.getByTestId("todo-text-1")).toHaveTextContent(
          "Nova tarefa"
        );
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /0 (of|de) 1 (completed|concluídos)/i
        );
      });

      // Input deve estar limpo após adicionar
      expect(input).toHaveValue("");
    });

    // Teste com Enter key
    it("deve adicionar todo ao pressionar Enter", async () => {
      const input = screen.getByTestId("new-todo-input");

      fireEvent.change(input, { target: { value: "Tarefa via Enter" } });
      fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

      await waitFor(() => {
        expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
        expect(screen.getByTestId("todo-text-1")).toHaveTextContent(
          "Tarefa via Enter"
        );
      });
    });

    // Teste negativo - input vazio
    it("não deve adicionar todo com texto vazio", () => {
      const addButton = screen.getByTestId("add-todo-button");

      expect(addButton).toBeDisabled();

      fireEvent.click(addButton);

      expect(screen.queryByTestId("todo-item-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("todo-stats")).toHaveTextContent(
        /No todos yet|Você não possui nenhuma tarefa\./i
      );
    });

    // Teste com espaços em branco
    it("não deve adicionar todo apenas com espaços", () => {
      const input = screen.getByTestId("new-todo-input");
      const addButton = screen.getByTestId("add-todo-button");

      fireEvent.change(input, { target: { value: "   " } });

      expect(addButton).toBeDisabled();
    });

    // Teste de múltiplos todos
    it("deve adicionar múltiplos todos com IDs sequenciais", async () => {
      const input = screen.getByTestId("new-todo-input");
      const addButton = screen.getByTestId("add-todo-button");

      // Adicionar primeiro todo
      fireEvent.change(input, { target: { value: "Tarefa 1" } });
      fireEvent.click(addButton);

      // Adicionar segundo todo
      fireEvent.change(input, { target: { value: "Tarefa 2" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
        expect(screen.getByTestId("todo-item-2")).toBeInTheDocument();
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /0 (of|de) 2 (completed|concluídos)/i
        );
      });
    });
  });

  describe("Toggle de conclusão", () => {
    beforeEach(() => {
      const initialTodos: Todo[] = [
        { id: 1, text: "Task 1", completed: false },
        { id: 2, text: "Task 2", completed: true },
      ];
      render(<TodoList initialTodos={initialTodos} />);
    });

    it("deve marcar todo como completo", async () => {
      const checkbox = screen.getByTestId(
        "todo-checkbox-1"
      ) as HTMLInputElement;

      expect(checkbox.checked).toBe(false);
      expect(screen.getByTestId("todo-item-1")).not.toHaveClass("completed");

      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox.checked).toBe(true);
        expect(screen.getByTestId("todo-item-1")).toHaveClass("completed");
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /2 (of|de) 2 (completed|concluídos)/i
        );
      });
    });

    it("deve desmarcar todo completo", async () => {
      const checkbox = screen.getByTestId(
        "todo-checkbox-2"
      ) as HTMLInputElement;

      expect(checkbox.checked).toBe(true);
      expect(screen.getByTestId("todo-item-2")).toHaveClass("completed");

      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox.checked).toBe(false);
        expect(screen.getByTestId("todo-item-2")).not.toHaveClass("completed");
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /0 (of|de) 2 (completed|concluídos)/i
        );
      });
    });
  });

  describe("Remoção de todos", () => {
    beforeEach(() => {
      const initialTodos: Todo[] = [
        { id: 1, text: "Task 1", completed: false },
        { id: 2, text: "Task 2", completed: true },
        { id: 3, text: "Task 3", completed: false },
      ];
      render(<TodoList initialTodos={initialTodos} />);
    });

    it("deve remover todo específico", async () => {
      expect(screen.getByTestId("todo-item-2")).toBeInTheDocument();
      expect(screen.getByTestId("todo-stats")).toHaveTextContent(
        /1 (of|de) 3 (completed|concluídos)/i
      );

      const deleteButton = screen.getByTestId("delete-todo-2");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByTestId("todo-item-2")).not.toBeInTheDocument();
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /0 (of|de) 2 (completed|concluídos)/i
        );
      });

      // Outros todos devem permanecer
      expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("todo-item-3")).toBeInTheDocument();
    });

    it("deve mostrar estado vazio após remover todos os todos", async () => {
      // Remover todos os todos
      fireEvent.click(screen.getByTestId("delete-todo-1"));
      fireEvent.click(screen.getByTestId("delete-todo-2"));
      fireEvent.click(screen.getByTestId("delete-todo-3"));

      await waitFor(() => {
        expect(screen.queryByTestId("todo-item-1")).not.toBeInTheDocument();
        expect(screen.queryByTestId("todo-item-2")).not.toBeInTheDocument();
        expect(screen.queryByTestId("todo-item-3")).not.toBeInTheDocument();
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /No todos yet|Você não possui nenhuma tarefa\./i
        );
      });
    });
  });

  describe("Integração completa - Fluxo de trabalho", () => {
    it("deve suportar fluxo completo de gerenciamento de todos", async () => {
      render(<TodoList />);

      const input = screen.getByTestId("new-todo-input");
      const addButton = screen.getByTestId("add-todo-button");

      // 1. Adicionar primeiro todo
      fireEvent.change(input, { target: { value: "Comprar leite" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /0 (of|de) 1 (completed|concluídos)/i
        );
      });

      // 2. Adicionar segundo todo
      fireEvent.change(input, { target: { value: "Estudar React" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /0 (of|de) 2 (completed|concluídos)/i
        );
      });

      // 3. Marcar primeiro como completo
      fireEvent.click(screen.getByTestId("todo-checkbox-1"));

      await waitFor(() => {
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /1 (of|de) 2 (completed|concluídos)/i
        );
      });

      // 4. Adicionar terceiro todo
      fireEvent.change(input, { target: { value: "Fazer exercícios" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /1 (of|de) 3 (completed|concluídos)/i
        );
      });

      // 5. Remover segundo todo
      fireEvent.click(screen.getByTestId("delete-todo-2"));

      await waitFor(() => {
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /1 (of|de) 2 (completed|concluídos)/i
        );
        expect(screen.queryByTestId("todo-item-2")).not.toBeInTheDocument();
      });

      // 6. Marcar terceiro como completo
      fireEvent.click(screen.getByTestId("todo-checkbox-3"));

      await waitFor(() => {
        expect(screen.getByTestId("todo-stats")).toHaveTextContent(
          /2 (of|de) 2 (completed|concluídos)/i
        );
      });

      // Verificar estado final
      expect(screen.getByTestId("todo-item-1")).toHaveClass("completed");
      expect(screen.getByTestId("todo-item-3")).toHaveClass("completed");
    });
  });
});
