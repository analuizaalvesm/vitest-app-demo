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

  // CT04 – Deletar tarefa
  it("CT04: deve deletar uma tarefa existente", () => {
    render(
      <TodoList initialTodos={[{ id: 1, text: "Ler livro", completed: false }]} />
    );

    const deleteButton = screen.getByTestId("delete-todo-1");
    fireEvent.click(deleteButton);

    expect(screen.queryByText("Ler livro")).not.toBeInTheDocument();
    expect(
      screen.getByText("Você não possui nenhuma tarefa.")
    ).toBeInTheDocument();
  });

  // CT05 – Estatísticas / contador ao adicionar e alternar
  it("CT05: deve atualizar estatísticas ao adicionar tarefas e alternar conclusão", () => {
    render(<TodoList />);

    const input = screen.getByTestId("new-todo-input") as HTMLInputElement;
    const addButton = screen.getByTestId("add-todo-button");

    // Adiciona duas tarefas
    fireEvent.change(input, { target: { value: "Tarefa A" } });
    fireEvent.click(addButton);

    fireEvent.change(input, { target: { value: "Tarefa B" } });
    fireEvent.click(addButton);

    // Nenhuma concluída inicialmente
    expect(screen.getByTestId("todo-stats").textContent).toBe(
      "0 de 2 concluídos"
    );

    // Marca a primeira como concluída
    const checkbox1 = screen.getByTestId("todo-checkbox-1") as HTMLInputElement;
    fireEvent.click(checkbox1);
    expect(screen.getByTestId("todo-stats").textContent).toBe(
      "1 de 2 concluídos"
    );
  });

  // CT06 – Adicionar com a tecla Enter
  it("CT06: deve adicionar tarefa quando o usuário pressiona Enter no input", () => {
    render(<TodoList />);

    const input = screen.getByTestId("new-todo-input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Adicionar com Enter" } });
    // onKeyPress no componente escuta 'Enter'
    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(screen.getByText("Adicionar com Enter")).toBeInTheDocument();
  });

  // CT07 – Botão disabled e trim de espaços
  it("CT07: botão 'Adicionar' deve ficar desabilitado com input vazio/apenas espaços e habilitado com texto; após adicionar volta a desabilitar", () => {
    render(<TodoList />);

    const input = screen.getByTestId("new-todo-input") as HTMLInputElement;
    const addButton = screen.getByTestId("add-todo-button") as HTMLButtonElement;

    // Inicialmente desabilitado
    expect(addButton).toBeDisabled();

    // Apenas espaços → deve permanecer desabilitado (trim)
    fireEvent.change(input, { target: { value: "   " } });
    expect(addButton).toBeDisabled();

    // Texto válido → habilita
    fireEvent.change(input, { target: { value: "  Olá  " } });
    expect(addButton).not.toBeDisabled();

    // Clicar adiciona e limpa → volta a ficar desabilitado
    fireEvent.click(addButton);
    expect(screen.getByText("Olá")).toBeInTheDocument();
    expect(input.value).toBe("");
    expect(addButton).toBeDisabled();
  });
});