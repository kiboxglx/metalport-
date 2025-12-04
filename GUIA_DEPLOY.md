# 🚀 Guia de Deploy (Colocar no Ar)

Este guia vai te ajudar a colocar seu sistema Metalport na internet usando GitHub e Vercel.

## Passo 1: GitHub (Guardar o Código)
1. Crie uma conta no [GitHub.com](https://github.com) (se não tiver).
2. Crie um **Novo Repositório** (botão "New"). Dê um nome, ex: `metalport-sistema`.
3. No seu computador, abra o terminal na pasta do projeto e rode:
   ```bash
   git init
   git add .
   git commit -m "Versão inicial completa"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/metalport-sistema.git
   git push -u origin main
   ```
   *(Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub)*

## Passo 2: Vercel (Hospedar o Site)
1. Crie uma conta na [Vercel.com](https://vercel.com).
2. Clique em **"Add New..."** -> **"Project"**.
3. Selecione **"Continue with GitHub"**.
4. Procure o repositório `metalport-sistema` e clique em **"Import"**.

## Passo 3: Configuração Crítica (Variáveis)
**NÃO CLIQUE EM DEPLOY AINDA!**

1. Na tela de configuração da Vercel, procure a seção **"Environment Variables"**.
2. Abra seu arquivo `.env` no computador.
3. Copie e cole as variáveis para a Vercel:
   - **Nome:** `VITE_SUPABASE_URL` | **Valor:** (Sua URL do Supabase)
   - **Nome:** `VITE_SUPABASE_ANON_KEY` | **Valor:** (Sua chave do Supabase)
4. Clique em **Add** para cada uma.

## Passo 4: Finalizar
1. Agora sim, clique em **"Deploy"**.
2. Aguarde uns minutos.
3. Pronto! A Vercel vai te dar um link (ex: `metalport-sistema.vercel.app`) para você acessar de qualquer lugar.

## 💡 Dica Importante
Já criei o arquivo `vercel.json` na pasta do projeto. Ele é essencial para que as páginas funcionem corretamente quando você recarregar o site. Não apague ele!
