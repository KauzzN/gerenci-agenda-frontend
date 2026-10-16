import { Link } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register } from "../services/auth"
import { useAuth } from "../hooks/useAuth";
import "./Register_page.css"
import "../styles/auth.css";

function Register () {

    const navigate = useNavigate();
    const { login: authenticate } = useAuth();

    const [username,setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(e) {
        e.preventDefault()
        if (submitting) return;

        try {
            setSubmitting(true);
            setErrorMessage("");
            const data = await register(username, email, password);

            await authenticate(data.tokens.access_token, data.tokens.refresh_token);

            navigate("/dashboard");
        } catch (err) {
            setErrorMessage(err.response
                ? err.response.data?.error || "Não foi possível concluir o cadastro. Verifique os dados informados."
                : "Não foi possível conectar. Verifique sua conexão e tente novamente.");
        } finally {
            setSubmitting(false);
        }
    }
    
    return (
        <div className="Register-body">
            <header className="header-register">

                <h2 className="h2-register-gerenci">Gerenci <span className="span-register-agenda">Agenda</span></h2>
                <small className="slogan-register">Organize o seu dia sem esforço</small>
                
            </header>

            <div className="container-register">
                <h2>Cadastro</h2>

                <form 
                    className="register-form"
                    onSubmit={handleSubmit}
                    >

                    <div className="register-box">

                        <label className="auth-field" htmlFor="register-username">Nome de usuário
                            <input
                                id="register-username"
                                type="text"
                                placeholder="Seu nome de usuário"
                                autoComplete="username"
                                className="register-input"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setErrorMessage(""); }}
                                required
                            />
                        </label>
                        <label className="auth-field" htmlFor="register-email">Email
                            <input
                                id="register-email"
                                type="email"
                                placeholder="seu@email.com"
                                autoComplete="email"
                                className="register-input"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); }}
                                required
                            />
                        </label>
                        <label className="auth-field" htmlFor="register-password">Senha
                            <input
                                id="register-password"
                                type="password"
                                placeholder="Crie uma senha"
                                autoComplete="new-password"
                                className="register-input"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                                required
                            />
                        </label>

                    </div>

                    {errorMessage && <p id="register-error" className="auth-error" role="alert">{errorMessage}</p>}
                    <button type="submit" className="register-btn" disabled={submitting}>
                        {submitting ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                <div className="login">
                    <p>
                        Já possui uma conta? <br />
                        <Link to={"/"}>
                            Entrar
                        </Link>
                    </p>
                </div>

            </div>

        </div>
    )
}

export default Register