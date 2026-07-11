import { useState, useEffect } from "react";
import { atualizarProfile } from "../../services/agendamento";

function ModalSlug({ profile, onClose, onUpdated}) {

    const [slug, setSlug] = useState("")

    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setLoading(true)

            await atualizarProfile({

                public_slug: slug

            })

            onUpdated();

            onClose();
        } catch (err) {

            console.log(err)

        } finally {

            setLoading(false)

        }
    }

    useEffect(() => {
        if (profile) {
            setSlug(profile.public_slug)
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