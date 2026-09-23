import { useState, useEffect } from "react";
import { atualizarProfile } from "../../services/agendamento";
import toast from "react-hot-toast";

function ModalSlug({ profile, onClose, onUpdated}) {

    const [slug, setSlug] = useState("")

    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setLoading(true)

            const response = await atualizarProfile({

                public_slug: slug

            })

            onUpdated(response.profile);

            onClose();
        } catch (err) {

            const status = err.response?.status;
            const message = err.response?.data?.error;

            if (status === 400) {
                toast.error(message || "Informe um link público válido.");
            } else if (status === 401) {
                toast.error("Sua sessão expirou. Entre novamente para continuar.");
            } else if (status === 409) {
                toast.error(message || "Este link público já está em uso.");
            } else if (!err.response) {
                toast.error("Não foi possível conectar à API. Tente novamente.");
            } else {
                toast.error(message || "Não foi possível atualizar o link público.");
            }

        } finally {

            setLoading(false)

        }
    }

    useEffect(() => {
        if (profile) {
            setSlug(profile.public_slug || "")
        }
    }, [profile]);

    return (
        <div className="modal-overlay"
            onClick={onClose}>

            <div className="modal-container"
                onClick={(e) => e.stopPropagation()}>

                    <h2>Editar link público</h2>

                    <p>
                        Escolha um endereço simples para compartilhar com seus clientes.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <label>Link</label>

                        <div className="slug-input">

                            <span>
                                gerenciagenda.com/
                            </span>

                            <input 
                             value={slug}
                             onChange={(e) => setSlug(e.target.value)}/>

                        </div>

                        <div className="modal-actions">

                            <button 
                                type="button"
                                onClick={onClose}>
                                Cancelar
                            </button>

                            <button 
                                type="submit"
                                disabled={loading}>
                                {
                                    loading
                                    ? "Salvando..."
                                    : "Salvar"
                                }
                            </button>

                        </div>
                    </form>

            </div>
        </div>
    )
}

export default ModalSlug