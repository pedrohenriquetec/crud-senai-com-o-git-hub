// Importa a função para fazer requisições à API
import { apiRequest, setToken } from "./api.js";
// Importa funções utilitárias (DOM, alertas, validação)
import { $, setText, showAlert, hideAlert, validateEmail } from "./utils.js";
// Importa função para obter o usuário logado
import { getLoggedUser } from "./auth.js";

let usersCache = []; // Cache da lista de usuários

async function loadUsersFromApi(alertEl) {
  const list = await apiRequest("/api/users");
  usersCache = list;
  render(usersCache);
}
// ============================================================
// FUNÇÕES DE ARMAZENAMENTO (Simulação - banco local)
// Quando o backend estiver pronto, estas funções não serão mais necessárias
// ============================================================

/**
 * Carrega a lista de usuários do localStorage
 * Simula uma busca em banco de dados
 * @returns {Array} Lista de usuários ou array vazio se não existir
 */


/**
 * Salva a lista de usuários no localStorage
 * Simula uma gravação em banco de dados
 * @param {Array} users - Lista de usuários a ser salva
 */

// ============================================================
// FUNÇÕES DE RENDERIZAÇÃO (UI)
// Responsáveis por atualizar a tabela de usuários na página
// ============================================================

/**
 * Renderiza a lista de usuários na tabela HTML
 * 
 * @param {Array} users - Lista de usuários a exibir
 */
function render(users) {
  const tbody = $("#usersTbody");
  // Limpa a tabela antes de recarregar
  tbody.innerHTML = "";

  const loggedUser = getLoggedUser();
  const isAdmin = loggedUser && loggedUser.profile === "ADMIN";

  // Itera sobre cada usuário da lista
  users.forEach((u) => {
    const tr = document.createElement("tr");

    // Coluna Nome
    const tdName = document.createElement("td");
    setText(tdName, u.name);
    tr.appendChild(tdName);

    // Coluna Email
    const tdEmail = document.createElement("td");
    setText(tdEmail, u.email);
    tr.appendChild(tdEmail);

    // Coluna Status
    const tdStatus = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `badge ${u.status === "ACTIVE" ? "active" : "inactive"}`;
    setText(statusBadge, u.status === "ACTIVE" ? "Ativo" : "Inativo");
    tdStatus.appendChild(statusBadge);
    tr.appendChild(tdStatus);

    // Coluna Ações
    const tdActions = document.createElement("td");
    if (isAdmin) {
      const btnEdit = document.createElement("button");
      btnEdit.className = "btn-ghost";
      btnEdit.type = "button";
      btnEdit.textContent = "Editar";
      btnEdit.addEventListener("click", () => fillForm(u));
      tdActions.appendChild(btnEdit);

      const btnToggle = document.createElement("button");
      btnToggle.className = u.status === "ACTIVE" ? "btn-danger" : "btn-success";
      btnToggle.type = "button";
      btnToggle.textContent = u.status === "ACTIVE" ? "Inativar" : "Ativar";
      btnToggle.addEventListener("click", () => toggleStatus(u.id, u.status, $("#alertUsers")));
      tdActions.appendChild(btnToggle);
    }
    tr.appendChild(tdActions);

    // Adiciona a linha à tabela
    tbody.appendChild(tr);
  });
}

// ============================================================
// FUNÇÕES DE MANIPULAÇÃO DO FORMULÁRIO
// ============================================================

/**
 * Preenche o formulário com os dados de um usuário
 * Usado quando o usuário clica em "Editar"
 * 
 * @param {object} user - Objeto do usuário com dados
 */
function fillForm(user) {
  $("#userId").value = user.id;
  $("#name").value = user.name;
  $("#email").value = user.email;
  $("#profile").value = user.profile;
  $("#active").value = user.status === "ACTIVE" ? "1" : "0";
  $("#password").value = "";  // Limpa o campo de senha
  $("#password").placeholder = "Deixe em branco para manter a senha";
}

/**
 * Limpa todos os campos do formulário
 * Prepara para criar um novo usuário
 */
function clearForm() {
  $("#userId").value = "";
  $("#name").value = "";
  $("#email").value = "";
  $("#profile").value = "USER";
  $("#active").value = "1";
  $("#password").value = "";
  $("#password").placeholder = "Senha (será criptografada no backend)";
}

/**
 * Alterna o status de um usuário (ATIVO <-> INATIVO)
 * 
 * @param {string} id - ID do usuário
 * @param {string} currentStatus - Status atual
 * @param {Element} alertEl - Elemento para mostrar alertas
 */
async function toggleStatus(id, currentStatus, alertEl) {
  const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  try {
    await apiRequest(`/api/users/${id}/status`, {
      method: "PATCH",
      body: { status: newStatus }
    });
    // Recarrega a lista
    await loadUsersFromApi(alertEl);
    showAlert(alertEl, "ok", `Usuário ${newStatus === "ACTIVE" ? "ativado" : "inativado"} com sucesso!`);
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      setToken(null);
      window.location.href = "./login.html";
      return;
    }
    showAlert(alertEl, "err", err.message || "Erro ao alterar status.");
  }
}



// ============================================================
// FUNÇÃO PRINCIPAL - Inicializa a página de usuários
// ============================================================

/**
 * Inicializa todos os eventos e dados da página de usuários
 * É chamada quando a página carrega
 */
export async function initUsersPage() {
  // Captura os elementos HTML da página
  const form = $("#userForm");
  const alertEl = $("#alertUsers");
  const logoutBtn = $("#logoutBtn");
  const searchEl = $("#search");

  const loggedUser = getLoggedUser(); 
  if (!loggedUser || loggedUser.profile !== "ADMIN") { 
  form.style.display = "none"; 

  const userInfo = $("#loggedUserInfo"); 
  if (loggedUser) { 
  userInfo.textContent = `Logado como: ${loggedUser.name} 
  (${loggedUser.profile})`; 
}
} 

  // Esconde alertas iniciais
  hideAlert(alertEl);

  // ===== CARREGAMENTO INICIAL =====
  // Carrega e exibe a lista de usuários da API
  await loadUsersFromApi(alertEl);

  // ===== HANDLER: Formulário de Criar/Editar Usuário =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();  // Previne reload
    hideAlert(alertEl);  // Limpa alertas anteriores

    // Captura os valores do formulário
    const id = $("#userId").value;  // ID se editando, vazio se criando
    const name = $("#name").value.trim();
    const email = $("#email").value.trim().toLowerCase();
    const profile = $("#profile").value;  // ADMIN ou USER
    const active = $("#active").value === "1";  // Converte para booleano
    const password = $("#password").value;

    // ===== VALIDAÇÕES =====
    // Valida o nome (mínimo 3 caracteres)
    if (name.length < 3) return showAlert(alertEl, "warn", "Nome deve ter pelo menos 3 caracteres.");
    // Valida o email (formato correto)
    if (!validateEmail(email)) return showAlert(alertEl, "warn", "E-mail inválido.");
    // Valida senha para novo usuário
    if (!id && password.length < 6) return showAlert(alertEl, "warn", "Senha deve ter pelo menos 6 caracteres.");

    try {
      if (id) {
        // UPDATE: Editar usuário existente
        await apiRequest(`/api/users/${id}`, {
          method: "PUT",
          body: { name, email, profile, status: active ? "ACTIVE" : "INACTIVE" }
        });
      } else {
        // CREATE: Novo usuário
        await apiRequest("/api/users", {
          method: "POST",
          body: { name, email, profile, password }
        });
      }

      // Recarrega a lista após salvar
      await loadUsersFromApi(alertEl);
      // Limpa o formulário
      clearForm();
      // Mostra mensagem de sucesso
      showAlert(alertEl, "ok", "Usuário salvo com sucesso!");
    } catch (err) {
      // Tratamento de erros
      if (err.status === 401 || err.status === 403) {
        setToken(null);
        window.location.href = "./login.html";
        return;
      }
      if (err.status === 409) {
        return showAlert(alertEl, "err", "Já existe usuário com este e-mail.");
      }
      showAlert(alertEl, "err", err.message || "Erro ao salvar usuário.");
    }
  });

  // ===== HANDLER: Botão Limpar =====
  // Limpa o formulário quando clicado
  $("#btnClear").addEventListener("click", (e) => {
    e.preventDefault();
    clearForm();
    hideAlert(alertEl);
  });

  // ===== HANDLER: Campo de Busca =====
  // Filtra a lista conforme o usuário digita
  searchEl.addEventListener("input", () => {
    const term = searchEl.value.trim().toLowerCase();

    // Filtra usuários que contêm o termo no nome OU no email
    const filtered = usersCache.filter((u) =>
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
    // Renderiza apenas os usuários filtrados
    render(filtered);
  });

  // ===== HANDLER: Botão Sair (Logout) =====
  // Remove o token e redireciona para login
  logoutBtn.addEventListener("click", () => {
    setToken(null);  // Remove autenticação
    localStorage.removeItem("user"); 
    window.location.href = "./login.html";  // Redireciona para login
  });
}