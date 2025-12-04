# 🚀 GUIA RÁPIDO - FLUXO DE ALUGUÉIS

## ✅ O QUE FOI DESENVOLVIDO

Foram criadas **2 novas páginas** para completar o fluxo de aluguéis:

### 1️⃣ Página de Pagamento (`/alugueis/:id/pagamento`)
- **Quando usar**: Quando o aluguel está com status "Pagamento Pendente"
- **Como acessar**: Botão verde "Processar Pagamento" na página de detalhes
- **O que faz**:
  - Registra o pagamento do aluguel
  - Permite escolher forma de pagamento (PIX, Cartão, etc)
  - Avança o status para "Aprovado" ou "Aguardando Pagamento"

### 2️⃣ Página de Finalização (`/alugueis/:id/finalizacao`)
- **Quando usar**: Quando o aluguel está com status "Recolher Material"
- **Como acessar**: Botão roxo "Finalizar Contrato" na página de detalhes
- **O que faz**:
  - Checklist de recolhimento de equipamentos
  - Registro de devolução
  - Avaliação do cliente
  - Cálculo de diárias extras
  - Finaliza o contrato

---

## 📋 FLUXO PASSO A PASSO

### PASSO 1: Criar Aluguel
```
Status: pending (Pagamento Pendente)
```
- Vá em "Aluguéis" → "+ Novo Aluguel"
- Preencha os dados do cliente, produtos e datas
- Clique em "Criar Aluguel"

### PASSO 2: Processar Pagamento
```
Status: pending → confirmed (Aprovado)
```
- Na lista de aluguéis, clique em "Ver Detalhes"
- Clique no botão verde **"Processar Pagamento"**
- Preencha:
  - Forma de pagamento
  - Data do pagamento
  - Observações (opcional)
- Escolha:
  - **"Confirmar Pagamento"** → Status vira "Aprovado"
  - **"Aguardando Pagamento"** → Status vira "Aguardando Pagamento"

### PASSO 3: Iniciar Contrato
```
Status: confirmed → ongoing (Em Andamento)
```
- Na página de detalhes, clique em **"Avançar para Em Andamento"**
- O contrato está ativo

### PASSO 4: Recolher Material
```
Status: ongoing → collecting (Recolher Material)
```
- Quando o período terminar, clique em **"Avançar para Recolher Material"**
- Status muda para "Recolher Material"

### PASSO 5: Finalizar Contrato
```
Status: collecting → finished (Contrato Expirado)
```
- Clique no botão roxo **"Finalizar Contrato"**
- Complete o checklist de recolhimento (obrigatório)
- Preencha:
  - Data de devolução
  - Estado dos equipamentos
  - Avaliação do cliente (estrelas)
  - Observações da devolução
- Clique em **"Finalizar Contrato"**
- Status vira "Contrato Expirado"

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### 💰 Cálculo Automático de Diárias Extras
- Se a devolução for após a data final, o sistema calcula automaticamente
- Mostra quantos dias extras foram usados
- Calcula o valor adicional
- Exibe o total atualizado

### 📊 Resumo Financeiro Completo
Ambas as páginas mostram:
- Valor da diária
- Taxa de entrega
- Descontos
- Diárias extras (se houver)
- **Total final**

### ✅ Checklist de Recolhimento
- Lista todos os itens do aluguel
- Permite marcar cada item como recolhido
- Obrigatório para finalizar o contrato

### ⭐ Avaliação do Cliente
- Sistema de 1 a 5 estrelas
- Ajuda a manter histórico de clientes

### 📝 Registro de Estado dos Equipamentos
- Excelente
- Bom
- Regular
- Danificado

---

## 🔔 NOTIFICAÇÕES

O sistema envia notificações automáticas para:
- ✅ Pagamento confirmado
- ⏳ Aluguel aguardando pagamento
- 🏁 Contrato finalizado
- 📅 Instalação agendada

---

## 📁 ARQUIVOS CRIADOS

```
src/pages/
├── RentalPayment.tsx        ← Nova página de pagamento
└── RentalFinalization.tsx   ← Nova página de finalização

docs/
├── FLUXO_ALUGUEIS.md       ← Documentação completa
├── DIAGRAMA_VISUAL.txt     ← Diagrama do fluxo
└── GUIA_RAPIDO.md          ← Este arquivo
```

---

## 🔧 ARQUIVOS MODIFICADOS

```
src/pages/RentalDetail.tsx
- Adicionado botão "Processar Pagamento"
- Adicionado botão "Finalizar Contrato"
- Removido checklist inline

src/App.tsx
- Adicionadas rotas para as novas páginas
```

---

## 🎨 CORES DOS STATUS

| Status | Cor | Descrição |
|--------|-----|-----------|
| Pagamento Pendente | 🟡 Amarelo | Aguardando processamento |
| Aguardando Pagamento | 🟠 Laranja | Pagamento não confirmado |
| Aprovado | 🟢 Verde | Pagamento confirmado |
| Em Andamento | 🔵 Azul | Contrato ativo |
| Recolher Material | 🟣 Roxo | Período finalizado |
| Contrato Expirado | ⚫ Cinza | Finalizado |
| Cancelado | 🔴 Vermelho | Cancelado |

---

## ❓ PERGUNTAS FREQUENTES

### Como testar o fluxo completo?
1. Crie um novo aluguel
2. Processe o pagamento
3. Avance pelos status até "Recolher Material"
4. Finalize o contrato

### E se o cliente pagar depois?
Use o botão "Marcar como Aguardando Pagamento" na página de pagamento. Depois, quando o pagamento for confirmado, você pode processar novamente.

### Como calcular diárias extras?
O sistema calcula automaticamente! Basta informar a data real de devolução na página de finalização.

### Posso cancelar um aluguel?
Sim, mas essa funcionalidade já existia. Use o botão de cancelar na página de detalhes.

### O checklist é obrigatório?
Sim! Você não consegue finalizar o contrato sem completar o checklist de recolhimento.

---

## 🚨 IMPORTANTE

- ✅ Sempre complete o checklist antes de finalizar
- ✅ Verifique a data de devolução para cálculo correto
- ✅ Registre o estado dos equipamentos para histórico
- ✅ Avalie o cliente para referência futura

---

## 📞 SUPORTE

Se encontrar algum problema:
1. Verifique o console do navegador (F12)
2. Verifique se o servidor está rodando (`npm run dev`)
3. Verifique a conexão com o banco de dados

---

**Desenvolvido com ❤️ para MetalPort**
