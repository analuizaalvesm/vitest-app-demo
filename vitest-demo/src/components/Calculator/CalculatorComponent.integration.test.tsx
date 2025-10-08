import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CalculatorComponent } from "./CalculatorComponent";

/**
 * TESTES DE INTEGRAÇÃO - CALCULATOR COMPONENT
 * Testamos a integração entre o componente React e a lógica de negócio
 */
describe("CalculatorComponent - Testes de Integração", () => {
  beforeEach(() => {
    render(<CalculatorComponent />);
  });

  describe("Renderização inicial", () => {
    it("deve renderizar todos os elementos da interface", () => {
      expect(screen.getByText(/Calculator|Calculadora/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/First Number:|Primeiro número:/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Second Number:|Segundo Número:/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Operation:|Operação:/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Calculate|Calcular/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Clear|Limpar/i })
      ).toBeInTheDocument();
    });

    it("deve ter valores iniciais corretos", () => {
      const num1Input = screen.getByTestId("num1-input") as HTMLInputElement;
      const num2Input = screen.getByTestId("num2-input") as HTMLInputElement;
      const operationSelect = screen.getByTestId(
        "operation-select"
      ) as HTMLSelectElement;

      expect(num1Input.value).toBe("");
      expect(num2Input.value).toBe("");
      expect(operationSelect.value).toBe("add");
    });
  });

  describe("Integração entre UI e lógica de cálculo", () => {
    // Teste positivo - operação de adição
    it("deve realizar adição corretamente", async () => {
      const num1Input = screen.getByTestId("num1-input");
      const num2Input = screen.getByTestId("num2-input");
      const calculateButton = screen.getByTestId("calculate-button");

      fireEvent.change(num1Input, { target: { value: "5" } });
      fireEvent.change(num2Input, { target: { value: "3" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("Result: 8");
      });
    });

    // Teste com diferentes operações
    it("deve realizar todas as operações matemáticas", async () => {
      const num1Input = screen.getByTestId("num1-input");
      const num2Input = screen.getByTestId("num2-input");
      const operationSelect = screen.getByTestId("operation-select");
      const calculateButton = screen.getByTestId("calculate-button");

      // Teste subtração
      fireEvent.change(num1Input, { target: { value: "10" } });
      fireEvent.change(num2Input, { target: { value: "4" } });
      fireEvent.change(operationSelect, { target: { value: "subtract" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("Result: 6");
      });

      // Teste multiplicação
      fireEvent.change(operationSelect, { target: { value: "multiply" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("Result: 40");
      });

      // Teste divisão
      fireEvent.change(operationSelect, { target: { value: "divide" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("Result: 2.5");
      });

      // Teste potenciação
      fireEvent.change(num2Input, { target: { value: "3" } });
      fireEvent.change(operationSelect, { target: { value: "power" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("Result: 1000");
      });
    });

    // Teste negativo - entrada inválida
    it("deve mostrar erro para entradas inválidas", async () => {
      const num1Input = screen.getByTestId("num1-input");
      const num2Input = screen.getByTestId("num2-input");
      const calculateButton = screen.getByTestId("calculate-button");

      fireEvent.change(num1Input, { target: { value: "abc" } });
      fireEvent.change(num2Input, { target: { value: "5" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Por favor, insira números válidos."
        );
      });
    });

    // Teste de exceção - divisão por zero
    it("deve mostrar erro para divisão por zero", async () => {
      const num1Input = screen.getByTestId("num1-input");
      const num2Input = screen.getByTestId("num2-input");
      const operationSelect = screen.getByTestId("operation-select");
      const calculateButton = screen.getByTestId("calculate-button");

      fireEvent.change(num1Input, { target: { value: "10" } });
      fireEvent.change(num2Input, { target: { value: "0" } });
      fireEvent.change(operationSelect, { target: { value: "divide" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Division by zero is not allowed"
        );
      });
    });

    // Teste de exceção - expoente negativo
    it("deve mostrar erro para expoentes negativos", async () => {
      const num1Input = screen.getByTestId("num1-input");
      const num2Input = screen.getByTestId("num2-input");
      const operationSelect = screen.getByTestId("operation-select");
      const calculateButton = screen.getByTestId("calculate-button");

      fireEvent.change(num1Input, { target: { value: "2" } });
      fireEvent.change(num2Input, { target: { value: "-3" } });
      fireEvent.change(operationSelect, { target: { value: "power" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Error: Negative exponents not supported"
        );
      });
    });
  });

  describe("Funcionalidade de limpeza", () => {
    it("deve limpar todos os campos ao clicar em Clear", async () => {
      const num1Input = screen.getByTestId("num1-input") as HTMLInputElement;
      const num2Input = screen.getByTestId("num2-input") as HTMLInputElement;
      const calculateButton = screen.getByTestId("calculate-button");
      const clearButton = screen.getByTestId("clear-button");

      // Preencher campos e calcular
      fireEvent.change(num1Input, { target: { value: "5" } });
      fireEvent.change(num2Input, { target: { value: "3" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("result")).toBeInTheDocument();
      });

      // Limpar
      fireEvent.click(clearButton);

      // Verificar que tudo foi limpo
      expect(num1Input.value).toBe("");
      expect(num2Input.value).toBe("");
      expect(screen.queryByTestId("result")).not.toBeInTheDocument();
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    });
  });

  describe("Estados de erro e resultado", () => {
    it("deve limpar erro anterior ao calcular com sucesso", async () => {
      const num1Input = screen.getByTestId("num1-input");
      const num2Input = screen.getByTestId("num2-input");
      const calculateButton = screen.getByTestId("calculate-button");

      // Primeiro, gerar um erro
      fireEvent.change(num1Input, { target: { value: "abc" } });
      fireEvent.change(num2Input, { target: { value: "5" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toBeInTheDocument();
      });

      // Depois, calcular corretamente
      fireEvent.change(num1Input, { target: { value: "5" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("result")).toBeInTheDocument();
        expect(screen.queryByTestId("error")).not.toBeInTheDocument();
      });
    });

    it("deve mostrar apenas um resultado por vez", async () => {
      const num1Input = screen.getByTestId("num1-input");
      const num2Input = screen.getByTestId("num2-input");
      const calculateButton = screen.getByTestId("calculate-button");

      // Primeiro cálculo
      fireEvent.change(num1Input, { target: { value: "5" } });
      fireEvent.change(num2Input, { target: { value: "3" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("Result: 8");
      });

      // Segundo cálculo
      fireEvent.change(num1Input, { target: { value: "10" } });
      fireEvent.change(num2Input, { target: { value: "2" } });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("Result: 12");
      });

      // Deve haver apenas um elemento de resultado
      const results = screen.getAllByTestId("result");
      expect(results).toHaveLength(1);
    });
  });
});
