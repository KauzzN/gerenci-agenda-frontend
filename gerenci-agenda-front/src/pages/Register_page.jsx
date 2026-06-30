import { Link } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register } from "../services/auth"
import { saveTokens } from "../utils/token"
import "./Register_page.css"

import toast from "react-hot-toast"

function Register () {

    const navigate = useNavigate();

    const [username,setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault()

        setLoading(true)

        try {
            const data = await register(username, email, password);

            saveTokens(data.tokens.access_token, data.tokens.refresh_token);

            toast.success("Conta criada com sucesso!")

            navigate("/dashboard");
        } catch (err) {

            console.log("Erro login:", err);
            toast.error("usuario ou email já cadastrados")
        } finally {
            setLoading(false)
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

                        <input 
                            type="text"
                            placeholder="Nome de usuário"
                            autoComplete="current-password"
                            className="register-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input 
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            className="register-input"   
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input 
                            type="password"
                            placeholder="Senha"
                            autoComplete="new-password"
                            className="register-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                    </div>

                    <button 
                        type="submit" 
                        className="register-btn"
                        disabled={loading}>
                        {
                            loading
                            ? "Criando..."
                            : "Criar"
                        }
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