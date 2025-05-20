import React, { useState, useEffect, useCallback } from 'react';

// Configuração da API
const AIRTABLE_BASE_ID = 'appqkjRYvyIwSHLR7';
const AIRTABLE_TOKEN = 'patNIM0Lo6dcGG5oi.17e5f1e4ea00174d38fc29d288134a64b8dfd7862ea8a19d1876be0a8fdcd244';
const API_URL_LOCACOES = `https://api.airtable.com/v0/appqkjRYvyIwSHLR7/locacoes`;
const API_URL_CARACTERISTICAS = `https://api.airtable.com/v0/appqkjRYvyIwSHLR7/caracteristicas`;

// --- Ícones SVG ---
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.242.078 3.223.226M5.256 5.79m0 0a48.068 48.068 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const IconCode = () => ( // Novo ícone para o cabeçalho
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-cyan-400 mr-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
);


// --- Componentes Auxiliares ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-modalPopIn border border-slate-700">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-700">
          <h2 className="text-2xl font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-3xl transition-colors">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Alert = ({ message, type, onClose }) => {
  if (!message) return null;
  let bgColor, borderColor, textColor, icon;

  if (type === 'success') {
    bgColor = 'bg-green-700/30'; // Mais sutil para dark mode
    borderColor = 'border-green-500';
    textColor = 'text-green-300';
    icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-3 text-green-400"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>;
  } else { // error
    bgColor = 'bg-red-700/30'; // Mais sutil para dark mode
    borderColor = 'border-red-500';
    textColor = 'text-red-300';
    icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-3 text-red-400"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-2.93-5.07a.75.75 0 0 1 1.06-1.06L10 10.94l1.87-1.87a.75.75 0 1 1 1.06 1.06L11.06 12l1.87 1.87a.75.75 0 1 1-1.06 1.06L10 13.06l-1.87 1.87a.75.75 0 0 1-1.06-1.06L8.94 12l-1.87-1.87Z" clipRule="evenodd" /></svg>;
  }

  return (
    <div className={`border-l-4 ${borderColor} ${bgColor} ${textColor} p-4 rounded-md shadow-lg mb-6 flex items-center`} role="alert">
      {icon}
      <span className="flex-grow font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 text-current opacity-70 hover:opacity-100">
        <svg className="fill-current h-5 w-5" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fechar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
      </button>
    </div>
  );
};


// --- Hooks e Funções da API ---
const useAirtable = (apiUrl) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });
      if (!response.ok) throw new Error(`Erro na API: ${response.statusText} (Status: ${response.status})`);
      const result = await response.json();
      setData(result.records || []);
    } catch (err) {
      console.error("Falha ao buscar dados:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createRecord = async (fields) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields }] }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao criar registro - Detalhes:", errorData);
        throw new Error(`Erro ao criar: ${errorData.error?.message || response.statusText}`);
      }
      await fetchData();
      return await response.json();
    } catch (err) {
      console.error("Falha ao criar registro:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (id, fields) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ id, fields }] }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao atualizar registro - Detalhes:", errorData);
        throw new Error(`Erro ao atualizar: ${errorData.error?.message || response.statusText}`);
      }
      await fetchData();
      return await response.json();
    } catch (err) {
      console.error("Falha ao atualizar registro:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const deleteUrl = `${apiUrl}?records[]=${id}`;
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao deletar registro - Detalhes:", errorData);
        throw new Error(`Erro ao deletar: ${errorData.error?.message || response.statusText}`);
      }
      await fetchData();
      return await response.json();
    } catch (err) {
      console.error("Falha ao deletar registro:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRecordById = useCallback(async (recordId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/${recordId}`, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });
      if (!response.ok) throw new Error(`Erro na API ao buscar registro: ${response.statusText}`);
      return await response.json();
    } catch (err) {
      console.error("Falha ao buscar registro por ID:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  return { data, loading, error, fetchData, createRecord, updateRecord, deleteRecord, fetchRecordById, setError };
};


// --- Componente de Gerenciamento de Características (Features) ---
const CaracteristicasCrud = () => {
  const { data: caracteristicas, loading, error: apiErrorHook, createRecord, updateRecord, deleteRecord, fetchData, setError: setApiError } = useAirtable(API_URL_CARACTERISTICAS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCaracteristica, setCurrentCaracteristica] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const [alert, setAlert] = useState({ message: '', type: '' });

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 5000);
  };
  const closeAlert = () => setAlert({ message: '', type: '' });

  const handleOpenModal = (caracteristica = null) => {
    setCurrentCaracteristica(caracteristica);
    setFormData(caracteristica ? { nome: caracteristica.fields.nome, descricao: caracteristica.fields.descricao || '' } : { nome: '', descricao: '' });
    setIsModalOpen(true);
    setApiError(null); 
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCaracteristica(null);
    setFormData({ nome: '', descricao: '' });
    setApiError(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome) {
      showAlert("O nome da característica é obrigatório.", "error");
      return;
    }
    try {
      if (currentCaracteristica) {
        await updateRecord(currentCaracteristica.id, formData);
        showAlert("Característica atualizada com sucesso!", "success");
      } else {
        await createRecord(formData);
        showAlert("Característica criada com sucesso!", "success");
      }
      handleCloseModal();
      fetchData(); 
    } catch (err) {
       showAlert(`Erro: ${err.message}`, "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta característica? Esta ação é irreversível.')) {
      try {
        await deleteRecord(id);
        showAlert("Característica removida com sucesso!", "success");
        fetchData(); 
      } catch (err) {
        showAlert(`Erro ao remover: ${err.message}`, "error");
      }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Alert message={alert.message} type={alert.type} onClose={closeAlert} />
      {apiErrorHook && <Alert message={`Erro na API: ${apiErrorHook}`} type="error" onClose={() => setApiError(null)} />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-4 sm:mb-0">Gerenciar Perks & Setup</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary-dev flex items-center"
        >
          <IconPlus />
          Novo Perk/Item de Setup
        </button>
      </div>

      {loading && <p className="text-center text-slate-400 py-10 text-lg">Carregando perks...</p>}
      
      {!loading && !apiErrorHook && caracteristicas.length === 0 && (
        <div className="text-center py-10 bg-slate-800/50 rounded-lg p-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-500 mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <p className="text-slate-300 text-xl">Nenhum perk ou item de setup encontrado.</p>
            <p className="text-slate-400 mt-2">Adicione características como "Internet Fibra 1Gbps", "Monitor Ultrawide", "Cadeira Ergonômica Premium", etc.</p>
        </div>
      )}

      {!loading && caracteristicas.length > 0 && (
        <div className="overflow-x-auto bg-slate-800 shadow-xl rounded-lg border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Nome do Perk/Item</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Descrição Adicional</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {caracteristicas.map((c) => (
                <tr key={c.id} className="hover:bg-slate-700/70 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{c.fields.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{c.fields.descricao || <span className="italic text-slate-500">Não informado</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleOpenModal(c)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors duration-150"
                      title="Editar Perk"
                    >
                      <IconPencil />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-400 transition-colors duration-150"
                      title="Excluir Perk"
                    >
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentCaracteristica ? 'Editar Perk/Item' : 'Novo Perk/Item de Setup'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-slate-300 mb-1">Nome <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="nome"
              id="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="input-style-modal-dev"
              placeholder="Ex: Internet Fibra 1Gbps, Monitor Dell 27 4K"
            />
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
            <textarea
              name="descricao"
              id="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="4"
              className="input-style-modal-dev"
              placeholder="Ex: Conexão estável para streaming e trabalho pesado, Tela com alta resolução para coding."
            ></textarea>
          </div>
          {apiErrorHook && <p className="text-sm text-red-400 bg-red-700/30 p-3 rounded-md">Erro na API: {apiErrorHook}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-secondary-dev">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary-dev disabled:opacity-60">
              {loading ? 'Salvando...' : (currentCaracteristica ? 'Atualizar Perk' : 'Criar Perk')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


// --- Componente de Gerenciamento de Locações (Locations) ---
const LocacoesCrud = () => {
  const { data: locacoes, loading, error: apiErrorHook, createRecord, updateRecord, deleteRecord, fetchData: fetchLocacoes, setError: setApiError } = useAirtable(API_URL_LOCACOES);
  const { data: todasCaracteristicas, loading: loadingCaracteristicas } = useAirtable(API_URL_CARACTERISTICAS);
  
  console.log(todasCaracteristicas)

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocacao, setCurrentLocacao] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '', descricao: '', preco: '', cidade: '', imagem: '', locacao_caracteristicas: [],
  });
  const [alert, setAlert] = useState({ message: '', type: '' });

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 5000);
  };
  const closeAlert = () => setAlert({ message: '', type: '' });

  const handleOpenModal = (locacao = null) => {
    setCurrentLocacao(locacao);
    
    if (locacao) {
      setFormData({
        titulo: locacao.fields.titulo || '',
        descricao: locacao.fields.descricao || '',
        preco: locacao.fields.preco || '',
        cidade: locacao.fields.cidade || '',
        imagem: locacao.fields.imagem || '',
        locacao_caracteristicas: locacao.fields.locacao_caracteristicas || [],
      });
    } else {
      setFormData({ titulo: '', descricao: '', preco: '', cidade: '', imagem: '', locacao_caracteristicas: [] });
    }
    setIsModalOpen(true);
    setApiError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLocacao(null);
    setFormData({ titulo: '', descricao: '', preco: '', cidade: '', imagem: '', locacao_caracteristicas: [] });
    setApiError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'preco' ? parseFloat(value) || '' : value });
  };

  const handleCaracteristicasChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, locacao_caracteristicas: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.preco || !formData.cidade) {
      showAlert("Título, Preço e Cidade são obrigatórios.", "error");
      return;
    }
    const payload = { ...formData, preco: Number(formData.preco) };
     if (isNaN(payload.preco) || payload.preco <= 0) {
        showAlert("Preço deve ser um número válido e maior que zero.", "error");
        return;
    }
    // DEBUG LOG ADICIONADO AQUI
    console.log("DEBUG: Payload para criar DevSpace:", payload);

    try {
      if (currentLocacao) {
        await updateRecord(currentLocacao.id, payload);
        showAlert("DevSpace atualizado com sucesso!", "success");
      } else {
        await createRecord(payload);
        showAlert("DevSpace criado com sucesso!", "success");
      }
      handleCloseModal();
      fetchLocacoes();
    } catch (err) {
      showAlert(`Erro: ${err.message}`, "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este DevSpace? Esta ação é irreversível.')) {
      try {
        await deleteRecord(id);
        showAlert("DevSpace removido com sucesso!", "success");
        fetchLocacoes();
      } catch (err) {
        showAlert(`Erro ao remover: ${err.message}`, "error");
      }
    }
  };
  
  const getCaracteristicaNomes = (loc) => {
    if (!loc) return

    return loc?.fields?.nome_caracteristica?.map((cat) => {
      return cat;
    }).join(', ');
  };


  return (
    <div className="p-4 md:p-8">
      <Alert message={alert.message} type={alert.type} onClose={closeAlert} />
      {apiErrorHook && <Alert message={`Erro na API: ${apiErrorHook}`} type="error" onClose={() => setApiError(null)} />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-4 sm:mb-0">Gerenciar DevSpaces</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary-dev-green flex items-center"
        >
          <IconPlus />
          Novo DevSpace
        </button>
      </div>

      {loading && <p className="text-center text-slate-400 py-10 text-lg">Carregando DevSpaces...</p>}
      
      {!loading && !apiErrorHook && locacoes.length === 0 && (
         <div className="text-center py-10 bg-slate-800/50 rounded-lg p-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-500 mx-auto mb-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25M12 4.5l-4.5 16.5M12 4.5l4.5 16.5" /> {/* Ícone de código ou similar */}
            </svg>
            <p className="text-slate-300 text-xl">Nenhum DevSpace encontrado.</p>
            <p className="text-slate-400 mt-2">Adicione um novo local otimizado para desenvolvedores.</p>
        </div>
      )}

      {!loading && locacoes.length > 0 && (
        <div className="overflow-x-auto bg-slate-800 shadow-xl rounded-lg border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Título do DevSpace</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Cidade/Hub</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Preço/noite</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Principais Perks</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {locacoes.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-700/70 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{loc.fields.titulo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{loc.fields.cidade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">R$ {loc.fields.preco?.toFixed(2).replace('.',',')}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate" title={typeof getCaracteristicaNomes(loc.fields.locacao_caracteristicas) === 'string' ? getCaracteristicaNomes(loc.fields.locacao_caracteristicas) : ''}>
                    {getCaracteristicaNomes(loc)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleOpenModal(loc)} className="text-cyan-400 hover:text-cyan-300 transition-colors" title="Editar DevSpace"><IconPencil /></button>
                    <button onClick={() => handleDelete(loc.id)} className="text-red-500 hover:text-red-400 transition-colors" title="Excluir DevSpace"><IconTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentLocacao ? 'Editar DevSpace' : 'Novo DevSpace'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-slate-300 mb-1">Título <span className="text-red-400">*</span></label>
            <input type="text" name="titulo" id="titulo" value={formData.titulo} onChange={handleChange} required className="input-style-modal-dev" placeholder="Ex: Coding Sanctuary com Fibra Ótica"/>
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-slate-300 mb-1">Descrição Detalhada</label>
            <textarea name="descricao" id="descricao" value={formData.descricao} onChange={handleChange} rows="4" className="input-style-modal-dev" placeholder="Descreva o ambiente, setup, e diferenciais para devs..."></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="preco" className="block text-sm font-medium text-slate-300 mb-1">Preço (R$) <span className="text-red-400">*</span></label>
              <input type="number" name="preco" id="preco" value={formData.preco} onChange={handleChange} required step="0.01" min="0.01" className="input-style-modal-dev" placeholder="250.00"/>
            </div>
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-slate-300 mb-1">Cidade/Hub <span className="text-red-400">*</span></label>
              <input type="text" name="cidade" id="cidade" value={formData.cidade} onChange={handleChange} required className="input-style-modal-dev" placeholder="Ex: Florianópolis (Sapiens Parque)"/>
            </div>
          </div>
          <div>
            <label htmlFor="imagem" className="block text-sm font-medium text-slate-300 mb-1">URL da Imagem do Setup/Local</label>
            <input type="url" name="imagem" id="imagem" value={formData.imagem} onChange={handleChange} className="input-style-modal-dev" placeholder="https://exemplo.com/setup_dev.jpg" />
          </div>
          <div>
            <label htmlFor="locacao_caracteristicas" className="block text-sm font-medium text-slate-300 mb-1">Perks & Setup Inclusos</label>
            {loadingCaracteristicas ? <p className="text-slate-400">Carregando perks...</p> : (
              <select
                multiple
                name="locacao_caracteristicas"
                id="locacao_caracteristicas"
                value={formData.locacao_caracteristicas}
                onChange={handleCaracteristicasChange}
                className="input-style-modal-dev h-40"
              >
                {
                todasCaracteristicas.map(c => (
                  <option key={c.id} value={c.fields.locacao_caracteristicas} className="p-2 hover:bg-slate-700 text-slate-200">{c.fields.nome}</option>
                ))}
              </select>
            )}
            <p className="mt-1.5 text-xs text-slate-500">Segure Ctrl (ou Cmd em Mac) para selecionar múltiplos itens.</p>
          </div>
          {apiErrorHook && <p className="text-sm text-red-400 bg-red-700/30 p-3 rounded-md">Erro na API: {apiErrorHook}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-secondary-dev">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary-dev-green disabled:opacity-60">
              {loading ? 'Salvando...' : (currentLocacao ? 'Atualizar DevSpace' : 'Criar DevSpace')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- Componente de Pré-Visualização ---
const PreVisualizacao = () => {
  const { data: locacoes, loading, error: apiErrorHook, setError: setApiError } = useAirtable(API_URL_LOCACOES);
  const { data: todasCaracteristicas, loading: loadingCaracteristicas } = useAirtable(API_URL_CARACTERISTICAS);
  
  const [selectedLocacao, setSelectedLocacao] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenDetailModal = (locacao) => {
    setSelectedLocacao(locacao); 
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLocacao(null);
  };
  
  const getCaracteristicaNomesParaPreview = (loc) => {
    if (!loc) {
      return []
    }

    if (!loc.fields.nome_caracteristica){
      return []
    }
    
    return loc.fields.nome_caracteristica?.map(names => {      
      return names;
    }).filter(nome => nome !== null);
  };

  if (loading) return <p className="text-center text-slate-400 py-20 text-xl">Carregando DevSpaces disponíveis...</p>;
  if (apiErrorHook) return <div className="p-8"><Alert message={`Erro ao carregar DevSpaces: ${apiErrorHook}`} type="error" onClose={() => setApiError(null)} /></div>;

  return (
    <div className="p-4 md:p-8 bg-slate-900 min-h-[calc(100vh-200px)]">
      <h1 className="text-4xl font-extrabold text-center mb-12 tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-400 to-green-400">
          Encontre seu Próximo DevSpace de Foco
        </span>
      </h1>
      
      {!apiErrorHook && locacoes.length === 0 && (
        <div className="text-center py-10 bg-slate-800/50 rounded-lg p-8">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-slate-600 mx-auto mb-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
            </svg>
            <p className="text-slate-300 text-2xl font-semibold">Nenhum DevSpace disponível no momento.</p>
            <p className="text-slate-400 mt-2">Parece que todos os hackerspaces estão ocupados. Volte em breve!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {locacoes.map((loc) => (
          <div 
            key={loc.id} 
            className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden group transform hover:scale-[1.03] transition-all duration-300 ease-in-out cursor-pointer flex flex-col border border-slate-700 hover:border-cyan-500/70"
            onClick={() => handleOpenDetailModal(loc)}
          >
            <div className="relative">
                <img 
                src={loc.fields.imagem || `https://placehold.co/600x400/1E293B/94A3B8?text=${encodeURIComponent(loc.fields.titulo || 'DevSpace')}`} 
                alt={`Imagem de ${loc.fields.titulo}`} 
                className="w-full h-60 object-cover transition-transform duration-300 group-hover:opacity-80"
                onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/334155/94A3B8?text=Image+Error`; }}
                />
                <div className="absolute top-3 right-3 bg-cyan-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {loc.fields.cidade}
                </div>
                 <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <h2 className="text-lg font-semibold text-white truncate" title={loc.fields.titulo}>{loc.fields.titulo}</h2>
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <p className="text-xl font-bold text-cyan-400 mb-3">R$ {loc.fields.preco?.toFixed(2).replace('.',',')} <span className="text-sm text-slate-400 font-normal">/ noite</span></p>
              <div className="h-20 overflow-y-auto mb-4 styled-scrollbar-dark">
                 <p className="text-slate-400 text-sm leading-relaxed line-clamp-4">{loc.fields.descricao || "Ambiente otimizado para máxima produtividade."}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenDetailModal(loc); }}
                className="mt-auto w-full btn-primary-dev-outline"
              >
                Ver Detalhes do Setup
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} title={selectedLocacao?.fields.titulo || "Detalhes do DevSpace"}>
        {selectedLocacao && (
          <div className="space-y-5">
            <img 
                src={selectedLocacao.fields.imagem || `https://placehold.co/600x400/1E293B/94A3B8?text=${encodeURIComponent(selectedLocacao.fields.titulo || 'DevSpace')}`} 
                alt={`Imagem de ${selectedLocacao.fields.titulo}`} 
                className="w-full h-72 object-cover rounded-lg shadow-lg mb-3 border border-slate-700"
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/334155/94A3B8?text=Image+Error'; }}
            />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <p className="text-lg"><strong className="font-semibold text-slate-200">Local:</strong> <span className="text-slate-400">{selectedLocacao.fields.cidade}</span></p>
                <p className="text-xl font-bold text-cyan-400">R$ {selectedLocacao.fields.preco?.toFixed(2).replace('.',',')} <span className="text-sm text-slate-400 font-normal">/ noite</span></p>
            </div>
            <div>
                <strong className="font-semibold text-slate-200 text-lg">Descrição Completa:</strong>
                <p className="text-slate-400 mt-1.5 leading-relaxed">{selectedLocacao.fields.descricao || "Nenhuma descrição detalhada fornecida."}</p>
            </div>
            <div>
              <strong className="font-semibold text-slate-200 text-lg">Perks & Setup:</strong>
              {loadingCaracteristicas ? <p className="text-slate-400 mt-1">Carregando...</p> : (
                <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2">
                  {getCaracteristicaNomesParaPreview(selectedLocacao).length > 0 ? 
                    getCaracteristicaNomesParaPreview(selectedLocacao).map(nome => <li key={nome} className="text-cyan-300"><span className="text-slate-400">{nome}</span></li>)
                    : <li className="text-slate-500 italic">Nenhum perk ou item de setup específico informado.</li>
                  }
                </ul>
              )}
            </div>
             <button 
                type="button"
                onClick={handleCloseDetailModal}
                className="mt-8 w-full btn-primary-dev"
            >
              Fechar Detalhes
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};


// --- Componente Principal App ---
function App() {
  const [activeTab, setActiveTab] = useState('preview'); 

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'locacoes':
        return <LocacoesCrud />;
      case 'caracteristicas':
        return <CaracteristicasCrud />;
      case 'preview':
        return <PreVisualizacao />;
      default:
        return <PreVisualizacao />;
    }
  };

  const TabButton = ({ tabName, currentTab, setTab, children, icon }) => (
    <button
      onClick={() => setTab(tabName)}
      className={`flex items-center py-3 px-4 md:px-6 font-medium text-sm md:text-base rounded-t-lg transition-all duration-200 ease-in-out border-b-2
                  ${currentTab === tabName 
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500 shadow-sm' // Active tab in dark mode
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-700/30 border-transparent'}`} // Inactive tab in dark mode
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-inter flex flex-col"> {/* Main background dark */}
      <header className="bg-slate-800 shadow-lg sticky top-0 z-30 border-b border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <div className="flex items-center">
                    <IconCode /> {/* Novo ícone */}
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight">DevBNB Admin</h1>
                </div>
            </div>
        </div>
      </header>
      
      <nav className="bg-slate-800 shadow-md sticky top-20 z-20 border-b border-slate-700">
        <div className="container mx-auto flex flex-wrap justify-center md:justify-start px-2 md:px-4">
          <TabButton 
            tabName="preview" 
            currentTab={activeTab} 
            setTab={setActiveTab}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" /></svg>}
          >
            Preview DevSpaces
          </TabButton>
          <TabButton 
            tabName="locacoes" 
            currentTab={activeTab} 
            setTab={setActiveTab}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21M9 3h6v3H9V3z" /></svg>}
          >
            Gerenciar DevSpaces
          </TabButton>
          <TabButton 
            tabName="caracteristicas" 
            currentTab={activeTab} 
            setTab={setActiveTab}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.93l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.738c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          >
            Perks & Setup
          </TabButton>
        </div>
      </nav>

      <main className="container mx-auto flex-grow">
        <div className="bg-slate-800/70 shadow-xl min-h-full"> 
            {renderActiveTab()}
        </div>
      </main>

      <footer className="text-center py-6 bg-slate-900 border-t border-slate-700 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} DevBNB Admin. Todos os direitos reservados.</p>
        <p>Crafted with <span className="text-cyan-400">&lt;/&gt;</span> for focused developers.</p>
      </footer>

      <style jsx global>{`
        /* Font Import */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #0F172A; /* slate-900 for the very base */
          color: #CBD5E1; /* slate-300 for general text */
        }

        /* Input Style for Modals (Dev Theme) */
        .input-style-modal-dev {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          line-height: 1.4rem;
          color: #E2E8F0; /* slate-200 */
          background-color: #1E293B; /* slate-800 */
          border: 1px solid #334155; /* slate-700 */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.1);
          transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .input-style-modal-dev:focus {
          outline: none;
          border-color: #06B6D4; /* cyan-500 */
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3); 
        }
        .input-style-modal-dev::placeholder {
            color: #64748B; /* slate-500 */
        }
        select.input-style-modal-dev option {
            background-color: #1E293B; /* slate-800 */
            color: #E2E8F0; /* slate-200 */
        }


        /* Primary Button Style (Dev Theme - Cyan) */
        .btn-primary-dev {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #0F172A; /* slate-900 for contrast */
          background-image: linear-gradient(to right, #22D3EE, #06B6D4); /* cyan-400 to cyan-500 */
          border: none;
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 2px 5px 0 rgba(6, 182, 212, 0.2), 0 1px 2px 0 rgba(0,0,0,0.06);
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .btn-primary-dev:hover {
          background-image: linear-gradient(to right, #06B6D4, #0891B2); /* cyan-500 to cyan-600 */
          box-shadow: 0 4px 10px 0 rgba(6, 182, 212, 0.3), 0 2px 4px 0 rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .btn-primary-dev:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: translateY(0);
            box-shadow: none;
        }

        /* Primary Green Button Style (Dev Theme - Green for Locações) */
        .btn-primary-dev-green {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #0F172A; /* slate-900 for contrast */
          background-image: linear-gradient(to right, #34D399, #10B981); /* emerald-400 to emerald-500 */
          border: none;
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 2px 5px 0 rgba(16, 185, 129, 0.2), 0 1px 2px 0 rgba(0,0,0,0.06);
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .btn-primary-dev-green:hover {
          background-image: linear-gradient(to right, #10B981, #059669); /* emerald-500 to emerald-600 */
          box-shadow: 0 4px 10px 0 rgba(16, 185, 129, 0.3), 0 2px 4px 0 rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .btn-primary-dev-green:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: translateY(0);
            box-shadow: none;
        }
        
        /* Secondary Button Style (Dev Theme) */
        .btn-secondary-dev {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #94A3B8; /* slate-400 */
          background-color: #334155; /* slate-700 */
          border: 1px solid #475569; /* slate-600 */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .btn-secondary-dev:hover {
          background-color: #475569; /* slate-600 */
          color: #CBD5E1; /* slate-300 */
          border-color: #64748B; /* slate-500 */
        }

        /* Outline Button for Preview Cards */
        .btn-primary-dev-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.65rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #22D3EE; /* cyan-400 */
          background-color: transparent;
          border: 2px solid #22D3EE; /* cyan-400 */
          border-radius: 0.5rem; /* rounded-lg */
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .btn-primary-dev-outline:hover {
          background-color: rgba(34, 211, 238, 0.1); /* cyan-400 with alpha */
          color: #67E8F9; /* cyan-300 */
          border-color: #67E8F9; /* cyan-300 */
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
        }
        
        html, body, #root { height: 100%; }
        .min-h-screen.flex.flex-col { min-height: 100vh; }
        main.flex-grow { flex-grow: 1; }

        /* Custom scrollbar for dark theme */
        .styled-scrollbar-dark::-webkit-scrollbar { width: 8px; }
        .styled-scrollbar-dark::-webkit-scrollbar-track { background: #1e293b; border-radius: 10px; } /* slate-800 */
        .styled-scrollbar-dark::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; } /* slate-600 */
        .styled-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #64748b; } /* slate-500 */
        .styled-scrollbar-dark { scrollbar-width: thin; scrollbar-color: #475569 #1e293b; }

        @keyframes modalPopIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-modalPopIn { animation: modalPopIn 0.3s ease-out forwards; }

        .line-clamp-4 {
          overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4;
        }
        select[multiple].input-style-modal-dev option:checked {
            background-color: #06B6D4 !important; /* cyan-500 */
            color: #0F172A !important; /* slate-900 */
        }
         select[multiple].input-style-modal-dev option {
            padding: 0.5rem 0.75rem;
        }
      `}</style>
    </div>
  );
}

export default App;

