# 📦 Pasta de Deploy para Vercel

Esta pasta contém **apenas os arquivos necessários** para fazer deploy no Vercel.

## 📋 Arquivos Incluídos

### Configuração
- ✅ `package.json` - Dependências do projeto
- ✅ `tsconfig.json` - Configuração TypeScript
- ✅ `vite.config.ts` - Configuração Vite
- ✅ `vercel.json` - Configuração Vercel
- ✅ `.gitignore` - Arquivos ignorados
- ✅ `.env.example` - Modelo de variáveis de ambiente

### Código Fonte
- ✅ `index.html` - HTML principal
- ✅ `index.tsx` - Entry point React
- ✅ `App.tsx` - Componente principal
- ✅ `components/` - Todos os componentes React
- ✅ `utils/` - Serviços (PDF, tradução)

### Documentação
- ✅ `README.md` - Instruções do projeto

## 🚀 Como Fazer Deploy

### Opção 1: Via GitHub (Recomendado)

1. **Inicialize Git nesta pasta:**
```bash
cd deploy-vercel
git init
git add .
git commit -m "Initial commit for Vercel deploy"
```

2. **Crie repositório no GitHub:**
   - Vá em https://github.com/new
   - Nome: `tradutorpdf-pro`
   - Não marque "Add README"

3. **Envie para o GitHub:**
```bash
git remote add origin https://github.com/SEU-USUARIO/tradutorpdf-pro.git
git branch -M main
git push -u origin main
```

4. **Deploy no Vercel:**
   - Acesse https://vercel.com
   - Clique em "Add New Project"
   - Importe o repositório
   - Configure as variáveis de ambiente:
     - `VITE_GEMINI_API_KEY`
     - `VITE_OPENAI_API_KEY`
     - `VITE_DEEPSEEK_API_KEY`
   - Clique em "Deploy"

### Opção 2: Via Vercel CLI

```bash
cd deploy-vercel
npm install -g vercel
vercel
```

## ⚙️ Variáveis de Ambiente no Vercel

No painel do Vercel, adicione:

```
VITE_GEMINI_API_KEY = sua_chave_gemini
VITE_OPENAI_API_KEY = sua_chave_openai
VITE_DEEPSEEK_API_KEY = sua_chave_deepseek
```

Marque: **Production**, **Preview**, **Development**

## 📊 Tamanho da Pasta

Esta pasta contém apenas ~20 arquivos essenciais, sem:
- ❌ `node_modules/` (será instalado no Vercel)
- ❌ `dist/` (será gerado no build)
- ❌ `.env.local` (use variáveis do Vercel)
- ❌ Arquivos de teste
- ❌ Arquivos temporários

## ✅ Checklist Pré-Deploy

- [ ] Código testado localmente
- [ ] Chaves de API obtidas
- [ ] Repositório GitHub criado
- [ ] Variáveis configuradas no Vercel
- [ ] Build local funcionando (`npm run build`)

## 🔗 Links Úteis

- Vercel Dashboard: https://vercel.com/dashboard
- Documentação Vercel: https://vercel.com/docs
- Obter chave Gemini: https://ai.google.dev/
- Obter chave OpenAI: https://platform.openai.com/
- Obter chave DeepSeek: https://platform.deepseek.com/

---

**Pronto para deploy!** 🚀
