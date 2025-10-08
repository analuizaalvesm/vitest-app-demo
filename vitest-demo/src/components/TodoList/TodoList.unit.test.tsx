// 📁 todolist-unittest.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TodoList } from "./TodoList";

// ---------------------------
// 🧪 CT01 – Campo vazio (não adiciona tarefa)
// ---------------------------
describe("CT01 – Campo vazio (não adiciona tarefa)", () => {
  it("não deve adicionar tarefa se o campo estiver vazio", () => {
    render(<TodoList />);

    const addButton = screen.getByTestId("add-todo-button");
    fireEvent.click(addButton);

    expect(
      screen.getByText("Você não possui nenhuma tarefa.")
    ).toBeInTheDocument();
  });
});

// ---------------------------
// 🧪 CT02 – Campo válido (adiciona tarefa e limpa campo)
// ---------------------------
describe("CT02 – Campo válido (adiciona tarefa e limpa campo)", () => {
  it("deve adicionar uma nova tarefa e limpar o campo", () => {
    render(<TodoList />);

    const input = screen.getByTestId("new-todo-input");
    const addButton = screen.getByTestId("add-todo-button");

    fireEvent.change(input, { target: { value: "Estudar React" } });
    fireEvent.click(addButton);

    expect(screen.getByText("Estudar React")).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe("");
  });
});

// ---------------------------
// 🧪 CT03 – Alternar status da tarefa
// ---------------------------
describe("CT03 – Alternar status da tarefa", () => {
  it("deve alternar o status da tarefa entre concluída e não concluída", () => {
    const initialTodos = [{ id: 1, text: "Ler livro", completed: false }];
    render(<TodoList initialTodos={initialTodos} />);

    const checkbox = screen.getByTestId("todo-checkbox-1") as HTMLInputElement;

    // Marca como concluído
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Desmarca
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });
});