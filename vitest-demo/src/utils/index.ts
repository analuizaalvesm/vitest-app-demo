// Função para demonstrar testes caixa-preta
export function Calculator() {
  return {
    add: (a: number, b: number): number => a + b,
    subtract: (a: number, b: number): number => a - b,
    multiply: (a: number, b: number): number => a * b,
    divide: (a: number, b: number): number => {
      if (b === 0) {
        throw new Error("Division by zero is not allowed");
      }
      return a / b;
    },
    power: (base: number, exponent: number): number => {
      if (exponent < 0) {
        throw new Error("Negative exponents not supported");
      }
      return Math.pow(base, exponent);
    },
  };
}

// Função para demonstrar testes caixa-branca (conhecemos a implementação interna)
export class StringValidator {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 50;

  static validateEmail(email: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificação de comprimento
    if (email.length < this.MIN_LENGTH) {
      errors.push("Email too short");
    }

    if (email.length > this.MAX_LENGTH) {
      errors.push("Email too long");
    }

    // Verificação de formato básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Invalid email format");
    }

    // Verificação de domínios proibidos (lógica interna que conhecemos)
    const forbiddenDomains = ["spam.com", "fake.org"];
    const domain = email.split("@")[1];
    if (domain && forbiddenDomains.includes(domain.toLowerCase())) {
      errors.push("Domain not allowed");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Função para demonstrar testes caixa-cinza (combinação)
export class UserManager {
  private users: Array<{
    id: number;
    name: string;
    email: string;
    active: boolean;
  }> = [];
  private nextId = 1;

  createUser(name: string, email: string): number {
    // Validação usando StringValidator (parte conhecida)
    const validation = StringValidator.validateEmail(email);
    if (!validation.isValid) {
      throw new Error(`Invalid email: ${validation.errors.join(", ")}`);
    }

    // Lógica interna de criação (parte que podemos testar como caixa-preta)
    const user = {
      id: this.nextId++,
      name: name.trim(),
      email: email.toLowerCase(),
      active: true,
    };

    this.users.push(user);
    return user.id;
  }

  getUser(id: number) {
    return this.users.find((user) => user.id === id);
  }

  getAllUsers() {
    return [...this.users];
  }

  deactivateUser(id: number): boolean {
    const user = this.users.find((user) => user.id === id);
    if (user) {
      user.active = false;
      return true;
    }
    return false;
  }
}
