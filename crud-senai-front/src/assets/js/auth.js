import { apiRequest, setToken } from "./api.js";
import { $, showAlert, hideAlert, validateEmail } from "./utils.js";

export function getLoggedUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
}

export function initLoginPage() {
    const form = $("#loginForm");
    const emailEl = $("#email");
    const passEl = $("#password");
    const alertEl = $("#alert");
    const forgotBtn = $("#forgotBtn");

    hideAlert(alertEl);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAlert(alertEl);

        const email = emailEl.value.trim().toLowerCase();
        const password = passEl.value;

        if (!validateEmail(email)) {
            return showAlert(alertEl, "warn", "Informe um e-mail válido.");
        }

        try {
            const data = await apiRequest("/api/auth/login", {
                method: "POST",
                body: { email, password },
                auth: false
            });

            // Salva token e (opcional) o usuário
            setToken(data.token);
            if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

            showAlert(alertEl, "ok", "Login realizado! Redirecionando...");
            setTimeout(() => (window.location.href = "./users.html"), 700);
        } catch (err) {
            // Tratamento por código HTTP (quando disponível)
            if (err.status === 401) {
                return showAlert(alertEl, "err", "E-mail ou senha incorretos.");
            }

            if (err.status === 423) {
                return showAlert(alertEl, "err", "Usuário bloqueado temporariamente. Aguarde alguns minutos e tente novamente.");
            }

            // Fallback (erros não previstos)
            showAlert(alertEl, "err", err.message || "Falha ao autenticar.");
        }
    });

 forgotBtn.addEventListener("click", async () => { 
  hideAlert(alertEl); 
 
  const email = emailEl.value.trim().toLowerCase(); 
 
  if (!validateEmail(email)) { 
    return showAlert(alertEl, "warn", "Para redefinir, informe um e-mail válido no campo e-mail."); 
  } 
 
  try { 
    const data = await apiRequest("/api/auth/forgot-password", { 
      method: "POST", 
      body: { email }, 
      auth: false 
    }); 

    console.log("data: ",data);
 
    const tokenInfo = data.token ? ` Token: ${data.token}` : "";
    showAlert(
      alertEl,
      "ok",
      `${data.message}${tokenInfo}`
    );

    // opcional: redirecionar para a página de redefinição
    setTimeout(() => {
      window.location.href = "./reset-password.html";
    }, 800);
} catch (err) { 
console.log("DEBUG ERRO FORGOT PASSWORD:", err.message, err.status, 
err.data); 
showAlert(alertEl, "err", err.message || "Falha ao solicitar redefinição de senha."); 
} 
});
}