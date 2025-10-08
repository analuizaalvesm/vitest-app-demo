import React, { useState } from "react";
import { Calculator } from "../../utils";

interface CalculatorComponentProps {
  testId?: string;
}

export const CalculatorComponent: React.FC<CalculatorComponentProps> = ({
  testId = "calculator",
}) => {
  const [num1, setNum1] = useState<string>("");
  const [num2, setNum2] = useState<string>("");
  const [operation, setOperation] = useState<string>("add");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const calculator = Calculator();

  const handleCalculate = () => {
    setError("");

    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) {
      setError("Por favor, insira números válidos.");
      return;
    }

    try {
      let calculationResult: number;

      switch (operation) {
        case "add":
          calculationResult = calculator.add(n1, n2);
          break;
        case "subtract":
          calculationResult = calculator.subtract(n1, n2);
          break;
        case "multiply":
          calculationResult = calculator.multiply(n1, n2);
          break;
        case "divide":
          calculationResult = calculator.divide(n1, n2);
          break;
        case "power":
          calculationResult = calculator.power(n1, n2);
          break;
        default:
          setError("Invalid operation");
          setResult("");
          return;
      }

      if (typeof calculationResult !== "undefined") {
        setResult(calculationResult.toString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResult("");
    }
  };

  const handleClear = () => {
    setNum1("");
    setNum2("");
    setResult("");
    setError("");
  };

  return (
    <div data-testid={testId} className="calculator">
      <h2 className="visually-hidden">Calculator</h2>

      <div className="input-group">
        <label htmlFor="num1">Primeiro número:</label>
        <input
          id="num1"
          data-testid="num1-input"
          type="text"
          value={num1}
          onChange={(e) => setNum1(e.target.value)}
          placeholder="Digite o primeiro número"
        />
      </div>

      <div className="input-group">
        <label htmlFor="operation">Operação:</label>
        <select
          id="operation"
          data-testid="operation-select"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
        >
          <option value="add">Soma (+)</option>
          <option value="subtract">Subtração (-)</option>
          <option value="multiply">Multiplicação (×)</option>
          <option value="divide">Divisão (÷)</option>
          <option value="power">Potência (^)</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="num2">Segundo Número:</label>
        <input
          id="num2"
          data-testid="num2-input"
          type="text"
          value={num2}
          onChange={(e) => setNum2(e.target.value)}
          placeholder="Digite o segundo número"
        />
      </div>

      <div className="button-group">
        <button
          data-testid="calculate-button"
          onClick={handleCalculate}
          className="calculate-btn"
        >
          Calcular
        </button>
        <button
          data-testid="clear-button"
          onClick={handleClear}
          className="clear-btn"
        >
          Limpar
        </button>
      </div>

      {result && (
        <div data-testid="result" className="result">
          Result: {result}
        </div>
      )}

      {error && (
        <div data-testid="error" className="error">
          Error: {error}
        </div>
      )}
    </div>
  );
};
