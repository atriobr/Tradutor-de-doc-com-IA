# 🔐 Como Autenticar com GitHub

O erro 403 significa que você precisa se autenticar. Escolha uma das opções abaixo:

---

## ✅ Opção 1: GitHub CLI (Mais Fácil)

### Instalar GitHub CLI:
1. Baixe: https://cli.github.com/
2. Instale o executável
3. Reinicie o terminal

### Autenticar:
```bash
gh auth login
```

Siga as instruções:
- Escolha: **GitHub.com**
- Escolha: **HTTPS**
- Autentique via navegador

### Fazer Push:
```bash
cd deploy-vercel
git push -u origin main
```

---

## ✅ Opção 2: Personal Access Token (Recomendado)

### Criar Token:
1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Nome: `Vercel Deploy`
4. Marque: ✅ **repo** (todos os sub-itens)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá uma vez!)

### Usar o Token:
```bash
cd deploy-vercel
git remote set-url origin https://SEU-TOKEN@github.com/atriobr/Tradutor-de-doc-com-IA.git
git push -u origin main
```

**Substitua `SEU-TOKEN` pelo token que você copiou!**

---

## ✅ Opção 3: SSH (Mais Seguro)

### Gerar chave SSH:
```bash
ssh-keygen -t ed25519 -C "seu-email@example.com"
```

Pressione Enter 3 vezes (aceita padrões)

### Adicionar ao GitHub:
```bash
cat ~/.ssh/id_ed25519.pub
```

1. Copie a saída
2. Vá em: https://github.com/settings/keys
3. Clique em **"New SSH key"**
4. Cole a chave
5. Salve

### Mudar para SSH:
```bash
cd deploy-vercel
git remote set-url origin git@github.com:atriobr/Tradutor-de-doc-com-IA.git
git push -u origin main
```

---

## 🚀 Depois do Push

Após o push funcionar:
1. Acesse: https://vercel.com
2. Clique em **"Add New Project"**
3. Importe: **atriobr/Tradutor-de-doc-com-IA**
4. Configure as variáveis de ambiente
5. Deploy!

---

**Qual opção você prefere?** Recomendo a **Opção 2** (Personal Access Token) por ser rápida e funcional.
