# Fluxo de Aluguéis - Pagamento e Finalização

## Visão Geral

Este documento descreve o fluxo completo de aluguéis, incluindo as novas funcionalidades de pagamento e finalização de contrato.

## Status do Aluguel

O sistema possui os seguintes status para um aluguel:

1. **pending** - Pagamento Pendente
2. **awaiting_payment** - Aguardando Pagamento
3. **confirmed** - Aprovado
4. **ongoing** - Em Andamento
5. **collecting** - Recolher Material
6. **finished** - Contrato Expirado
7. **cancelled** - Cancelado

## Fluxo Completo

### 1. Criação do Aluguel
- Status inicial: **pending** (Pagamento Pendente)
- O aluguel é criado com todos os detalhes: cliente, produtos, datas, valores

### 2. Processamento de Pagamento
**Página:** `/alugueis/:id/pagamento`

Quando o aluguel está com status **pending**, o botão "Processar Pagamento" aparece na página de detalhes.

**Funcionalidades:**
- Visualização do valor total a ser pago
- Seleção da forma de pagamento (PIX, Dinheiro, Cartão, Boleto, Transferência)
- Data do pagamento
- Observações sobre o pagamento
- Resumo financeiro detalhado

**Ações disponíveis:**
- **Confirmar Pagamento**: Registra o pagamento e avança o status para **confirmed** (Aprovado)
- **Marcar como Aguardando Pagamento**: Avança o status para **awaiting_payment** sem registrar pagamento

### 3. Aprovação e Início
- Status: **confirmed** → **ongoing**
- O aluguel aprovado pode ser iniciado
- Dados de instalação podem ser configurados

### 4. Em Andamento
- Status: **ongoing** → **collecting**
- O aluguel está ativo
- Sistema calcula diárias extras automaticamente se ultrapassar a data final

### 5. Recolhimento de Material
- Status: **collecting**
- Botão "Finalizar Contrato" aparece na página de detalhes

### 6. Finalização do Contrato
**Página:** `/alugueis/:id/finalizacao`

Quando o aluguel está com status **collecting**, o botão "Finalizar Contrato" aparece.

**Funcionalidades:**
- **Checklist de Recolhimento**: Verificação de todos os itens devolvidos
- **Data de Devolução**: Registro da data real de devolução
- **Estado dos Equipamentos**: Avaliação do estado (Excelente, Bom, Regular, Danificado)
- **Avaliação do Cliente**: Sistema de estrelas (1-5)
- **Observações da Devolução**: Notas sobre problemas ou condições especiais
- **Resumo Financeiro Final**: 
  - Cálculo automático de diárias extras
  - Valor total atualizado
  - Comparação com valor original

**Requisitos para finalizar:**
- Checklist de recolhimento deve estar completo
- Todos os itens devem ser verificados

**Ação:**
- **Finalizar Contrato**: Marca o aluguel como **finished** (Contrato Expirado)

## Páginas Criadas

### 1. RentalPayment.tsx
- Localização: `src/pages/RentalPayment.tsx`
- Rota: `/alugueis/:id/pagamento`
- Função: Processar pagamento do aluguel

### 2. RentalFinalization.tsx
- Localização: `src/pages/RentalFinalization.tsx`
- Rota: `/alugueis/:id/finalizacao`
- Função: Finalizar contrato e registrar devolução

## Modificações em Arquivos Existentes

### RentalDetail.tsx
**Alterações:**
- Adicionado botão "Processar Pagamento" quando status = pending
- Adicionado botão "Finalizar Contrato" quando status = collecting
- Removido checklist inline (agora está na página de finalização)
- Ajustado lógica de avanço de status

### App.tsx
**Alterações:**
- Adicionadas rotas para `/alugueis/:id/pagamento`
- Adicionadas rotas para `/alugueis/:id/finalizacao`
- Importados novos componentes

## Recursos Utilizados

### Serviços
- `rentalsService`: Gerenciamento de aluguéis
- `paymentsService`: Registro de pagamentos

### Componentes UI
- Card, Button, Input, Label, Select, Textarea
- Dialog para modais
- StatusBadge para exibição de status

### Contextos
- NotificationsContext: Notificações do sistema
- AuthContext: Autenticação e permissões

## Fluxo Visual

```
[Criar Aluguel]
      ↓
[pending - Pagamento Pendente]
      ↓
[Processar Pagamento] ← Nova Página
      ↓
[confirmed - Aprovado]
      ↓
[ongoing - Em Andamento]
      ↓
[collecting - Recolher Material]
      ↓
[Finalizar Contrato] ← Nova Página
      ↓
[finished - Contrato Expirado]
```

## Funcionalidades Especiais

### Cálculo de Diárias Extras
O sistema calcula automaticamente:
- Diárias planejadas vs diárias efetivas
- Dias extras além do período contratado
- Valor adicional por dias extras
- Valor total atualizado

### Registro de Pagamentos
Cada pagamento é registrado na tabela `payments` com:
- ID do aluguel
- Data de vencimento
- Data de pagamento
- Valor
- Método de pagamento
- Status
- Observações

### Avaliação e Feedback
- Sistema de avaliação por estrelas
- Registro do estado dos equipamentos
- Observações sobre a devolução
- Histórico completo do aluguel

## Como Usar

### Para Processar Pagamento:
1. Acesse a lista de aluguéis
2. Clique em "Ver Detalhes" em um aluguel pendente
3. Clique em "Processar Pagamento"
4. Preencha os dados do pagamento
5. Escolha "Confirmar Pagamento" ou "Marcar como Aguardando Pagamento"

### Para Finalizar Contrato:
1. Acesse a lista de aluguéis
2. Clique em "Ver Detalhes" em um aluguel em recolhimento
3. Clique em "Finalizar Contrato"
4. Complete o checklist de recolhimento
5. Preencha os dados da devolução
6. Avalie o cliente e o estado dos equipamentos
7. Clique em "Finalizar Contrato"

## Notificações

O sistema envia notificações automáticas para:
- Pagamento confirmado
- Aluguel aguardando pagamento
- Contrato finalizado
- Instalação agendada

## Próximos Passos Sugeridos

1. Implementar relatórios de pagamentos
2. Adicionar histórico de pagamentos na página de detalhes
3. Criar dashboard de contratos finalizados
4. Implementar sistema de multas por atraso
5. Adicionar geração de recibo de pagamento em PDF
6. Implementar notificações por email/SMS
