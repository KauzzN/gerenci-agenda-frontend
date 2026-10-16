import "./DashboardStats.css"
import { CalendarDays, CheckCircle, Clock4Icon, UserRoundXIcon } from "lucide-react";


function DashboardStats ({ stats }) {
    
    if (!stats) return null;


    return (
        <div className="stats-container">

            <div className="stat-card stat-card-overall">
                <div className="stat-card-info">
                    <p>Agendamentos hoje</p>
                </div>

                <div className="stat-icons">
                    <h2>{stats.total ?? 0}</h2>
                    <CalendarDays
                    className="icon-calendar"
                    size={24}/>
                </div>
                <p>Total do dia</p>
            </div>

            <div className="stat-card stat-card-success">
                <div className="stat-card-info">
                    <p>Atendidos</p>
                </div>

                <div className="stat-icons">
                    <h2>{stats.atendidos ?? 0}</h2>
                    <CheckCircle 
                    className="icon-success"
                    size={24}/>
                </div>

                <p>Concluidos</p>
            </div>

            <div className="stat-card stat-card-pending">
                <div className="stat-card-info">
                    <p>Pendentes</p>
                </div>

                <div className="stat-icons">
                    <h2>{stats.pendentes ?? 0}</h2>
                    <Clock4Icon 
                    className="icon-pending"
                    size={24}/>
                </div>
                <p>Aguardando</p>
            </div>

            <div className="stat-card stat-card-missed">
                <div className="stat-card-info">
                    <p>Faltaram</p>
                </div>

                <div className="stat-icons">
                    <h2>{stats.faltaram ?? 0}</h2>
                    <UserRoundXIcon 
                    className="icon-missed"
                    size={24}/>
                </div>
                <p>Ausências</p>
            </div>
        </div>

    )
}

export default DashboardStats