import './validators/rules/BrazilRules.js';
import './validators/rules/PortugalRules.js';
import './validators/rules/USARules.js';

import TaxDocumentInput from './TaxDocumentInput.js';
import { ValidatorInstance } from './validators/Validator.js';

export default TaxDocumentInput;

export { TaxDocumentInput, ValidatorInstance as Validator };

export { default as DOMManager } from './managers/DOMManager.js';
export { default as FormatManager } from './managers/FormatManager.js';
export { default as CountryManager } from './managers/CountryManager.js';
export { default as ValidationManager } from './managers/ValidationManager.js';

export function initTaxInputs(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    const instances = [];
    
    elements.forEach(element => {
        instances.push(new TaxDocumentInput(element, options));
    });
    
    return instances.length === 1 ? instances[0] : instances;
}

if (typeof window !== 'undefined') {
    window.TaxDocumentInput = TaxDocumentInput;
    window.TaxDocumentValidator = ValidatorInstance;
    window.initTaxInputs = initTaxInputs;
}