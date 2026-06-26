import { Link } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../services/auth"
import { saveTokens } from "../utils/token"
import './Login_Page.css'

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const data = await login(username, password);

      saveTokens(data.access_token, data.refresh_token);

      navigate("/dashboard");
    } catch (err) {
      console.log("Erro login:", err);
      alert("Login inválido")
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

          <button type='submit' className="login-btn">
            Entrar
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