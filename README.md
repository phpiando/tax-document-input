# Tax Document Input Plugin

Um plugin JavaScript vanilla para formatação automática de documentos fiscais de diferentes países, similar ao intl-tel-input mas para documentos como CPF, CNPJ, NIF, NIPC, SSN, EIN, etc.

## 🚀 Características

- **JavaScript Vanilla**: Sem dependências externas
- **Formatação Automática**: Aplica máscaras conforme a digitação
- **Detecção Inteligente**: Identifica automaticamente o tipo de documento baseado no comprimento
- **Validação Completa**: Algoritmos de validação reais (dígitos verificadores, etc.)
- **Multi-país**: Suporte inicial para Brasil, Portugal e Estados Unidos
- **Seletor de País**: Interface similar ao intl-tel-input com bandeiras
- **Bandeira Visível**: Exibe a bandeira do país selecionado ao lado do input
- **GeoIP Lookup**: Detecção automática do país via IP (opcional)
- **API Completa**: Métodos públicos para controle programático
- **Eventos Customizados**: Event listeners para mudanças de país
- **Configurável**: Opções para customizar comportamento e aparência
- **Sistema de Validação Modular**: Regras organizadas por país em arquivos separados

## 📋 Documentos Suportados

### Brasil 🇧🇷
- **CPF** (11 dígitos): `123.456.789-01`
- **CNPJ** (14 dígitos): `12.345.678/0001-90`

### Portugal 🇵🇹
- **NIF** (9 dígitos): `123 456 789`
- **NIPC** (9 dígitos): `123 456 789`

### Estados Unidos 🇺🇸
- **SSN** (9 dígitos): `123-45-6789`
- **EIN** (9 dígitos): `12-3456789`

## 🛠️ Instalação

### Via CDN
```html
<script src="https://cdn.jsdelivr.net/npm/tax-document-input@latest/dist/tax-document-input.min.js"></script>
```

### Via NPM
```bash
npm install tax-document-input
```

### Download Direto
Baixe o arquivo `tax-document-input.js` e inclua em seu projeto:
```html
<script src="path/to/tax-document-input.js"></script>
```

## 📖 Uso Básico

### HTML
```html
<input type="text" id="tax-document" />
```

### JavaScript
```javascript
// Inicialização básica
const taxInput = new TaxDocumentInput(document.getElementById('tax-document'));

// Com opções
const taxInput = new TaxDocumentInput(document.getElementById('tax-document'), {
    placeholder: 'Digite seu documento',
    defaultCountry: 'br',
    autoGeolocate: false,
    onlyCountries: ['br', 'pt']
});
```

## ⚙️ Opções de Configuração

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `placeholder` | string | `'Document Tax'` | Texto do placeholder do input |
| `defaultCountry` | string | `'br'` | País padrão (ISO2 code) |
| `autoGeolocate` | boolean | `false` | Ativar detecção automática de país via IP |
| `onlyCountries` | array | `[]` | Limitar países disponíveis (ex: `['br', 'pt']`) |
| `geoIpLookup` | function | `null` | Função customizada para lookup de país via IP |

### Exemplo com todas as opções:
```javascript
const taxInput = new TaxDocumentInput(document.getElementById('tax-document'), {
    placeholder: 'Número do Contribuinte',
    defaultCountry: 'pt',
    autoGeolocate: true,
    onlyCountries: ['br', 'pt', 'us'],
    geoIpLookup: function(callback) {
        // Implementação customizada
        fetch('https://sua-api-geoip.com/lookup')
            .then(res => res.json())
            .then(data => callback(data.country))
            .catch(() => callback('br')); // fallback
    }
});
```

## 🌍 GeoIP Lookup

### Lookup Automático
```javascript
// Usa a API ipapi.co por padrão
const taxInput = new TaxDocumentInput(document.getElementById('input'), {
    autoGeolocate: true
});
```

### Lookup Customizado
```javascript
// Similar ao intl-tel-input
const taxInput = new TaxDocumentInput(document.getElementById('input'), {
    autoGeolocate: true,
    geoIpLookup: callback => {
        fetch("https://ipapi.co/json")
            .then(res => res.json())
            .then(data => callback(data.country_code))
            .catch(() => callback("br"));
    }
});
```

## 🎯 API Pública

### Métodos

#### `getSelectedCountry()`
Retorna o código ISO2 do país selecionado.
```javascript
const country = taxInput.getSelectedCountry(); // 'br'
```

#### `getSelectedCountryData()`
Retorna dados completos do país selecionado.
```javascript
const countryData = taxInput.getSelectedCountryData();
// { name: 'Brasil', iso2: 'br', flag: '🇧🇷', documents: {...} }
```

#### `getCurrentDocumentType()`
Retorna o tipo de documento atual baseado no comprimento digitado.
```javascript
const docType = taxInput.getCurrentDocumentType(); // 'cpf' ou 'cnpj'
```

#### `setCountry(countryCode)`
Define o país programaticamente.
```javascript
taxInput.setCountry('pt'); // Define Portugal
```

#### `getValue()`
Retorna o valor formatado do input.
```javascript
const value = taxInput.getValue(); // '123.456.789-01'
```

#### `getCleanValue()`
Retorna apenas os números, sem formatação.
```javascript
const cleanValue = taxInput.getCleanValue(); // '12345678901'
```

#### `isValid()`
Verifica se o documento está completo e válido.
```javascript
const isValid = taxInput.isValid(); // true/false
```

#### `validateDocument()`
Retorna validação completa do documento com detalhes.
```javascript
const validation = taxInput.validateDocument();
// {
//   isValid: true,
//   error: null,
//   documentType: 'cpf',
//   documentCategory: 'personal',
//   country: 'br',
//   details: { formatted: '123.456.789-01', type: 'personal' }
// }
```

#### `getCurrentDocumentInfo()`
Retorna informações completas sobre o tipo de documento atual.
```javascript
const info = taxInput.getCurrentDocumentInfo();
// {
//   type: 'cpf',
//   category: 'personal',
//   length: 11,
//   mask: 'XXX.XXX.XXX-XX',
//   country: 'br'
// }
```

## 🎪 Eventos

### `countrychange`
Disparado quando o país é alterado.

```javascript
document.getElementById('tax-document').addEventListener('countrychange', function(e) {
    console.log('País anterior:', e.detail.previousCountry);
    console.log('Novo país:', e.detail.newCountry);
    console.log('Dados do país:', e.detail.countryData);
});
```

### Exemplo prático:
```javascript
const input = document.getElementById('tax-document');
const taxInput = new TaxDocumentInput(input);

// Listener para mudança de país
input.addEventListener('countrychange', function(e) {
    console.log(`País alterado de ${e.detail.previousCountry} para ${e.detail.newCountry}`);
    
    // Limpar validações anteriores, alterar labels, etc.
    updateFormLabels(e.detail.newCountry);
});

// Listener para mudanças no input
input.addEventListener('input', function(e) {
    const docType = taxInput.getCurrentDocumentType();
    const isValid = taxInput.isValid();
    
    console.log(`Documento: ${docType}, Válido: ${isValid}`);
});
```

## 🎨 Personalização CSS

O plugin adiciona classes CSS que podem ser customizadas:

```css
/* Container principal */
.tax-document-input {
    border: 2px solid #007bff;
    border-radius: 8px;
}

/* Botão do país */
.tax-document-input__country-button {
    background-color: #f8f9fa;
}

/* Campo de input */
.tax-document-input__field {
    font-size: 16px;
    padding: 12px;
}

/* Bandeira visível ao lado do input */
.tax-document-input__flag-display {
    right: 12px; /* Ajustar posição */
}

.tax-document-input__flag-display .tax-document-input__flag {
    font-size: 20px; /* Tamanho da bandeira */
}

/* Dropdown de países */
.tax-document-input__dropdown {
    border: 2px solid #007bff;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Item do dropdown */
.tax-document-input__dropdown-item:hover {
    background-color: #007bff;
    color: white;
}
```

## 🔧 Uso Avançado

### Múltiplas instâncias
```javascript
// Inicializar múltiplos inputs de uma vez
const instances = TaxDocumentInput.init('.tax-document-input', {
    defaultCountry: 'br'
});

// Ou individualmente
const personalDoc = new TaxDocumentInput(document.getElementById('personal-doc'), {
    onlyCountries: ['br'],
    placeholder: 'CPF'
});

const companyDoc = new TaxDocumentInput(document.getElementById('company-doc'), {
    onlyCountries: ['br'],
    placeholder: 'CNPJ'
});
```

### Validação em formulário
```javascript
const form = document.getElementById('registration-form');
const taxInput = new TaxDocumentInput(document.getElementById('tax-document'));

form.addEventListener('submit', function(e) {
    if (!taxInput.isValid()) {
        e.preventDefault();
        alert('Documento fiscal inválido!');
        return;
    }
    
    // Enviar dados
    const formData = {
        document: taxInput.getCleanValue(),
        documentType: taxInput.getCurrentDocumentType(),
        country: taxInput.getSelectedCountry()
    };
    
    console.log('Dados para envio:', formData);
});
```

### Integração com frameworks
```javascript
// Vue.js
new Vue({
    mounted() {
        this.taxInput = new TaxDocumentInput(this.$refs.taxDocument, {
            defaultCountry: 'br'
        });
        
        this.$refs.taxDocument.addEventListener('countrychange', (e) => {
            this.selectedCountry = e.detail.newCountry;
        });
    },
    
    beforeDestroy() {
        if (this.taxInput) {
            this.taxInput.destroy();
        }
    }
});

// React (em useEffect)
useEffect(() => {
    const taxInput = new TaxDocumentInput(inputRef.current);
    
    return () => {
        taxInput.destroy();
    };
}, []);
```

## 🌍 Expandindo para Outros Países

Em breve, o plugin suportará mais países. Para contribuir crie um pull request.

## 🐛 Resolução de Problemas

### Input não está sendo formatado
- Verifique se o plugin foi inicializado corretamente
- Certifique-se de que o elemento existe no DOM
- Verifique o console para erros JavaScript

### Dropdown não aparece
- Verifique se não há conflitos de CSS com z-index
- Certifique-se de que o container pai não tem `overflow: hidden`

### GeoIP Lookup não funciona
- HTTPS é recomendado para APIs externas
- Verifique se a API ipapi.co está acessível
- Configure um fallback no seu `geoIpLookup` customizado
- Configure `autoGeolocate: false` se não for necessário

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: seu-email@exemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/phpiando/tax-document-input/issues)
- 📖 Documentação: [GitHub Wiki](https://github.com/phpiando/tax-document-input/wiki)

## 📝 Changelog

### v1.0.0
- Lançamento inicial
- Suporte para Brasil, Portugal e Estados Unidos
- Formatação automática de CPF, CNPJ, NIF, NIPC, SSN, EIN
- Interface com seletor de país
- API completa com métodos públicos
- Eventos customizados
- Geolocalização opcional