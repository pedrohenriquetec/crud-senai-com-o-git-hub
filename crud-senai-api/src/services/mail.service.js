import nodemailer from "nodemailer"; 
/** 
* Configuração do transporte SMTP. 
* Neste exemplo utilizamos Gmail. 
*/ 
const transporter = nodemailer.createTransport({ 
host: "smtp.gmail.com", 
port: 587, 
secure: false, 
auth: { 
user: process.env.MAIL_USER, 
pass: process.env.MAIL_PASS 
} 
}); 
/** 
* Envia e-mail com token de redefinição de senha. 
*/ 
export async function sendPasswordResetEmail(email, token) { 
const resetLink = `http://localhost:5500/pages/reset
password.html?token=${token}`; 
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
await transporter.sendMail(message); 
}