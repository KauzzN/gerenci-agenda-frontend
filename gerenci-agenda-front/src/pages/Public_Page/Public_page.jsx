import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./Public_page.css";

import {
    buscarHorarios,
    buscarProfilePublic,
    criarAgendamentoPublic
} from "../../services/public";
import toast from "react-hot-toast";
import { Calendar, ClipboardList, Clock3, User } from "lucide-react";

function PublicPage() {

    const { slug } = useParams();

    const hoje = new Date().toISOString().slice(0,10);

    const [profile, setProfile] = useState(null);

    const [data, setData] = useState(hoje);

    const [horarios, setHorarios] = useState([]);

    const [horarioSelecionado, setHorarioSelecionado] = useState("");

    const [nome, setNome] = useState("");

    const [loading, setLoading] = useState(false);

    async function carregarProfile() {

        try{

            const data = await buscarProfilePublic(slug);

            setProfile(data);

        }catch(err){
            console.log(err);
        }

    }

    async function carregarHorarios(){

        try{

            const response = await buscarHorarios(
                slug,
                data
            );

            setHorarios(response.horarios);

        }catch(err){

            console.log(err);

        }

    }

    async function handleAgendar(){

        if (!nome.trim()) {
            alert("Informe seu nome.")
            return;
        }

        if(!horarioSelecionado.trim()) {
            alert("Selecione um horário.");
            return;
        }


        try{

            setLoading(true);

            await criarAgendamentoPublic(
                slug,
                {nome,
                horario: `${data} ${horarioSelecionado}:00`}
            );

            toast.success("Horário agendado")

            setNome("");

            setHorarioSelecionado("");

            await carregarHorarios();

        }catch(err){

            console.log(err.response.data);

        }finally{

            setLoading(false);

        }

    }

    useEffect(()=>{

        carregarProfile();

    },[slug]);

    useEffect(()=>{

        carregarHorarios();

    },[slug,data]);

    return (

        <main className="public-page">

            <div className="public-card">

                <h1>{profile?.nome}</h1>

                <p>
                    Agende seu horário em poucos segundos.
                </p>

                <label className="field-label">
                    <Calendar size={18}/> Escolha a data
                </label>

                <input
                    type="date"
                    value={data}
                    onChange={(e)=>setData(e.target.value)}
                />

                <h3> <Clock3 size={18}/> Horários disponíveis</h3>

                <div className="time-grid">

                    {horarios.map(({horario})=>(

                        <button

                            key={horario}

                            className={
                                horarioSelecionado===horario
                                ? "time-button selected"
                                : "time-button"
                            }

                            onClick={()=>setHorarioSelecionado(horario)}

                        >

                            {horario}

                        </button>

                    ))}

                    {horarios.length === 0 && (
                        <div className="empty-times">
                            Nenhum horário disponível para esta data.
                        </div>
                    )}

                </div>

                <label className="field-label">
                    <User size={18}/> Seu nome
                </label>

                <input
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e)=>setNome(e.target.value)}
                />

                <div className="summary">

                    <h3> <ClipboardList size={18}/> Resumo do agendamento</h3>

                    <div className="summary-item">
                        <span>Data</span>
                        <strong>{data}</strong>
                    </div>

                    <div className="summary-item">
                        <span>Horário</span>
                        <strong>{horarioSelecionado || "--:--"}</strong>
                    </div>

                    <div className="summary-item">
                        <span>Cliente</span>
                        <strong>{nome || "..."}</strong>
                    </div>

                </div>

                <button

                    className="schedule-button"

                    disabled={loading}

                    onClick={handleAgendar}

                >

                    {
                        loading
                        ? "Agendando..."
                        : "Confirmar Agendamento"
                    }

                </button>


            </div>

        </main>

        )

}

export default PublicPage;