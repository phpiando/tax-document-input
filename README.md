# Tax Document Input Plugin

A vanilla JavaScript plugin for automatic formatting of tax documents from different countries, similar to intl-tel-input but for documents like CPF, CNPJ, NIF, NIPC, SSN, EIN, etc.

## 🚀 Features

- **Vanilla JavaScript**: No external dependencies
- **Automatic Formatting**: Applies masks as you type
- **Smart Detection**: Automatically identifies document type based on length
- **Complete Validation**: Real validation algorithms (check digits, etc.)
- **Multi-country**: Initial support for Brazil, Portugal and United States
- **Country Selector**: Interface similar to intl-tel-input with flags
- **Visible Flag**: Displays the selected country flag next to the input
- **GeoIP Lookup**: Automatic country detection via IP (optional)
- **Complete API**: Public methods for programmatic control
- **Custom Events**: Event listeners for country changes
- **Configurable**: Options to customize behavior and appearance
- **Modular Validation System**: Rules organized by country in separate files

## 📋 Supported Documents

### Brazil 🇧🇷
- **CPF** (11 digits): `123.456.789-01`
- **CNPJ** (14 digits): `12.345.678/0001-90`

### Portugal 🇵🇹
- **NIF** (9 digits): `123 456 789`
- **NIPC** (9 digits): `123 456 789`

### United States 🇺🇸
- **SSN** (9 digits): `123-45-6789`
- **EIN** (9 digits): `12-3456789`

## 🛠️ Installation

### Via CDN
```html
<script src="https://cdn.jsdelivr.net/npm/tax-document-input@latest/dist/tax-document-input.min.js"></script>
```

### Via NPM
```bash
npm install tax-document-input
```

### Direct Download
Download the `tax-document-input.js` file and include in your project:
```html
<script src="path/to/tax-document-input.js"></script>
```

## 📖 Basic Usage

### HTML
```html
<input type="text" id="tax-document" />
```

### JavaScript
```javascript
// Basic initialization
const taxInput = new TaxDocumentInput(document.getElementById('tax-document'));

// With options
const taxInput = new TaxDocumentInput(document.getElementById('tax-document'), {
    placeholder: 'Enter your document',
    defaultCountry: 'br',
    autoGeolocate: false,
    onlyCountries: ['br', 'pt']
});
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placeholder` | string | `'Document Tax'` | Input placeholder text |
| `defaultCountry` | string | `'br'` | Default country (ISO2 code) |
| `autoGeolocate` | boolean | `false` | Enable automatic country detection via IP |
| `onlyCountries` | array | `[]` | Limit available countries (e.g. `['br', 'pt']`) |
| `geoIpLookup` | function | `null` | Custom function for IP country lookup |

### Example with all options:
```javascript
const taxInput = new TaxDocumentInput(document.getElementById('tax-document'), {
    placeholder: 'Taxpayer Number',
    defaultCountry: 'pt',
    autoGeolocate: true,
    onlyCountries: ['br', 'pt', 'us'],
    geoIpLookup: function(callback) {
        // Custom implementation
        fetch('https://your-geoip-api.com/lookup')
            .then(res => res.json())
            .then(data => callback(data.country))
            .catch(() => callback('br')); // fallback
    }
});
```

## 🌍 GeoIP Lookup

### Automatic Lookup
```javascript
// Uses ipapi.co API by default
const taxInput = new TaxDocumentInput(document.getElementById('input'), {
    autoGeolocate: true
});
```

### Custom Lookup
```javascript
// Similar to intl-tel-input
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

## 🎯 Public API

### Methods

#### `getSelectedCountry()`
Returns the selected country ISO2 code.
```javascript
const country = taxInput.getSelectedCountry(); // 'br'
```

#### `getSelectedCountryData()`
Returns complete data of the selected country.
```javascript
const countryData = taxInput.getSelectedCountryData();
// { name: 'Brasil', iso2: 'br', flag: '🇧🇷', documents: {...} }
```

#### `getCurrentDocumentType()`
Returns the current document type based on typed length.
```javascript
const docType = taxInput.getCurrentDocumentType(); // 'cpf' or 'cnpj'
```

#### `setCountry(countryCode)`
Sets the country programmatically.
```javascript
taxInput.setCountry('pt'); // Set Portugal
```

#### `getValue()`
Returns the formatted input value.
```javascript
const value = taxInput.getValue(); // '123.456.789-01'
```

#### `getCleanValue()`
Returns only numbers, without formatting.
```javascript
const cleanValue = taxInput.getCleanValue(); // '12345678901'
```

#### `isValid()`
Checks if the document is complete and valid.
```javascript
const isValid = taxInput.isValid(); // true/false
```

#### `validateDocument()`
Returns complete document validation with details.
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
Returns complete information about the current document type.
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

## 🎪 Events

### `countrychange`
Fired when the country is changed.

```javascript
document.getElementById('tax-document').addEventListener('countrychange', function(e) {
    console.log('Previous country:', e.detail.previousCountry);
    console.log('New country:', e.detail.newCountry);
    console.log('Country data:', e.detail.countryData);
});
```

### Practical example:
```javascript
const input = document.getElementById('tax-document');
const taxInput = new TaxDocumentInput(input);

// Listener for country change
input.addEventListener('countrychange', function(e) {
    console.log(`Country changed from ${e.detail.previousCountry} to ${e.detail.newCountry}`);
    
    // Clear previous validations, change labels, etc.
    updateFormLabels(e.detail.newCountry);
});

// Listener for input changes
input.addEventListener('input', function(e) {
    const docType = taxInput.getCurrentDocumentType();
    const isValid = taxInput.isValid();
    
    console.log(`Document: ${docType}, Valid: ${isValid}`);
});
```

## 🎨 CSS Customization

The plugin adds CSS classes that can be customized:

```css
/* Main container */
.tax-document-input {
    border: 2px solid #007bff;
    border-radius: 8px;
}

/* Country button */
.tax-document-input__country-button {
    background-color: #f8f9fa;
}

/* Input field */
.tax-document-input__field {
    font-size: 16px;
    padding: 12px;
}

/* Countries dropdown */
.tax-document-input__dropdown {
    border: 2px solid #007bff;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Dropdown item */
.tax-document-input__dropdown-item:hover {
    background-color: #007bff;
    color: white;
}
```

## 🔧 Advanced Usage

### Multiple instances
```javascript
// Initialize multiple inputs at once
const instances = TaxDocumentInput.init('.tax-document-input', {
    defaultCountry: 'br'
});

// Or individually
const personalDoc = new TaxDocumentInput(document.getElementById('personal-doc'), {
    onlyCountries: ['br'],
    placeholder: 'CPF'
});

const companyDoc = new TaxDocumentInput(document.getElementById('company-doc'), {
    onlyCountries: ['br'],
    placeholder: 'CNPJ'
});
```

### Form validation
```javascript
const form = document.getElementById('registration-form');
const taxInput = new TaxDocumentInput(document.getElementById('tax-document'));

form.addEventListener('submit', function(e) {
    if (!taxInput.isValid()) {
        e.preventDefault();
        alert('Invalid tax document!');
        return;
    }
    
    // Send data
    const formData = {
        document: taxInput.getCleanValue(),
        documentType: taxInput.getCurrentDocumentType(),
        country: taxInput.getSelectedCountry()
    };
    
    console.log('Data to send:', formData);
});
```

### Framework integration
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

// React (in useEffect)
useEffect(() => {
    const taxInput = new TaxDocumentInput(inputRef.current);
    
    return () => {
        taxInput.destroy();
    };
}, []);
```

## 🌍 Expanding to Other Countries

Soon, the plugin will support more countries. To contribute, create a pull request.

## 🐛 Troubleshooting

### Input is not being formatted
- Check if the plugin was initialized correctly
- Make sure the element exists in the DOM
- Check the console for JavaScript errors

### Dropdown doesn't appear
- Check for CSS conflicts with z-index
- Make sure the parent container doesn't have `overflow: hidden`

### GeoIP Lookup doesn't work
- HTTPS is recommended for external APIs
- Check if the ipapi.co API is accessible
- Configure a fallback in your custom `geoIpLookup`
- Set `autoGeolocate: false` if not needed

## 📄 License

MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📞 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/phpiando/tax-document-input/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/phpiando/tax-document-input/wiki)

## ☕ Sponsors
If you find this plugin useful, consider sponsoring its development:
- [Sponsor on GitHub](https://github.com/sponsors/phpiando)

## 📝 Changelog

### v1.0.0
- Initial release
- Support for Brazil, Portugal and United States
- Automatic formatting for CPF, CNPJ, NIF, NIPC, SSN, EIN
- Interface with country selector
- Complete API with public methods
- Custom events
- Optional geolocation