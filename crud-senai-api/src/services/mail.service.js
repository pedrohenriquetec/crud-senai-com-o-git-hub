import nodemailer from "nodemailer";
/** 
* Configuração do transporte SMTP. 
* Neste exemplo utilizamos Gmail. 
*/
// transportador SMTP com configuração de Gmail. se variáveis estiverem vazias, usamos dummy para evitar crash
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER || "",
        pass: process.env.MAIL_PASS || ""
    }
});

// opcional: verificar configuração ao iniciar (não bloqueia o app)
transporter.verify().catch(err => {
    console.warn("Aviso: falha ao verificar configuração SMTP:", err.message);
});
/** 
* Envia e-mail com token de redefinição de senha. 
*/
export async function sendPasswordResetEmail(email, token) {
    const resetLink = `http://localhost:5500/pages/reset-password.html?token=${token}`;
    const message = {
        from: `"Sistema SENAI" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Redefinição de senha",
        html: `
<h2>Redefinição de senha</h2>
<p>Foi solicitada a redefinição da sua senha.</p>
<p>Use o token abaixo ou acesse o link:</p>
<p><b>${token}</b></p>
<p>
<a href="${resetLink}">
Redefinir senha
</a>
</p>
<p>Este token expira em 15 minutos.</p>
`
    };

    try {
        await transporter.sendMail(message);
    } catch (err) {
        // não propaga erro; o processo de reset continua mesmo que o e‑mail falhe
        console.error("Falha ao enviar e-mail de reset:", err);
    }
}