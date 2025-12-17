# 🔧 Guia: Configurar Variáveis de Ambiente no Vercel

## ❌ Erro Atual:
```
Unexpected token 'A', "An error o"... is not valid JSON
```

**Causa:** A chave de API do DeepSeek não está configurada no Vercel.

---

## ✅ Solução Passo a Passo:

### 1. Acesse o Painel do Vercel
```
https://vercel.com/dashboard
```

### 2. Selecione seu Projeto
- Clique em: **"Tradutor-de-doc-com-IA"** (ou nome que você deu)

### 3. Vá em Settings
- No menu superior, clique em: **"Settings"**

### 4. Acesse Environment Variables
- No menu lateral esquerdo, clique em: **"Environment Variables"**

### 5. Adicione a Variável
Clique em **"Add New"** e preencha:

#### Variável 1: DeepSeek
```
Name:  VITE_DEEPSEEK_API_KEY
Value: sk-c5a5a841446848dcb71e60df659c7b83
```

**Environments (marque TODOS):**
- ✅ Production
- ✅ Preview  
- ✅ Development

**Clique em:** "Save"

#### Variável 2: Gemini (opcional, para usar depois)
```
Name:  VITE_GEMINI_API_KEY
Value: sua_chave_gemini_aqui
```

#### Variável 3: OpenAI (opcional, para usar depois)
```
Name:  VITE_OPENAI_API_KEY
Value: sua_chave_openai_aqui
```

---

### 6. Faça Redeploy

**IMPORTANTE:** Adicionar variáveis NÃO faz redeploy automático!

#### Opção A: Via Interface
1. Vá em **"Deployments"** (menu superior)
2. Encontre o último deployment
3. Clique nos **3 pontinhos** (⋮)
4. Clique em **"Redeploy"**
5. Confirme: **"Redeploy"**

#### Opção B: Via Git (se preferir)
1. Faça qualquer pequena mudança no código
2. Commit e push para o GitHub
3. Vercel fará deploy automático

---

### 7. Aguarde o Deploy
- ⏱️ Tempo: ~1-2 minutos
- 🟢 Status: Aguarde ficar "Ready"

---

### 8. Teste Novamente
- Acesse seu app no Vercel
- Faça upload de um PDF
- A tradução deve funcionar! ✅

---

## 🔍 Verificar se Funcionou:

### Logs do Vercel (se ainda der erro):
1. Vá em **"Deployments"**
2. Clique no deployment atual
3. Vá em **"Functions"**
4. Clique em **"api/deepseek"**
5. Veja os logs - agora deve mostrar o erro real!

---

## ⚠️ Checklist Final:

- [ ] Variável `VITE_DEEPSEEK_API_KEY` adicionada
- [ ] Valor correto: `sk-c5a5a841446848dcb71e60df659c7b83`
- [ ] Marcado: Production, Preview, Development
- [ ] Redeploy feito
- [ ] Aguardou deploy completar (status "Ready")
- [ ] Testou novamente

---

## 🆘 Se Ainda Não Funcionar:

Verifique nos logs do Vercel qual erro específico está aparecendo:
- `401` = Chave de API inválida
- `403` = Sem permissão
- `429` = Limite de requisições excedido
- `500` = Erro no servidor da DeepSeek

**Me envie o erro específico que aparece nos logs!**
