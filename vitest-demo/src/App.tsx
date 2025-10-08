import { useState } from "react";
import "./App.css";
import { CalculatorComponent } from "./components/Calculator/CalculatorComponent";
import { TodoList } from "./components/TodoList/TodoList";
import { UserList } from "./components/UserList/UserList";

function App() {
  const [activeTab, setActiveTab] = useState<"calculator" | "todos" | "users">(
    "calculator"
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>Vitest - Aplicação Demo</h1>
        <h3>Trabalho Prático I - Teste de Software</h3>

        <nav className="tab-navigation">
          <button
            data-testid="calculator-tab"
            className={activeTab === "calculator" ? "active" : ""}
            onClick={() => setActiveTab("calculator")}
          >
            Calculadora
          </button>
          <button
            data-testid="todos-tab"
            className={activeTab === "todos" ? "active" : ""}
            onClick={() => setActiveTab("todos")}
          >
            To-do List
          </button>
          <button
            data-testid="users-tab"
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Usuários (API)
          </button>
        </nav>
      </header>

      <div className="app-content">
        <main className="app-main">
          {activeTab === "calculator" && (
            <section className="tab-panel">
              <div className="panel-header">
                <h2>Calculadora</h2>
                <div className="panel-description">
                  Esta seção demonstra testes de unidade focados em:
                  <ul>
                    <li>
                      Lógica aritmética: add, subtract, multiply, divide, power.
                    </li>
                    <li>
                      Tratamento de erros (divisão por zero, entradas
                      inválidas).
                    </li>
                    <li>
                      Validação de fluxo: limpar estado e cálculo sequencial.
                    </li>
                  </ul>
                </div>
              </div>
              <CalculatorComponent />
            </section>
          )}
          {activeTab === "todos" && (
            <section className="tab-panel">
              <div className="panel-header">
                <h2>Todo List</h2>
                <div className="panel-description">
                  Aqui exploramos testes de componente/integration:
                  <ul>
                    <li>Criação, toggle e remoção de itens.</li>
                    <li>Estados derivados (contagem concluídos vs total).</li>
                    <li>Empty state e acessibilidade via data-testid.</li>
                  </ul>
                </div>
              </div>
              <TodoList />
            </section>
          )}
          {activeTab === "users" && (
            <section className="tab-panel">
              <UserList />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
