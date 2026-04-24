"use client";

import { FormEvent, useMemo, useState } from "react";

type Screen = "login" | "signup" | "accounts" | "statement" | "deposit" | "withdraw" | "transfer";
type Period = "15" | "30" | "60" | "all";
type TransactionKind = "Compra" | "Receita" | "Deposito" | "Saque" | "Transferencia";

type Account = {
  id: string;
  description: string;
  balance: number;
};

type Transaction = {
  id: number;
  kind: TransactionKind;
  description: string;
  date: string;
  amount: number;
};

type Contact = {
  account: string;
  name: string;
  initials: string;
};

const initialTransactions: Transaction[] = [
  { id: 1, kind: "Compra", description: "Compra 5", date: "2026-04-19", amount: -500 },
  { id: 2, kind: "Compra", description: "Compra 5", date: "2026-04-19", amount: -500 },
  { id: 3, kind: "Compra", description: "Compra 4", date: "2026-04-18", amount: -500 },
  { id: 4, kind: "Receita", description: "Receita 1", date: "2026-04-18", amount: 5000 },
  { id: 5, kind: "Compra", description: "Compra 3", date: "2026-04-17", amount: -500 },
  { id: 6, kind: "Compra", description: "Compra 2", date: "2026-04-12", amount: -500 },
  { id: 7, kind: "Compra", description: "Compra 1", date: "2026-04-10", amount: -500 },
];

const contacts: Contact[] = [
  { account: "CC-2", name: "Eduardo Jose", initials: "EJ" },
  { account: "CC-3", name: "Gremis Tovar", initials: "GT" },
  { account: "CP-2", name: "Fernanda Sousa", initials: "FS" },
  { account: "CC-1", name: "Jose da Silva", initials: "JS" },
  { account: "CP-1", name: "Marina Sousa", initials: "MS" },
];

const initialAccounts: Account[] = [
  { id: "CC-2", description: "Conta Corrente", balance: 50 },
  { id: "CP-2", description: "Conta Poupanca", balance: 900 },
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

export default function Home() {
  const [screen, setScreen] = useState<Screen>("login");
  const [userName, setUserName] = useState("Gremis Tovar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showBalance, setShowBalance] = useState(true);
  const [period, setPeriod] = useState<Period>("all");
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState("");

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );

  const balance = selectedAccount?.balance ?? 0;

  const filteredTransactions = useMemo(() => {
    if (period === "all") {
      return transactions;
    }

    const maxAge = Number(period);
    const referenceDate = new Date("2026-04-24T12:00:00");

    return transactions.filter((transaction) => {
      const date = new Date(`${transaction.date}T12:00:00`);
      const ageInDays = Math.floor(
        (referenceDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );
      return ageInDays <= maxAge;
    });
  }, [period, transactions]);

  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return contacts;
    }

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(term) ||
        contact.account.toLowerCase().includes(term),
    );
  }, [search]);

  function handleAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setMessage("Informe e-mail e senha para continuar.");
      return;
    }

    setMessage("");
    setScreen("accounts");
  }

  function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userName.trim() || !email || !password) {
      setMessage("Preencha nome, e-mail e senha.");
      return;
    }

    setUserName(userName.trim());
    setMessage("");
    setScreen("accounts");
  }

  function handleLogout() {
    setPassword("");
    setAmount("");
    setSearch("");
    setSelectedContact(null);
    setSelectedAccountId(null);
    setMessage("");
    setScreen("login");
  }

  function handleAccountSelect(account: Account) {
    setSelectedAccountId(account.id);
    setMessage("");
    setScreen("statement");
  }

  function handleMoneyOperation(event: FormEvent<HTMLFormElement>, mode: "deposit" | "withdraw") {
    event.preventDefault();
    const value = parseAmount(amount);

    if (!value) {
      setMessage("Digite um valor valido.");
      return;
    }

    if (mode === "withdraw" && value > balance) {
      setMessage("Saldo insuficiente para saque.");
      return;
    }

    addTransaction({
      kind: mode === "deposit" ? "Deposito" : "Saque",
      description: mode === "deposit" ? "Deposito em conta" : "Saque em conta",
      amount: mode === "deposit" ? value : -value,
    });
  }

  function handleTransferValue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = parseAmount(amount);

    if (!value) {
      setMessage("Digite um valor valido.");
      return;
    }

    if (value > balance) {
      setMessage("Saldo insuficiente para transferencia.");
      return;
    }

    setMessage("");
    setScreen("transfer");
  }

  function completeTransfer(contact: Contact) {
    const value = parseAmount(amount);

    if (!value) {
      setMessage("Digite um valor valido.");
      setScreen("transfer");
      return;
    }

    setSelectedContact(contact);
    addTransaction({
      kind: "Transferencia",
      description: `Transferencia para ${contact.name}`,
      amount: -value,
    });
  }

  function addTransaction(transaction: Omit<Transaction, "id" | "date">) {
    setTransactions((current) => [
      {
        ...transaction,
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
    if (selectedAccountId) {
      setAccounts((current) =>
        current.map((account) =>
          account.id === selectedAccountId
            ? { ...account, balance: account.balance + transaction.amount }
            : account,
        ),
      );
    }
    setAmount("");
    setMessage("Operação realizada com sucesso.");
    setScreen("statement");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl rounded-lg bg-white shadow-sm">
        <div className="flex min-h-[calc(100vh-3rem)] w-full flex-col px-5 py-6 sm:px-8 lg:px-10">
          {screen === "login" && (
            <AuthShell
              mode="login"
              email={email}
              name={userName}
              password={password}
              message={message}
              onEmailChange={setEmail}
              onNameChange={setUserName}
              onPasswordChange={setPassword}
              onSubmit={handleAccess}
              onSecondary={() => {
                setMessage("");
                setScreen("signup");
              }}
            />
          )}
          {screen === "signup" && (
            <AuthShell
              mode="signup"
              email={email}
              name={userName}
              password={password}
              message={message}
              onEmailChange={setEmail}
              onNameChange={setUserName}
              onPasswordChange={setPassword}
              onSubmit={handleSignup}
              onSecondary={() => {
                setMessage("");
                setScreen("login");
              }}
            />
          )}
          {screen === "accounts" && (
            <AccountSelectionScreen
              accounts={accounts}
              userName={userName}
              onAccountSelect={handleAccountSelect}
              onLogout={handleLogout}
            />
          )}
          {screen === "statement" && (
            <StatementScreen
              account={selectedAccount}
              balance={balance}
              period={period}
              transactions={filteredTransactions}
              userName={userName}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance((current) => !current)}
              onPeriodChange={setPeriod}
              onNavigate={setScreen}
              onLogout={handleLogout}
              message={message}
            />
          )}
          {screen === "deposit" && (
            <MoneyScreen
              amount={amount}
              message={message}
              title="Digite o valor abaixo para depositar"
              buttonLabel="Depositar valor"
              userName={userName}
              onAmountChange={setAmount}
              onCancel={() => setScreen("statement")}
              onSubmit={(event) => handleMoneyOperation(event, "deposit")}
              onNavigate={setScreen}
              onLogout={handleLogout}
            />
          )}
          {screen === "withdraw" && (
            <MoneyScreen
              amount={amount}
              message={message}
              title="Digite o valor abaixo para sacar"
              buttonLabel="Sacar valor"
              userName={userName}
              onAmountChange={setAmount}
              onCancel={() => setScreen("statement")}
              onSubmit={(event) => handleMoneyOperation(event, "withdraw")}
              onNavigate={setScreen}
              onLogout={handleLogout}
            />
          )}
          {screen === "transfer" && (
            <TransferScreen
              amount={amount}
              contacts={filteredContacts}
              message={message}
              search={search}
              selectedContact={selectedContact}
              userName={userName}
              onAmountChange={setAmount}
              onCancel={() => setScreen("statement")}
              onContactSelect={completeTransfer}
              onSearchChange={setSearch}
              onSubmit={handleTransferValue}
              onNavigate={setScreen}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function AuthShell({
  mode,
  email,
  name,
  password,
  message,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onSecondary,
  onSubmit,
}: {
  mode: "login" | "signup";
  email: string;
  name: string;
  password: string;
  message: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSecondary: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const isSignup = mode === "signup";

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <h1 className="mt-8 text-center text-3xl font-bold sm:mt-12">Impacta Bank</h1>
      <form className="mt-16 flex flex-col gap-5 sm:mt-20" onSubmit={onSubmit}>
        <div className="text-center">
          <h2 className="text-xl font-bold">{isSignup ? "Sign up" : "Login"}</h2>
          <p className="mt-2 text-sm font-semibold text-neutral-500">
            {isSignup
              ? "Preencha seus dados e escolha sua senha"
              : "Digite seu e-mail para fazer login"}
          </p>
        </div>
        {isSignup && (
          <>
            <label className="sr-only" htmlFor="name">
              Nome completo
            </label>
            <input
              id="name"
              className="h-12 rounded-md border border-neutral-200 px-4 text-sm font-semibold outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              placeholder="Gremis Tovar"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
            />
          </>
        )}
        <label className="sr-only" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          className="h-12 rounded-md border border-neutral-200 px-4 text-sm font-semibold outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          inputMode="email"
          placeholder="email@domain.com"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
        <label className="sr-only" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          className="h-12 rounded-md border border-neutral-200 px-4 text-sm font-semibold outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          placeholder="senha"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
        {message && <p className="text-center text-sm font-semibold text-red-600">{message}</p>}
        <button className="h-12 rounded-md bg-black text-sm font-bold text-white" type="submit">
          {isSignup ? "Criar minha conta" : "Entrar"}
        </button>
        {!isSignup && (
          <button
            className="h-12 rounded-md bg-indigo-700 text-sm font-bold text-white"
            type="button"
            onClick={onSecondary}
          >
            Criar minha conta
          </button>
        )}
      </form>
      <FooterText>{isSignup ? "Termos de Servico" : "Politica de Privacidade"}</FooterText>
      {isSignup && (
        <button className="mb-3 text-sm font-semibold text-neutral-500" onClick={onSecondary}>
          Ja tenho conta
        </button>
      )}
    </section>
  );
}

function AccountSelectionScreen({
  accounts,
  userName,
  onAccountSelect,
  onLogout,
}: {
  accounts: Account[];
  userName: string;
  onAccountSelect: (account: Account) => void;
  onLogout: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col">
      <Header userName={userName} onLogout={onLogout} />
      <div className="mx-auto mt-16 w-full max-w-3xl sm:mt-24">
        <h2 className="text-2xl font-bold sm:text-3xl">Selecione sua conta para iniciar</h2>
        <div className="mt-8 grid grid-cols-[84px_minmax(130px,1fr)_112px] border-b border-neutral-100 pb-3 text-sm font-bold text-neutral-400 sm:grid-cols-[140px_minmax(220px,1fr)_160px]">
          <span>Conta</span>
          <span>Descricao</span>
          <span className="text-right">Saldo</span>
        </div>
        <div>
          {accounts.map((account) => (
            <button
              className="grid w-full grid-cols-[84px_minmax(130px,1fr)_112px] border-b border-neutral-100 py-4 text-left text-sm font-bold transition hover:bg-neutral-50 sm:grid-cols-[140px_minmax(220px,1fr)_160px] sm:text-base"
              key={account.id}
              onClick={() => onAccountSelect(account)}
              type="button"
            >
              <span className="text-neutral-500">{account.id}</span>
              <span>{account.description}</span>
              <span className="text-right">{currencyFormatter.format(account.balance)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatementScreen({
  account,
  balance,
  message,
  period,
  showBalance,
  transactions,
  userName,
  onNavigate,
  onLogout,
  onPeriodChange,
  onToggleBalance,
}: {
  account: Account | null;
  balance: number;
  message: string;
  period: Period;
  showBalance: boolean;
  transactions: Transaction[];
  userName: string;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onPeriodChange: (period: Period) => void;
  onToggleBalance: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col">
      <Header userName={userName} onLogout={onLogout} />
      <div className="mt-10 flex flex-col gap-4 rounded-md bg-neutral-50 p-5 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xl font-bold">Saldo disponivel</p>
          <p className="mt-2 h-8 text-2xl font-bold text-indigo-700">
            {showBalance ? currencyFormatter.format(balance) : "••••••"}
          </p>
        </div>
        <button
          aria-label={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl font-bold"
          onClick={onToggleBalance}
        >
          {showBalance ? "◉" : "◎"}
        </button>
      </div>
      <div className="mt-7 rounded-md border border-neutral-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <p className="font-bold">{account?.id ?? "Conta"}</p>
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
            <span>Filtro</span>
            <select
              className="rounded-md border border-neutral-200 px-2 py-1 text-sm outline-none"
              value={period}
              onChange={(event) => onPeriodChange(event.target.value as Period)}
            >
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
              <option value="all">Todas</option>
            </select>
          </label>
        </div>
        <div className="mt-5 grid grid-cols-[minmax(120px,1fr)_72px_96px] border-b border-neutral-100 pb-3 text-sm font-bold text-neutral-400 sm:grid-cols-[minmax(220px,1fr)_120px_140px]">
          <span>Transacao</span>
          <span>Data</span>
          <span className="text-right">Valor</span>
        </div>
        <div className="min-h-[300px]">
          {transactions.map((transaction) => (
            <div
              className="grid grid-cols-[minmax(120px,1fr)_72px_96px] border-b border-neutral-100 py-3 text-sm font-bold sm:grid-cols-[minmax(220px,1fr)_120px_140px]"
              key={transaction.id}
            >
              <span>{transaction.description}</span>
              <span>{dateFormatter.format(new Date(`${transaction.date}T12:00:00`))}</span>
              <span
                className={`text-right ${
                  transaction.amount > 0 ? "text-emerald-700" : "text-neutral-900"
                }`}
              >
                {currencyFormatter.format(Math.abs(transaction.amount))}
              </span>
            </div>
          ))}
        </div>
      </div>
      {message && <p className="mt-4 text-center text-sm font-semibold text-emerald-700">{message}</p>}
      <BottomNav active="statement" onNavigate={onNavigate} />
    </section>
  );
}

function MoneyScreen({
  amount,
  buttonLabel,
  message,
  title,
  userName,
  onAmountChange,
  onCancel,
  onLogout,
  onNavigate,
  onSubmit,
}: {
  amount: string;
  buttonLabel: string;
  message: string;
  title: string;
  userName: string;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="flex flex-1 flex-col">
      <Header userName={userName} onLogout={onLogout} />
      <form className="mx-auto mt-16 flex w-full max-w-xl flex-col gap-6 sm:mt-24" onSubmit={onSubmit}>
        <h2 className="text-center text-lg font-bold">{title}</h2>
        <input
          className="h-12 rounded-md border border-neutral-200 px-4 text-sm font-semibold outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          inputMode="decimal"
          placeholder="digite o valor em R$"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
        />
        {message && <p className="text-center text-sm font-semibold text-red-600">{message}</p>}
        <button className="h-12 rounded-md bg-black text-sm font-bold text-white" type="submit">
          {buttonLabel}
        </button>
        <button
          className="h-12 rounded-md bg-red-600 text-sm font-bold text-white"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </form>
      <BottomNav active={buttonLabel.startsWith("Depositar") ? "deposit" : "withdraw"} onNavigate={onNavigate} />
    </section>
  );
}

function TransferScreen({
  amount,
  contacts,
  message,
  search,
  selectedContact,
  userName,
  onAmountChange,
  onCancel,
  onContactSelect,
  onLogout,
  onNavigate,
  onSearchChange,
  onSubmit,
}: {
  amount: string;
  contacts: Contact[];
  message: string;
  search: string;
  selectedContact: Contact | null;
  userName: string;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onContactSelect: (contact: Contact) => void;
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
  onSearchChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const choosingContact = amount.trim().length > 0 && !message;

  return (
    <section className="flex flex-1 flex-col">
      <Header userName={userName} onLogout={onLogout} />
      {!choosingContact ? (
        <form className="mx-auto mt-16 flex w-full max-w-xl flex-col gap-6 sm:mt-24" onSubmit={onSubmit}>
          <h2 className="text-center text-lg font-bold">Digite o valor abaixo para transferir</h2>
          <input
            className="h-12 rounded-md border border-neutral-200 px-4 text-sm font-semibold outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            inputMode="decimal"
            placeholder="digite o valor em R$"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
          />
          {message && <p className="text-center text-sm font-semibold text-red-600">{message}</p>}
          <button className="h-12 rounded-md bg-black text-sm font-bold text-white" type="submit">
            Transferir Valor
          </button>
          <button
            className="h-12 rounded-md bg-red-600 text-sm font-bold text-white"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </form>
      ) : (
        <div className="mx-auto mt-12 flex w-full max-w-3xl flex-col sm:mt-16">
          <h2 className="text-center text-lg font-bold">Selecione a conta destino</h2>
          <input
            className="mt-8 h-12 rounded-md border border-neutral-200 px-4 text-sm font-semibold outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            placeholder="Search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <div className="mt-8 grid grid-cols-[86px_minmax(130px,1fr)_48px] border-b border-neutral-100 pb-3 text-sm font-bold text-neutral-400 sm:grid-cols-[120px_minmax(220px,1fr)_64px]">
            <span>Conta</span>
            <span>Favorecido</span>
            <span />
          </div>
          <div className="min-h-[260px]">
            {contacts.map((contact) => (
              <button
                className="grid w-full grid-cols-[86px_minmax(130px,1fr)_48px] items-center border-b border-neutral-100 py-3 text-left text-sm font-bold sm:grid-cols-[120px_minmax(220px,1fr)_64px]"
                key={contact.account}
                onClick={() => onContactSelect(contact)}
                type="button"
              >
                <span className="text-neutral-500">{contact.account}</span>
                <span>{contact.name}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                  {contact.initials}
                </span>
              </button>
            ))}
          </div>
          {selectedContact && (
            <p className="mt-2 text-center text-sm font-semibold text-emerald-700">
              Transferencia enviada para {selectedContact.name}.
            </p>
          )}
          <button
            className="mt-8 h-12 rounded-md bg-red-600 text-sm font-bold text-white"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      )}
      <BottomNav active="transfer" onNavigate={onNavigate} />
    </section>
  );
}

function Header({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-bold sm:text-2xl">Bem-vindo, {userName}</h1>
      <button
        className="h-10 w-full rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 sm:w-auto"
        onClick={onLogout}
        type="button"
      >
        Sair
      </button>
    </header>
  );
}

function BottomNav({
  active,
  onNavigate,
}: {
  active: "statement" | "deposit" | "withdraw" | "transfer";
  onNavigate: (screen: Screen) => void;
}) {
  const items = [
    { id: "statement", label: "Extrato", screen: "statement" },
    { id: "deposit", label: "Depositar", screen: "deposit" },
    { id: "withdraw", label: "Sacar", screen: "withdraw" },
    { id: "transfer", label: "Transferir", screen: "transfer" },
  ] as const;

  return (
    <nav className="mt-auto grid grid-cols-4 gap-2 pt-7 sm:mx-auto sm:w-full sm:max-w-2xl sm:gap-4">
      {items.map((item) => (
        <button
          className={`flex min-w-0 flex-col items-center gap-2 rounded-md px-2 py-2 text-[11px] font-bold transition sm:flex-row sm:justify-center sm:text-sm ${
            active === item.id ? "bg-indigo-50 text-indigo-800" : "text-neutral-800 hover:bg-neutral-50"
          }`}
          key={item.id}
          onClick={() => onNavigate(item.screen)}
          type="button"
        >
          <span
            className={`h-7 w-7 rounded-md ${
              active === item.id ? "bg-indigo-700" : "bg-neutral-200"
            }`}
          />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function FooterText({ children }: { children: string }) {
  return (
    <p className="mt-auto border-t border-neutral-100 pt-10 text-center text-sm font-semibold text-neutral-400">
      Conheca nossa <span className="font-bold text-neutral-500">{children}</span>
    </p>
  );
}

function parseAmount(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
}
