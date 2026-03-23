import { RegisterForm } from "@/components/AuthForms";

export default function RegisterPage() {
  return (
    <main className="auth-page-shell">
      <section className="centered-page">
        <RegisterForm />
      </section>
    </main>
  );
}
