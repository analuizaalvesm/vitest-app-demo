import React, { useState } from "react";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  testId?: string;
  initialTodos?: Todo[];
}

export const TodoList: React.FC<TodoListProps> = ({
  testId = "todo-list",
  initialTodos = [],
}) => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodoText, setNewTodoText] = useState<string>("");
  const [nextId, setNextId] = useState<number>(initialTodos.length + 1);

  const addTodo = () => {
    if (newTodoText.trim() === "") {
      return;
    }

    const newTodo: Todo = {
      id: nextId,
      text: newTodoText.trim(),
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setNewTodoText("");
    setNextId(nextId + 1);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div data-testid={testId} className="todo-list">
      <h2 className="visually-hidden">To-do List</h2>

      <div className="add-todo">
        <input
          data-testid="new-todo-input"
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Adicione uma nova tarefa"
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
        />
        <button
          data-testid="add-todo-button"
          onClick={addTodo}
          disabled={newTodoText.trim() === ""}
        >
          Adicionar
        </button>
      </div>

      <div data-testid="todo-stats" className="todo-stats">
        {totalCount > 0
          ? `${completedCount} de ${totalCount} concluídos`
          : "Você não possui nenhuma tarefa."}
      </div>

      <div className="todos">
        {todos.map((todo) => (
          <div
            key={todo.id}
            data-testid={`todo-item-${todo.id}`}
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            <input
              type="checkbox"
              data-testid={`todo-checkbox-${todo.id}`}
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span data-testid={`todo-text-${todo.id}`} className="todo-text">
              {todo.text}
            </span>
            <button
              data-testid={`delete-todo-${todo.id}`}
              onClick={() => deleteTodo(todo.id)}
              className="delete-button"
            >
              Deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
