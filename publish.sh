#!/bin/bash

# =================================
# Script de Publicação Automatizada
# Tax Document Input Plugin
# =================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de utilidade
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "================================================="
echo "📦 Tax Document Input - Publicação Automatizada"
echo "================================================="
echo -e "${NC}"

# Verificar se está logado no NPM
log_info "Verificando autenticação NPM..."
if ! npm whoami > /dev/null 2>&1; then
    log_error "Você não está logado no NPM!"
    log_info "Execute: npm login"
    exit 1
fi

NPM_USER=$(npm whoami)
log_success "Logado como: $NPM_USER"

# Verificar se está na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    log_warning "Você não está na branch main/master!"
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operação cancelada."
        exit 1
    fi
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    log_warning "Há mudanças não commitadas!"
    read -p "Fazer commit automático? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Mensagem do commit: " COMMIT_MSG
        git add .
        git commit -m "$COMMIT_MSG"
        log_success "Commit realizado."
    else
        log_error "Commit suas mudanças antes de continuar."
        exit 1
    fi
fi

# Executar testes
log_info "Executando testes..."
if npm test; then
    log_success "Todos os testes passaram!"
else
    log_error "Alguns testes falharam!"
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Executar linting
log_info "Verificando código com ESLint..."
if npm run lint; then
    log_success "Código está conforme as regras!"
else
    log_warning "Há problemas de linting!"
    read -p "Tentar corrigir automaticamente? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run lint:fix
        log_success "Correções automáticas aplicadas."
    fi
fi

# Build do projeto
log_info "Executando build..."
npm run prepare
log_success "Build concluído!"

# Verificar arquivos que serão publicados
log_info "Verificando arquivos que serão publicados..."
npm pack --dry-run | head -20

# Perguntar tipo de atualização
echo ""
log_info "Que tipo de atualização você está fazendo?"
echo "1) 🐛 patch   - Correção de bugs (x.x.X)"
echo "2) ✨ minor   - Nova funcionalidade (x.X.x)"
echo "3) 💥 major   - Mudança que quebra compatibilidade (X.x.x)"
echo "4) 🎯 custom  - Versão específica"
echo ""

while true; do
    read -p "Escolha uma opção (1-4): " choice
    case $choice in
        1)
            VERSION_TYPE="patch"
            break
            ;;
        2)
            VERSION_TYPE="minor"
            break
            ;;
        3)
            VERSION_TYPE="major"
            break
            ;;
        4)
            read -p "Digite a versão (ex: 1.2.3): " CUSTOM_VERSION
            VERSION_TYPE="custom"
            break
            ;;
        *)
            log_error "Opção inválida!"
            ;;
    esac
done

# Atualizar versão
CURRENT_VERSION=$(npm version --json | jq -r '.["tax-document-input"]' 2>/dev/null || node -p "require('./package.json').version")
log_info "Versão atual: $CURRENT_VERSION"

if [ "$VERSION_TYPE" = "custom" ]; then
    NEW_VERSION=$CUSTOM_VERSION
    npm version $CUSTOM_VERSION --no-git-tag-version
else
    NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version | sed 's/v//')
fi

log_success "Nova versão: $NEW_VERSION"

# Confirmar publicação
echo ""
log_warning "Você está prestes a publicar a versão $NEW_VERSION"
read -p "Tem certeza? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Operação cancelada."
    # Reverter mudança de versão
    git checkout -- package.json
    exit 1
fi

# Commit da nova versão
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Criar tag
git tag "v$NEW_VERSION"

# Push para GitHub
log_info "Fazendo push para GitHub..."
git push origin $CURRENT_BRANCH
git push origin "v$NEW_VERSION"
log_success "Push concluído!"

# Publicar no NPM
log_info "Publicando no NPM..."

# Verificar se é uma versão beta ou rc
if [[ $NEW_VERSION == *"beta"* ]] || [[ $NEW_VERSION == *"rc"* ]] || [[ $NEW_VERSION == *"alpha"* ]]; then
    npm publish --tag beta
    log_success "Publicado como beta!"
else
    npm publish
    log_success "Publicado como latest!"
fi

# Verificar publicação
log_info "Verificando publicação..."
sleep 3
NPM_VERSION=$(npm view tax-document-input version)
if [ "$NPM_VERSION" = "$NEW_VERSION" ]; then
    log_success "Publicação confirmada! Versão $NEW_VERSION está disponível no NPM."
else
    log_error "Algo deu errado! Versão no NPM: $NPM_VERSION"
fi

# Estatísticas
echo ""
log_info "📊 Estatísticas do pacote:"
npm view tax-document-input --json | jq '{name, version, description, keywords, license, homepage}'

# URLs úteis
echo ""
log_success "🎉 Publicação concluída com sucesso!"
echo ""
echo "📦 NPM: https://www.npmjs.com/package/tax-document-input"
echo "🌐 CDN: https://cdn.jsdelivr.net/npm/tax-document-input@$NEW_VERSION/dist/tax-document-input.min.js"
echo "📖 GitHub: https://github.com/seu-usuario/tax-document-input"
echo ""

# Testar instalação
log_info "Quer testar a instalação? (criará pasta temp-test)"
read -p "Testar instalação? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    mkdir -p temp-test
    cd temp-test
    npm init -y > /dev/null 2>&1
    npm install tax-document-input
    
    if [ $? -eq 0 ]; then
        log_success "Instalação testada com sucesso!"
    else
        log_error "Erro ao testar instalação!"
    fi
    
    cd ..
    rm -rf temp-test
fi

log_success "Script concluído! 🚀"