import { Link } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../services/auth"
import { saveTokens } from "../utils/token"
import './Login_Page.css'
import toast from "react-hot-toast"

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true);

    try {
      const data = await login(username, password);

      toast.success("Bem-vindo!")

      saveTokens(data.tokens.access_token, data.tokens.refresh_token);

      navigate("/dashboard");
    } catch (err) {

      toast.error("Usuário ou senha inválidos.")
      console.log("Erro login:", err);
    } finally {
      setLoading(false)
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
          
            <input 
              type="text" 
              placeholder=' usuário'
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input 
              type="password"
              placeholder=' senha'
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
          </div>

          <button type='submit' className="login-btn"
            disabled={loading}>
              {
                loading
                ? "Entrando..."
                : "Entrar"
              }
          </button>

        </form>

        <div className="register">

            <Link to={"/register"}>
              Criar Conta
            </Link>


        </div>

      </div>

    </div>
  )
}

export default Login  