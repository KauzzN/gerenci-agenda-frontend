import { Link } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../services/auth"
import { useAuth } from "../hooks/useAuth";
import './Login_Page.css'
import "../styles/auth.css";

function Login() {

  const navigate = useNavigate();
  const { login: authenticate } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage("");
      const data = await login(username, password);

      await authenticate(data.tokens.access_token, data.tokens.refresh_token);

      navigate("/dashboard");
    } catch (err) {
      setErrorMessage(err.response
        ? err.response.data?.error || "Usuário ou senha inválidos."
        : "Não foi possível conectar. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
    }
    
  }
  return (
    <div className='Login-body'>
      <header className="header-login">

        <h2>Gerenci <span>Agenda</span></h2>
        <small>Organize o seu dia sem esforço</small>

      </header>

      <div className='container-login'>
        <h2>Login</h2>

        <form 
          className="login-form"
          onSubmit={handleSubmit}
          >

          <div className='login_box'>
            <label className="auth-field" htmlFor="login-username">Usuário
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                placeholder="Seu usuário"
                className="login-input"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrorMessage(""); }}
                required
              />
            </label>
            <label className="auth-field" htmlFor="login-password">Senha
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha"
                className="login-input"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                required
              />
            </label>
          </div>

          {errorMessage && <p id="login-error" className="auth-error" role="alert">{errorMessage}</p>}
          <button type='submit' className="login-btn" disabled={submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </button>

        </form>

        <div className="register">

          <p>Não possui uma conta?</p>

            <Link to={"/register"}>
              Criar Conta
            </Link>


        </div>

      </div>

    </div>
  )
}

export default Login  