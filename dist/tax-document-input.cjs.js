/*!
 * Tax Document Input Plugin v2.0.0
 * Plugin JavaScript para formatação de documentos fiscais
 *
 * Copyright (c) 2025 Roni Sommerfeld
 * Released under the MIT License
 *
 * Date: 2025-07-05
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Validator - Tax document validation system
 * Manages validation rules by country and provides a unified validation interface
 * @version 1.0.0
 * @license MIT
 * @author Roni Sommerfeld
 * @module Validator
 */

class Validator {
    constructor() {
        this.rules = new Map();
        this.loadRules();
    }

    /**
     * Loads validation rules by country
     * @description Initializes the validator and prepares for rule registration
     * @private
     * @method loadRules
     * @version 1.0.0
     * @returns {void}
     */
    loadRules() {

    }

    /**
     * Registers validation rules for a country
     * @description Stores validation functions for a specific country's document types
     * @param {string} countryCode - ISO2 country code
     * @param {Object} rules - Object containing validation functions
     * @method registerRules
     * @version 1.0.0
     * @returns {void}
     */
    registerRules(countryCode, rules) {
        this.rules.set(countryCode.toLowerCase(), rules);
    }

    /**
     * Validates a tax document
     * @description Performs validation using the appropriate country-specific validator
     * @param {string} document - Document without formatting (numbers only)
     * @param {string} countryCode - ISO2 country code
     * @param {string} documentType - Document type (cpf, cnpj, nif, etc.)
     * @method validate
     * @version 1.0.0
     * @returns {Object} Validation result with isValid, error, and details
     */
    validate(document, countryCode, documentType) {
        const rules = this.rules.get(countryCode.toLowerCase());

        if (!rules) {
            return {
                isValid: false,
                error: `Regras de validação não encontradas para o país: ${countryCode}`,
                details: null
            };
        }

        const validator = rules[documentType];

        if (!validator || typeof validator !== 'function') {
            return {
                isValid: false,
                error: `Validador não encontrado para o tipo: ${documentType}`,
                details: null
            };
        }

        try {
            const result = validator(document);
            return {
                isValid: result.isValid,
                error: result.error || null,
                details: result.details || null,
                documentType: documentType,
                countryCode: countryCode
            };
        } catch (error) {
            return {
                isValid: false,
                error: `Erro durante validação: ${error.message}`,
                details: null
            };
        }
    }

    /**
     * Checks if a country has registered validation rules
     * @description Verifies if validation rules exist for the specified country
     * @param {string} countryCode - ISO2 country code
     * @method hasRules
     * @version 1.0.0
     * @returns {boolean} True if rules exist for the country
     */
    hasRules(countryCode) {
        return this.rules.has(countryCode.toLowerCase());
    }

    /**
     * Lists all countries with registered rules
     * @description Returns an array of country codes that have validation rules
     * @method getAvailableCountries
     * @version 1.0.0
     * @returns {Array} Array of country codes
     */
    getAvailableCountries() {
        return Array.from(this.rules.keys());
    }

    /**
     * Gets supported document types for a country
     * @description Returns the document types that can be validated for a specific country
     * @param {string} countryCode - ISO2 country code
     * @method getSupportedDocuments
     * @version 1.0.0
     * @returns {Array} Array of document type strings
     */
    getSupportedDocuments(countryCode) {
        const rules = this.rules.get(countryCode.toLowerCase());
        return rules ? Object.keys(rules) : [];
    }
}

const ValidatorInstance = new Validator();

if (typeof window !== 'undefined') {
    window.TaxDocumentValidator = ValidatorInstance;
}

/**
 * BrazilRules - Brazilian tax document validation rules
 * Provides validation algorithms for CPF and CNPJ with correct check digit calculations
 * @version 1.0.0
 * @license MIT
 * @author Roni Sommerfeld
 * @module BrazilRules
 * @requires ValidatorInstance
 */


const BrazilRules = {
    /**
     * Validates CPF (Cadastro de Pessoas Físicas)
     * @description Validates Brazilian individual taxpayer registry using correct algorithm
     * @param {string} cpf - CPF with numbers only
     * @returns {Object} Validation result with isValid, error and details
     * @version 1.0.0
     */
    cpf: function(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) {
            return {
                isValid: false,
                error: 'CPF deve conter exatamente 11 dígitos',
                details: { length: cpf.length, expected: 11 }
            };
        }

        if (/^(\d)\1{10}$/.test(cpf)) {
            return {
                isValid: false,
                error: 'CPF não pode ter todos os dígitos iguais',
                details: { pattern: 'repeated_digits' }
            };
        }

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }

        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;

        if (digit1 !== parseInt(cpf.charAt(9))) {
            return {
                isValid: false,
                error: 'Primeiro dígito verificador inválido',
                details: {
                    calculated: digit1,
                    provided: parseInt(cpf.charAt(9)),
                    sum: sum,
                    remainder: remainder
                }
            };
        }

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }

        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;

        if (digit2 !== parseInt(cpf.charAt(10))) {
            return {
                isValid: false,
                error: 'Segundo dígito verificador inválido',
                details: {
                    calculated: digit2,
                    provided: parseInt(cpf.charAt(10)),
                    sum: sum,
                    remainder: remainder
                }
            };
        }

        return {
            isValid: true,
            error: null,
            details: {
                formatted: `${cpf.slice(0,3)}.${cpf.slice(3,6)}.${cpf.slice(6,9)}-${cpf.slice(9,11)}`,
                type: 'personal',
                country: 'BR'
            }
        };
    },

    /**
     * Validates CNPJ (Cadastro Nacional da Pessoa Jurídica)
     * @description Validates Brazilian company taxpayer registry using correct algorithm
     * @param {string} cnpj - CNPJ with numbers only
     * @returns {Object} Validation result with isValid, error and details
     * @version 1.0.0
     */
    cnpj: function(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        
        if (cnpj.length !== 14) {
            return {
                isValid: false,
                error: 'CNPJ deve conter exatamente 14 dígitos',
                details: { length: cnpj.length, expected: 14 }
            };
        }

        if (/^(\d)\1{13}$/.test(cnpj)) {
            return {
                isValid: false,
                error: 'CNPJ não pode ter todos os dígitos iguais',
                details: { pattern: 'repeated_digits' }
            };
        }

        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cnpj.charAt(i)) * weights1[i];
        }

        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;

        if (digit1 !== parseInt(cnpj.charAt(12))) {
            return {
                isValid: false,
                error: 'Primeiro dígito verificador inválido',
                details: {
                    calculated: digit1,
                    provided: parseInt(cnpj.charAt(12)),
                    sum: sum,
                    remainder: remainder
                }
            };
        }

        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cnpj.charAt(i)) * weights2[i];
        }

        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;

        if (digit2 !== parseInt(cnpj.charAt(13))) {
            return {
                isValid: false,
                error: 'Segundo dígito verificador inválido',
                details: {
                    calculated: digit2,
                    provided: parseInt(cnpj.charAt(13)),
                    sum: sum,
                    remainder: remainder
                }
            };
        }

        return {
            isValid: true,
            error: null,
            details: {
                formatted: `${cnpj.slice(0,2)}.${cnpj.slice(2,5)}.${cnpj.slice(5,8)}/${cnpj.slice(8,12)}-${cnpj.slice(12,14)}`,
                type: 'company',
                country: 'BR'
            }
        };
    }
};

ValidatorInstance.registerRules('br', BrazilRules);

if (typeof window !== 'undefined' && window.TaxDocumentValidator) {
    window.TaxDocumentValidator.registerRules('br', BrazilRules);
}

/**
 * PortugalRules - Portuguese tax document validation rules
 * Provides validation algorithms for NIF and NIPC with correct check digit calculations
 * @version 1.0.0
 * @license MIT
 * @author Roni Sommerfeld
 * @module PortugalRules
 * @requires ValidatorInstance
 */


const PortugalRules = {
    /**
     * Validates NIF (Número de Identificação Fiscal)
     * @description Validates Portuguese taxpayer identification number for all entity types
     * @param {string} nif - NIF with numbers only
     * @returns {Object} Validation result with isValid, error and details
     * @version 1.0.1
     */
    nif: function(nif) {
        nif = nif.replace(/\D/g, '');
        
        if (nif.length !== 9) {
            return {
                isValid: false,
                error: 'NIF must contain exactly 9 digits',
                details: { length: nif.length, expected: 9 }
            };
        }

        if (/^(\d)\1{8}$/.test(nif)) {
            return {
                isValid: false,
                error: 'NIF cannot have all digits the same',
                details: { pattern: 'repeated_digits' }
            };
        }

        const validFirstDigits = ['1', '2', '3', '5', '6', '7', '8', '9'];
        if (!validFirstDigits.includes(nif.charAt(0))) {
            return {
                isValid: false,
                error: 'NIF must start with 1, 2, 3, 5, 6, 7, 8 or 9',
                details: { firstDigit: nif.charAt(0), validFirstDigits }
            };
        }

        const weights = [9, 8, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        
        for (let i = 0; i < 8; i++) {
            sum += parseInt(nif.charAt(i)) * weights[i];
        }
        
        const remainder = sum % 11;
        let checkDigit = 11 - remainder;
        
        if (remainder < 2) {
            checkDigit = 0;
        }

        if (checkDigit !== parseInt(nif.charAt(8))) {
            return {
                isValid: false,
                error: 'Invalid check digit',
                details: { calculated: checkDigit, provided: parseInt(nif.charAt(8)) }
            };
        }

        const entityType = this.getEntityType(nif.charAt(0));

        return {
            isValid: true,
            error: null,
            details: {
                formatted: `${nif.slice(0,3)} ${nif.slice(3,6)} ${nif.slice(6,9)}`,
                type: entityType,
                country: 'PT'
            }
        };
    },

    /**
     * Validates NIPC (Número de Identificação de Pessoa Coletiva) - Company
     * @description Validates Portuguese company taxpayer identification number
     * @param {string} nipc - NIPC with numbers only
     * @returns {Object} Validation result with isValid, error and details
     * @version 1.0.0
     */
    nipc: function(nipc) {
        nipc = nipc.replace(/\D/g, '');
        
        if (nipc.length !== 9) {
            return {
                isValid: false,
                error: 'NIPC must contain exactly 9 digits',
                details: { length: nipc.length, expected: 9 }
            };
        }

        if (/^(\d)\1{8}$/.test(nipc)) {
            return {
                isValid: false,
                error: 'NIPC cannot have all digits the same',
                details: { pattern: 'repeated_digits' }
            };
        }

        const validFirstDigits = ['5', '6', '7', '8', '9'];
        if (!validFirstDigits.includes(nipc.charAt(0))) {
            return {
                isValid: false,
                error: 'NIPC must start with 5, 6, 7, 8 or 9',
                details: { firstDigit: nipc.charAt(0), validFirstDigits }
            };
        }

        const weights = [9, 8, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        
        for (let i = 0; i < 8; i++) {
            sum += parseInt(nipc.charAt(i)) * weights[i];
        }
        
        const remainder = sum % 11;
        let checkDigit = 11 - remainder;
        
        if (remainder < 2) {
            checkDigit = 0;
        }

        if (checkDigit !== parseInt(nipc.charAt(8))) {
            return {
                isValid: false,
                error: 'Invalid check digit',
                details: { calculated: checkDigit, provided: parseInt(nipc.charAt(8)) }
            };
        }

        return {
            isValid: true,
            error: null,
            details: {
                formatted: `${nipc.slice(0,3)} ${nipc.slice(3,6)} ${nipc.slice(6,9)}`,
                type: 'company',
                country: 'PT'
            }
        };
    },

    /**
     * Determines entity type based on first digit
     * @description Maps first digit to entity type for Portuguese NIFs
     * @param {string} firstDigit - First digit of the NIF
     * @returns {string} Entity type description
     * @version 1.0.1
     */
    getEntityType: function(firstDigit) {
        const entityTypes = {
            '1': 'personal',
            '2': 'personal',
            '3': 'personal',
            '5': 'public_entity',
            '6': 'non_profit',
            '7': 'other_entity',
            '8': 'other_entity',
            '9': 'other_entity'
        };

        return entityTypes[firstDigit] || 'unknown';
    }
};

ValidatorInstance.registerRules('pt', PortugalRules);

if (typeof window !== 'undefined' && window.TaxDocumentValidator) {
    window.TaxDocumentValidator.registerRules('pt', PortugalRules);
}

/**
 * USARules - American tax document validation rules
 * Provides validation algorithms for SSN and EIN with correct format validation
 * @version 1.0.0
 * @license MIT
 * @author Roni Sommerfeld
 * @module USARules
 * @requires ValidatorInstance
 */


const USARules = {
    /**
     * Validates SSN (Social Security Number) - Individual
     * @description Validates American individual taxpayer identification number
     * @param {string} ssn - SSN with numbers only
     * @returns {Object} Validation result with isValid, error and details
     * @version 1.0.0
     */
    ssn: function(ssn) {
        ssn = ssn.replace(/\D/g, '');
        
        if (ssn.length !== 9) {
            return {
                isValid: false,
                error: 'SSN must contain exactly 9 digits',
                details: { length: ssn.length, expected: 9 }
            };
        }

        if (/^(\d)\1{8}$/.test(ssn)) {
            return {
                isValid: false,
                error: 'SSN cannot have all digits the same',
                details: { pattern: 'repeated_digits' }
            };
        }

        const area = ssn.slice(0, 3);
        const group = ssn.slice(3, 5);
        const serial = ssn.slice(5, 9);

        if (area === '000') {
            return {
                isValid: false,
                error: 'SSN area cannot be 000',
                details: { area, issue: 'invalid_area_000' }
            };
        }

        if (area === '666') {
            return {
                isValid: false,
                error: '',
                details: { area, issue: 'invalid_area_666' }
            };
        }

        if (area.charAt(0) === '9') {
            return {
                isValid: false,
                error: 'SSN area cannot start with 9',
                details: { area, issue: 'invalid_area_starts_with_9' }
            };
        }

        if (group === '00') {
            return {
                isValid: false,
                error: 'SSN group cannot be 00',
                details: { group, issue: 'invalid_group_00' }
            };
        }

        if (serial === '0000') {
            return {
                isValid: false,
                error: 'SSN serial number cannot be 0000',
                details: { serial, issue: 'invalid_serial_0000' }
            };
        }

        return {
            isValid: true,
            error: null,
            details: {
                formatted: `${area}-${group}-${serial}`,
                type: 'personal',
                country: 'US',
                parts: { area, group, serial }
            }
        };
    },

    /**
     * Validates EIN (Employer Identification Number) - Company
     * @description Validates American company taxpayer identification number
     * @param {string} ein - EIN with numbers only
     * @returns {Object} Validation result with isValid, error and details
     * @version 1.0.0
     */
    ein: function(ein) {
        ein = ein.replace(/\D/g, '');
        
        if (ein.length !== 9) {
            return {
                isValid: false,
                error: 'EIN must contain exactly 9 digits',
                details: { length: ein.length, expected: 9 }
            };
        }

        if (/^(\d)\1{8}$/.test(ein)) {
            return {
                isValid: false,
                error: 'EIN cannot have all digits the same',
                details: { pattern: 'repeated_digits' }
            };
        }

        const prefix = ein.slice(0, 2);
        const suffix = ein.slice(2, 9);

        const validPrefixes = [
            '01', '02', '03', '04', '05', '06', '10', '11', '12', '13', '14', '15', '16',
            '20', '21', '22', '23', '24', '25', '26', '27',
            '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
            '40', '41', '42', '43', '44', '45', '46', '47', '48',
            '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
            '60', '61', '62', '63', '64', '65', '66', '67', '68',
            '71', '72', '73', '74', '75', '76', '77',
            '80', '81', '82', '83', '84', '85', '86', '87', '88',
            '90', '91', '92', '93', '94', '95', '96', '98', '99'
        ];

        if (!validPrefixes.includes(prefix)) {
            return {
                isValid: false,
                error: 'Invalid EIN prefix',
                details: { prefix, issue: 'invalid_prefix' }
            };
        }

        if (suffix === '0000000') {
            return {
                isValid: false,
                error: 'EIN suffix cannot be 0000000',
                details: { suffix, issue: 'invalid_suffix_all_zeros' }
            };
        }

        return {
            isValid: true,
            error: null,
            details: {
                formatted: `${prefix}-${suffix}`,
                type: 'company',
                country: 'US',
                parts: { prefix, suffix }
            }
        };
    }
};

ValidatorInstance.registerRules('us', USARules);

if (typeof window !== 'undefined' && window.TaxDocumentValidator) {
    window.TaxDocumentValidator.registerRules('us', USARules);
}

var CountriesData = {
  br: {
    name: 'Brasil',
    iso2: 'br',
    flag: 'https://flagcdn.com/w20/br.png',
    documents: {
      cpf: {
        length: 11,
        mask: 'XXX.XXX.XXX-XX',
        type: 'personal',
        priority: 1
      },
      cnpj: {
        length: 14,
        mask: 'XX.XXX.XXX/XXXX-XX',
        type: 'company',
        priority: 2
      }
    }
  },
  pt: {
    name: 'Portugal',
    iso2: 'pt',
    flag: 'https://flagcdn.com/w20/pt.png',
    documents: {
      nif: {
        length: 9,
        mask: 'XXX XXX XXX',
        type: 'personal',
        priority: 1
      },
      nipc: {
        length: 9,
        mask: 'XXX XXX XXX',
        type: 'company',
        priority: 2
      }
    }
  },
  us: {
    name: 'United States',
    iso2: 'us',
    flag: 'https://flagcdn.com/w20/us.png',
    documents: {
      ssn: {
        length: 9,
        mask: 'XXX-XX-XXXX',
        type: 'personal',
        priority: 1
      },
      ein: {
        length: 9,
        mask: 'XX-XXXXXXX',
        type: 'company',
        priority: 2
      }
    }
  }
};

const debug = (...args) => {
    // console.log(...args);
};

/**
 * CountryManager - Versão Robusta Anti-Conflito
 * Gerencia seleção de países e dropdown
 */

class CountryManager {
    constructor(countries, onlyCountries = []) {
        this.countries = countries;
        this.onlyCountries = onlyCountries;
        this.selectedCountry = 'br';
        this.domManager = null;
        this.isDropdownVisible = false;
        this.debugMode = true; // Ativar debug por padrão
    }

    /**
     * Define o DOMManager para manipulação do dropdown
     */
    setDOMManager(domManager) {
        this.domManager = domManager;
    }

    /**
     * Inicializa o gerenciador de países
     */
    initialize(defaultCountry) {
        this.selectedCountry = defaultCountry;
        this.populateCountries();
        this.updateSelectedCountry();
        this.setupEventListeners();

        if (this.debugMode) {
            debug('CountryManager inicializado:', {
                defaultCountry,
                availableCountries: this.onlyCountries.length > 0 ? this.onlyCountries : Object.keys(this.countries),
                domManagerReady: !!this.domManager
            });
        }
    }

    /**
     * Popula o dropdown com países disponíveis
     */
    populateCountries() {
        const availableCountries = this.onlyCountries.length > 0 
            ? this.onlyCountries 
            : Object.keys(this.countries);

        this.domManager.populateCountries(availableCountries, (countryCode) => {
            this.selectCountry(countryCode);
        });

        // Verificação com timeout maior
        setTimeout(() => {
            const items = this.domManager.dropdown.querySelectorAll('.tax-document-input__dropdown-item');
            debug('Verificação pós-população: itens criados:', items.length);

            if (items.length === 0) {
                console.error('ERRO: Dropdown não foi populado!');
                debug('Países registrados:', Object.keys(this.countries));
                this.domManager.populateCountries(availableCountries, (countryCode) => {
                    this.selectCountry(countryCode);
                });
            }
        }, 200);
    }

    /**
     * Atualiza o país selecionado na interface
     */
    updateSelectedCountry() {
        const country = this.countries[this.selectedCountry];
        this.domManager.updateSelectedCountry(country);
    }

    /**
     * Seleciona um país
     */
    selectCountry(countryCode) {
        const previousCountry = this.selectedCountry;
        this.selectedCountry = countryCode;
        this.updateSelectedCountry();
        this.hideDropdown();

        // Notificar sobre mudança de país
        this.onCountryChange?.(countryCode, previousCountry);

        if (this.debugMode) ;
    }

    /**
     * Configura os event listeners - Versão Robusta
     */
    setupEventListeners() {
        if (!this.domManager || !this.domManager.countryButton || !this.domManager.dropdown) {
            console.error('DOMManager não está configurado corretamente');
            return;
        }

        // Toggle dropdown com debug
        this.domManager.countryButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            debug('Estado antes do toggle:', {
                isVisible: this.isDropdownVisible,
                display: this.domManager.dropdown.style.display,
                computedDisplay: getComputedStyle(this.domManager.dropdown).display
            });

            this.toggleDropdown();
        });

        // Fechar dropdown ao clicar fora - com debug
        document.addEventListener('click', (e) => {
            if (this.isDropdownVisible) {
                const isInsideWrapper = this.domManager.wrapper.contains(e.target);
                const isInsideDropdown = this.domManager.dropdown.contains(e.target);

                if (!isInsideWrapper && !isInsideDropdown) {
                    if (this.debugMode) {
                        debug('Clicou fora, fechando dropdown', {
                            target: e.target,
                            isInsideWrapper,
                            isInsideDropdown
                        });
                    }
                    this.hideDropdown();
                }
            }
        });

        // Prevenir que cliques dentro do dropdown fechem ele
        this.domManager.dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (this.debugMode) {
                debug('Clique dentro do dropdown', e.target);
            }
        });

        // Reposicionar dropdown ao redimensionar ou scroll
        const repositionHandler = () => {
            if (this.isDropdownVisible) {
                this.positionDropdown();
            }
        };

        window.addEventListener('resize', repositionHandler);
        window.addEventListener('scroll', repositionHandler, true);

        // Fechar dropdown com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isDropdownVisible) {
                this.hideDropdown();
            }
        });

        if (this.debugMode) ;
    }

    /**
     * Alterna a exibição do dropdown
     */
    toggleDropdown() {
        if (!this.domManager || !this.domManager.dropdown) {
            console.error('Dropdown não encontrado');
            return;
        }

        debug('Toggle dropdown - isVisible:', this.isDropdownVisible);

        if (this.isDropdownVisible) {
            this.hideDropdown();
        } else {
            this.showDropdown();
        }
    }

    /**
     * Exibe o dropdown - Versão Robusta
     */
    showDropdown() {
        if (!this.domManager || !this.domManager.dropdown) {
            console.error('Elementos necessários não encontrados para showDropdown');
            return;
        }

        try {
            // 1. Primeiro, posicionar o dropdown
            this.positionDropdown();

            // 2. Aplicar estilos inline críticos
            this.domManager.forceShowDropdown();

            // 3. Usar atributo para CSS específico
            this.domManager.dropdown.setAttribute('data-visible', 'true');

            // 4. Forçar display via style
            this.domManager.dropdown.style.display = 'block';
            this.domManager.dropdown.style.visibility = 'visible';
            this.domManager.dropdown.style.opacity = '1';

            // 5. Forçar reflow múltiplas vezes
            this.domManager.dropdown.offsetHeight;
            this.domManager.dropdown.getBoundingClientRect();

            // 6. Atualizar estado
            this.isDropdownVisible = true;

            debug('Dropdown mostrado com sucesso');

            // 7. Debug detalhado após um frame
            requestAnimationFrame(() => {
                const rect = this.domManager.dropdown.getBoundingClientRect();
                const computed = getComputedStyle(this.domManager.dropdown);

                const debugInfo = {
                    display: computed.display,
                    position: computed.position,
                    top: computed.top,
                    left: computed.left,
                    zIndex: computed.zIndex,
                    visibility: computed.visibility,
                    opacity: computed.opacity,
                    width: rect.width,
                    height: rect.height,
                    inViewport: this.isInViewport(rect),
                    hasItems: this.domManager.dropdown.children.length,
                    styleDisplay: this.domManager.dropdown.style.display,
                    dataVisible: this.domManager.dropdown.getAttribute('data-visible')
                };

                debug('Estado final do dropdown:', debugInfo);

                // Se ainda não está visível, forçar mais
                if (computed.display === 'none' || rect.width === 0) {
                    console.warn('Dropdown ainda não visível, aplicando correção de emergência');
                    this.emergencyShowFix();
                } else {
                    // Destacar visualmente se estiver funcionando
                    this.highlightDropdown();
                }
            });

        } catch (error) {
            console.error('Erro em showDropdown:', error);
            this.emergencyShowFix();
        }
    }

    /**
     * Correção de emergência quando dropdown não aparece
     */
    emergencyShowFix() {

        const emergency = document.createElement('div');
        emergency.id = 'emergency-dropdown-' + Date.now();
        emergency.innerHTML = this.domManager.dropdown.innerHTML;

        // Estilos de emergência
        Object.assign(emergency.style, {
            position: 'fixed',
            top: '100px',
            left: '100px',
            width: '250px',
            maxHeight: '200px',
            backgroundColor: '#ffcccc',
            border: '3px solid red',
            zIndex: '2147483647',
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            overflowY: 'auto'
        });

        // Adicionar mensagem de debug
        const debugMsg = document.createElement('div');
        debugMsg.style.cssText = 'background: yellow; padding: 5px; margin-bottom: 5px; font-size: 12px;';
        debugMsg.textContent = 'DROPDOWN DE EMERGÊNCIA - Há conflito de CSS!';
        emergency.insertBefore(debugMsg, emergency.firstChild);

        document.body.appendChild(emergency);

        // Remover após 5 segundos
        setTimeout(() => {
            if (document.body.contains(emergency)) {
                document.body.removeChild(emergency);
            }
        }, 5000);
    }

    /**
     * Destaca o dropdown visualmente para confirmar que está funcionando
     */
    highlightDropdown() {
        const originalBg = this.domManager.dropdown.style.backgroundColor;
        const originalBorder = this.domManager.dropdown.style.border;

        this.domManager.dropdown.style.backgroundColor = '#ffffcc';
        this.domManager.dropdown.style.border = '3px solid green';

        setTimeout(() => {
            this.domManager.dropdown.style.backgroundColor = originalBg || 'white';
            this.domManager.dropdown.style.border = originalBorder || '1px solid #ccc';
        }, 1500);
    }

    /**
     * Esconde o dropdown
     */
    hideDropdown() {
        if (!this.domManager || !this.domManager.dropdown) return;

        this.domManager.dropdown.style.display = 'none';
        this.domManager.dropdown.removeAttribute('data-visible');
        this.isDropdownVisible = false;

        if (this.debugMode) ;
    }

    /**
     * Posiciona o dropdown corretamente - Versão Robusta
     */
    positionDropdown() {
        if (!this.domManager.countryContainer) {
            console.error('countryContainer não encontrado para posicionamento');
            return;
        }

        const buttonRect = this.domManager.countryContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        if (this.debugMode) ;

        // Posição base abaixo do botão
        let top = buttonRect.bottom + 5; // Espaço maior
        let left = buttonRect.left;
        
        // Largura do dropdown
        const dropdownWidth = Math.max(buttonRect.width, 200); // Largura mínima maior

        // Verificar se há espaço suficiente abaixo
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const dropdownHeight = Math.min(250, this.domManager.dropdown.scrollHeight || 200);
        
        if (this.debugMode) ;

        // Se não há espaço suficiente abaixo, mostrar acima
        if (spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight) {
            top = buttonRect.top - dropdownHeight - 5;
            if (this.debugMode) ;
        }
        
        // Garantir que não saia da tela horizontalmente
        if (left + dropdownWidth > viewportWidth) {
            left = viewportWidth - dropdownWidth - 20;
            if (this.debugMode) ;
        }
        if (left < 20) {
            left = 20;
        }

        // Garantir que não saia da tela verticalmente
        if (top < 20) {
            top = 20;
        }
        if (top + dropdownHeight > viewportHeight) {
            top = viewportHeight - dropdownHeight - 20;
        }

        if (this.debugMode) ;

        // Aplicar posicionamento
        Object.assign(this.domManager.dropdown.style, {
            top: `${top}px`,
            left: `${left}px`,
            width: `${dropdownWidth}px`,
            maxHeight: `${dropdownHeight}px`
        });
    }

    /**
     * Verifica se o elemento está na viewport
     */
    isInViewport(rect) {
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Debug completo do estado atual
     */
    debugCurrentState() {
        debug('Estado interno:', {
            selectedCountry: this.selectedCountry,
            isDropdownVisible: this.isDropdownVisible,
            domManagerExists: !!this.domManager,
            dropdownExists: !!this.domManager?.dropdown
        });

        if (this.domManager?.dropdown) {
            this.domManager.debugDropdown();
        }
    }

    /**
     * Executa GeoIP lookup se configurado
     */
    autoGeolocate(options) {
        if (!options.autoGeolocate) return;

        if (options.geoIpLookup && typeof options.geoIpLookup === 'function') {
            options.geoIpLookup((countryCode) => {
                if (countryCode && this.countries[countryCode.toLowerCase()]) {
                    this.selectCountry(countryCode.toLowerCase());
                }
            });
            return;
        }

        this.defaultGeoIpLookup((countryCode) => {
            if (countryCode && this.countries[countryCode.toLowerCase()]) {
                this.selectCountry(countryCode.toLowerCase());
            }
        });
    }

    /**
     * GeoIP lookup padrão
     */
    defaultGeoIpLookup(callback) {
        fetch("https://ipapi.co/json")
            .then(res => res.json())
            .then(data => {
                debug('GeoIP detected country:', data.country_code);
                callback(data.country_code);
            })
            .catch((error) => {
                callback('br');
            });
    }

    /**
     * Retorna o país selecionado
     */
    getSelectedCountry() {
        return this.selectedCountry;
    }

    /**
     * Retorna dados do país selecionado
     */
    getSelectedCountryData() {
        return this.countries[this.selectedCountry];
    }

    /**
     * Ativa/desativa modo debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * Callback para mudança de país (deve ser definido externamente)
     */
    onCountryChange = null;
}

/**
 * DOMManager - Versão Robusta Anti-Conflito
 * Gerencia criação e manipulação de elementos DOM
 */

class DOMManager {
    constructor(input, countries) {
        this.input = input;
        this.countries = countries;
        this.wrapper = null;
        this.countryContainer = null;
        this.countryButton = null;
        this.dropdown = null;
        this.uniqueId = 'tax-dropdown-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Cria a estrutura DOM do plugin
     */
    createWrapper() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'tax-document-input';

        this.input.parentNode.insertBefore(this.wrapper, this.input);
        this.wrapper.appendChild(this.input);
        this.input.className += ' tax-document-input__field';

        this.addStyles();
    }

    /**
     * Cria o seletor de país com dropdown
     */
    createCountrySelector() {
        this.countryContainer = document.createElement('div');
        this.countryContainer.className = 'tax-document-input__country';

        this.countryButton = document.createElement('button');
        this.countryButton.type = 'button';
        this.countryButton.className = 'tax-document-input__country-button';

        // Criar o dropdown com ID único para evitar conflitos
        this.dropdown = document.createElement('ul');
        this.dropdown.className = 'tax-document-input__dropdown';
        this.dropdown.id = this.uniqueId;
        this.dropdown.setAttribute('data-tax-dropdown', 'true');

        // ESTILOS INLINE CRÍTICOS para evitar conflitos de CSS
        this.applyInlineStyles();

        this.countryContainer.appendChild(this.countryButton);
        document.body.appendChild(this.dropdown);
        this.wrapper.insertBefore(this.countryContainer, this.input);

        debug('Dropdown criado com ID único:', this.uniqueId);
    }

    /**
     * Aplica estilos inline críticos que não podem ser sobrescritos
     */
    applyInlineStyles() {
        const criticalStyles = {
            position: 'fixed',
            zIndex: '2147483647', // Máximo z-index possível
            margin: '0',
            padding: '0',
            listStyle: 'none',
            display: 'none',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxHeight: '200px',
            overflowY: 'auto',
            minWidth: '150px',
            opacity: '1',
            visibility: 'visible',
            pointerEvents: 'auto',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            boxSizing: 'border-box'
        };

        Object.assign(this.dropdown.style, criticalStyles);
    }

    /**
     * Força a exibição do dropdown com estilos inline
     */
    forceShowDropdown() {
        const forceStyles = {
            display: 'block !important',
            position: 'fixed !important',
            zIndex: '2147483647 !important',
            backgroundColor: 'white !important',
            border: '2px solid #007bff !important',
            visibility: 'visible !important',
            opacity: '1 !important',
            pointerEvents: 'auto !important'
        };

        // Aplicar via cssText para garantir !important
        let cssText = '';
        Object.entries(forceStyles).forEach(([prop, value]) => {
            const cssProp = prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            cssText += `${cssProp}: ${value}; `;
        });

        this.dropdown.style.cssText += cssText;
    }

    /**
     * Popula o dropdown com países disponíveis
     */
    populateCountries(availableCountries, onCountrySelect) {

        this.dropdown.innerHTML = '';

        availableCountries.forEach(countryCode => {
            if (this.countries[countryCode]) {
                const country = this.countries[countryCode];
                debug('Criando item para país:', country.name);

                const li = document.createElement('li');
                li.className = 'tax-document-input__dropdown-item';
                li.setAttribute('data-country', countryCode);

                // Estilos inline para os itens também
                Object.assign(li.style, {
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #eee',
                    fontSize: '14px',
                    color: '#333',
                    boxSizing: 'border-box'
                });

                li.innerHTML = `
                    <img src="${country.flag}" alt="${country.name}"
                         style="width: 20px; height: 15px; object-fit: cover; border-radius: 2px;" />
                    <span style="font-size: 14px; color: #333;">${country.name}</span>
                `;

                // Event listener com prevenção de propagação
                li.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (onCountrySelect) {
                        onCountrySelect(countryCode);
                    }
                });

                // Hover effect inline
                li.addEventListener('mouseenter', () => {
                    li.style.backgroundColor = '#f5f5f5';
                });

                li.addEventListener('mouseleave', () => {
                    li.style.backgroundColor = 'white';
                });

                this.dropdown.appendChild(li);
            }
        });

        debug('Total de itens criados no dropdown:', this.dropdown.children.length);
    }

    /**
     * Atualiza a bandeira exibida no botão
     */
    updateSelectedCountry(country) {
        if (country) {
            this.countryButton.innerHTML = `
                <img src="${country.flag}" alt="${country.name}"
                     style="width: 20px; height: 15px; object-fit: cover; border-radius: 2px;" />
                <span style="font-size: 10px; color: #666;">▼</span>
            `;
        }
    }

    /**
     * Adiciona classe de estado de validação no input
     */
    setValidationState(isValid) {
        this.input.classList.remove('tax-document-input--valid', 'tax-document-input--invalid');

        if (isValid === true) {
            this.input.classList.add('tax-document-input--valid');
        } else if (isValid === false) {
            this.input.classList.add('tax-document-input--invalid');
        }
    }

    /**
     * Remove o plugin e restaura o input original
     */
    destroy() {
        // Remover dropdown do body
        if (this.dropdown && document.body.contains(this.dropdown)) {
            document.body.removeChild(this.dropdown);
        }

        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.insertBefore(this.input, this.wrapper);
            this.wrapper.remove();
        }

        this.input.className = this.input.className.replace('tax-document-input__field', '');
        this.input.classList.remove('tax-document-input--valid', 'tax-document-input--invalid');
    }

    /**
     * Adiciona os estilos CSS do plugin - Versão Robusta
     */
    addStyles() {
        if (document.getElementById('tax-document-input-styles')) return;

        const style = document.createElement('style');
        style.id = 'tax-document-input-styles';

        // CSS com especificidade alta e !important onde necessário
        style.textContent = `
            /* Reset e estilos base */
            .tax-document-input {
                width: 100% !important;
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                border: 1px solid #ccc !important;
                border-radius: 4px !important;
                background: white !important;
                font-family: Arial, sans-serif !important;
                box-sizing: border-box !important;
            }

            .tax-document-input__country {
                position: relative !important;
                display: inline-block !important;
            }

            .tax-document-input__country-button {
                background: none !important;
                border: none !important;
                padding: 8px 12px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                gap: 5px !important;
                border-right: 1px solid #eee !important;
                box-sizing: border-box !important;
                font-family: inherit !important;
                font-size: 14px !important;
            }

            .tax-document-input__country-button:hover {
                background-color: #f5f5f5 !important;
            }

            .tax-document-input__field {
                border: none !important;
                outline: none !important;
                padding: 8px 12px !important;
                font-size: 14px !important;
                flex: 1 !important;
                min-width: 200px !important;
                transition: border-color 0.2s ease !important;
                box-sizing: border-box !important;
                font-family: inherit !important;
                background: transparent !important;
            }

            .tax-document-input__field:focus {
                outline: none !important;
                box-shadow: none !important;
            }

            /* Estados de validação */
            .tax-document-input--valid {
                border-color: #28a745 !important;
                box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2) !important;
            }

            .tax-document-input--invalid {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2) !important;
            }

            /* Dropdown - Máxima especificidade */
            ul.tax-document-input__dropdown[data-tax-dropdown="true"] {
                position: fixed !important;
                background: white !important;
                border: 1px solid #ccc !important;
                border-radius: 4px !important;
                max-height: 200px !important;
                overflow-y: auto !important;
                z-index: 2147483647 !important;
                margin: 0 !important;
                padding: 0 !important;
                list-style: none !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                min-width: 150px !important;
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
                font-family: Arial, sans-serif !important;
                font-size: 14px !important;
                box-sizing: border-box !important;
                display: none !important;
            }

            /* Quando visível - usar atributo para maior especificidade */
            ul.tax-document-input__dropdown[data-tax-dropdown="true"][data-visible="true"] {
                display: block !important;
            }

            /* Items do dropdown */
            ul.tax-document-input__dropdown[data-tax-dropdown="true"] > li.tax-document-input__dropdown-item {
                padding: 8px 12px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                background: white !important;
                border-bottom: 1px solid #eee !important;
                font-size: 14px !important;
                color: #333 !important;
                box-sizing: border-box !important;
                list-style: none !important;
                margin: 0 !important;
            }

            ul.tax-document-input__dropdown[data-tax-dropdown="true"] > li.tax-document-input__dropdown-item:hover {
                background-color: #f5f5f5 !important;
            }

            ul.tax-document-input__dropdown[data-tax-dropdown="true"] > li.tax-document-input__dropdown-item:last-child {
                border-bottom: none !important;
            }

            /* Reset de possíveis conflitos */
            .tax-document-input *,
            .tax-document-input *::before,
            .tax-document-input *::after {
                box-sizing: border-box !important;
            }

            /* Sobrescrever Bootstrap, Tailwind, etc. */
            .tax-document-input .dropdown,
            .tax-document-input .dropdown-menu,
            .tax-document-input .dropdown-item {
                position: static !important;
                display: block !important;
                border: none !important;
                margin: 0 !important;
                padding: 8px 12px !important;
                background: transparent !important;
                box-shadow: none !important;
                transform: none !important;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Debug completo do dropdown
     */
    debugDropdown() {
        debug('Dropdown existe:', !!this.dropdown);
        debug('Dropdown no DOM:', document.body.contains(this.dropdown));
        debug('Dropdown ID:', this.dropdown?.id);
        debug('Dropdown classes:', this.dropdown?.className);

        if (this.dropdown) {
            const computed = getComputedStyle(this.dropdown);
            this.dropdown.getBoundingClientRect();

            debug('Computed styles:', {
                display: computed.display,
                position: computed.position,
                zIndex: computed.zIndex,
                visibility: computed.visibility,
                opacity: computed.opacity,
                top: computed.top,
                left: computed.left,
                width: computed.width,
                height: computed.height
            });
            debug('Style cssText:', this.dropdown.style.cssText);

            // Verificar conflitos
            const allRules = [];
            for (let stylesheet of document.styleSheets) {
                try {
                    for (let rule of stylesheet.cssRules || stylesheet.rules) {
                        if (rule.selectorText && rule.selectorText.includes('dropdown')) {
                            allRules.push(rule.cssText);
                        }
                    }
                } catch (e) {
                    // Ignorar erros de CORS
                }
            }

            if (allRules.length > 0) ;
        }
    }
}

/**
 * FormatManager - Gerencia formatação e máscaras de documentos
 */

class FormatManager {
    constructor(input, countries) {
        this.input = input;
        this.countries = countries;
        this.selectedCountry = 'br';
        this.currentDocument = null;
    }

    /**
     * Detecta o tipo de documento baseado no comprimento atual
     */
    detectDocumentType() {
        const value = this.input.value.replace(/\D/g, '');
        const country = this.countries[this.selectedCountry];
        
        if (!country) return;

        // Ordenar documentos por prioridade (menor primeiro)
        const documents = Object.entries(country.documents).sort((a, b) => {
            return a[1].priority - b[1].priority;
        });

        // Se o valor está vazio, usar o primeiro documento (menor prioridade)
        if (value.length === 0) {
            this.currentDocument = documents[0][0];
            return;
        }

        // Determinar qual tipo de documento baseado no comprimento atual
        for (const [docType, docConfig] of documents) {
            if (value.length <= docConfig.length) {
                this.currentDocument = docType;
                return;
            }
        }

        // Se exceder todos os comprimentos, usar o último (maior)
        this.currentDocument = documents[documents.length - 1][0];
    }

    /**
     * Retorna o comprimento máximo para o país atual
     */
    getMaxLength() {
        const country = this.countries[this.selectedCountry];
        if (!country) return 0;
        return Math.max(...Object.values(country.documents).map(doc => doc.length));
    }

    /**
     * Formata o input em tempo real
     */
    formatInput(e) {
        const input = e.target;
        const cursorPosition = input.selectionStart;
        let value = input.value.replace(/\D/g, '');
        
        const country = this.countries[this.selectedCountry];
        if (!country) return;

        // Limitar ao tamanho máximo do país
        const maxLength = this.getMaxLength();
        value = value.substring(0, maxLength);

        // Detectar tipo de documento baseado no comprimento atual
        this.detectDocumentType();

        const docConfig = country.documents[this.currentDocument];
        if (!docConfig) return;

        // Aplicar máscara
        const formatted = this.applyMask(value, docConfig.mask);
        
        // Calcular nova posição do cursor
        const newCursorPosition = this.calculateCursorPosition(
            input.value, 
            formatted, 
            cursorPosition
        );

        // Atualizar valor
        input.value = formatted;
        
        // Definir nova posição do cursor
        setTimeout(() => {
            input.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);

        // Notificar sobre mudança de formato
        this.onFormatChange?.(value, this.currentDocument);
    }

    /**
     * Aplica a máscara ao valor
     */
    applyMask(value, mask) {
        let formatted = '';
        let valueIndex = 0;

        for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
            if (mask[i] === 'X') {
                formatted += value[valueIndex];
                valueIndex++;
            } else {
                formatted += mask[i];
            }
        }

        return formatted;
    }

    /**
     * Calcula a nova posição do cursor após formatação
     */
    calculateCursorPosition(oldValue, newValue, oldCursor) {
        // Contar quantos números existem antes da posição do cursor no valor antigo
        let numbersBeforeCursor = 0;
        for (let i = 0; i < oldCursor && i < oldValue.length; i++) {
            if (/\d/.test(oldValue[i])) {
                numbersBeforeCursor++;
            }
        }

        // Encontrar a posição correspondente no novo valor
        let newCursor = 0;
        let numbersFound = 0;
        
        for (let i = 0; i < newValue.length; i++) {
            if (/\d/.test(newValue[i])) {
                numbersFound++;
                if (numbersFound > numbersBeforeCursor) {
                    break;
                }
            }
            newCursor = i + 1;
        }

        return newCursor;
    }

    /**
     * Define o país selecionado
     */
    setSelectedCountry(countryCode) {
        this.selectedCountry = countryCode;
        this.currentDocument = null;
        this.detectDocumentType();
    }

    /**
     * Retorna informações do documento atual
     */
    getCurrentDocumentInfo() {
        const country = this.countries[this.selectedCountry];
        if (!country || !this.currentDocument) return null;
        
        const docConfig = country.documents[this.currentDocument];
        return {
            type: this.currentDocument,
            category: docConfig.type,
            length: docConfig.length,
            mask: docConfig.mask,
            country: this.selectedCountry
        };
    }

    /**
     * Retorna o valor sem formatação (apenas números)
     */
    getCleanValue() {
        return this.input.value.replace(/\D/g, '');
    }

    /**
     * Retorna o valor formatado
     */
    getFormattedValue() {
        return this.input.value;
    }

    /**
     * Limpa o input
     */
    clear() {
        this.input.value = '';
        this.currentDocument = null;
        this.detectDocumentType();
    }

    /**
     * Callback para mudanças de formato (deve ser definido externamente)
     */
    onFormatChange = null;
}

/**
 * ValidationManager - Gerencia validação de documentos usando o Validator
 */


class ValidationManager {
    constructor() {
        this.validator = ValidatorInstance;
        this.lastValidationResult = null;
    }

    /**
     * Valida um documento usando o sistema de validação
     */
    validateDocument(cleanValue, country, documentType) {
        if (!country || !documentType) {
            return {
                isValid: false,
                error: 'País ou tipo de documento não definido',
                details: null
            };
        }

        // Usar o Validator para validação real
        const result = this.validator.validate(cleanValue, country, documentType);
        
        // Armazenar último resultado para consulta rápida
        this.lastValidationResult = {
            ...result,
            documentType: documentType,
            country: country
        };

        return this.lastValidationResult;
    }

    /**
     * Validação rápida apenas por comprimento (para feedback em tempo real)
     */
    validateLength(cleanValue, expectedLength) {
        if (!cleanValue || !expectedLength) return null;
        
        if (cleanValue.length === 0) return null; // Neutro
        if (cleanValue.length < expectedLength) return false; // Incompleto
        if (cleanValue.length === expectedLength) return true; // Completo (ainda precisa validação real)
        
        return false; // Muito longo
    }

    /**
     * Retorna se o documento está válido (comprimento correto + validação real)
     */
    isDocumentValid(cleanValue, country, documentType, expectedLength) {
        // Primeiro, verificar comprimento
        if (cleanValue.length !== expectedLength) {
            return false;
        }

        // Depois, validação real usando o Validator
        const result = this.validateDocument(cleanValue, country, documentType);
        return result.isValid;
    }

    /**
     * Retorna estado de validação para feedback visual
     * null = neutro, true = válido, false = inválido
     */
    getValidationState(cleanValue, country, documentType, expectedLength) {
        if (!cleanValue || cleanValue.length === 0) {
            return null; // Neutro - campo vazio
        }

        if (cleanValue.length < expectedLength) {
            return null; // Neutro - ainda digitando
        }

        if (cleanValue.length === expectedLength) {
            // Comprimento correto - validar usando Validator
            const result = this.validateDocument(cleanValue, country, documentType);
            return result.isValid;
        }

        return false; // Muito longo - inválido
    }

    /**
     * Retorna o último resultado de validação completa
     */
    getLastValidationResult() {
        return this.lastValidationResult;
    }

    /**
     * Retorna informações de erro detalhadas
     */
    getValidationError(cleanValue, country, documentType) {
        const result = this.validateDocument(cleanValue, country, documentType);
        return result.error;
    }

    /**
     * Verifica se o validador tem regras para o país especificado
     */
    hasRulesForCountry(country) {
        return this.validator.hasRules(country);
    }

    /**
     * Retorna os tipos de documentos suportados para um país
     */
    getSupportedDocuments(country) {
        return this.validator.getSupportedDocuments(country);
    }

    /**
     * Limpa o cache de validação
     */
    clearValidationCache() {
        this.lastValidationResult = null;
    }
}

/**
 * TaxDocumentInput - Plugin to handle tax document inputs
 * This plugin provides a unified interface for handling tax document inputs across multiple countries,
 * including formatting, validation, and country selection.
 * @version 1.0.0
 * @license MIT
 * @author Roni Sommerfeld
 * @module TaxDocumentInput
 * @requires CountriesData
 * @requires CountryManager
 * @requires DOMManager
 * @requires FormatManager
 */


class TaxDocumentInput {
    constructor(input, options = {}) {
        this.input = input;
        this.options = {
            placeholder: 'Document Tax',
            defaultCountry: 'br',
            autoGeolocate: false,
            onlyCountries: [],
            geoIpLookup: null,
            ...options
        };

        this.countries = CountriesData;

        this.domManager = new DOMManager(this.input, this.countries);
        this.formatManager = new FormatManager(this.input, this.countries);
        this.countryManager = new CountryManager(this.countries, this.options.onlyCountries);
        this.validationManager = new ValidationManager();

        this.isInitialized = false;
        this.init();
    }

    /**
     * Initializes the plugin
     * @description Sets up all managers, creates DOM structure and initializes event listeners
     * @private
     * @method init
     * @version 1.0.0
     * @returns {void}
     */
    init() {
        if (this.isInitialized) return;

        try {
            this.domManager.createWrapper();
            this.domManager.createCountrySelector();

            this.countryManager.setDOMManager(this.domManager);

            this.formatManager.setSelectedCountry(this.options.defaultCountry);

            this.setupCallbacks();

            this.countryManager.initialize(this.options.defaultCountry);

            this.setupEventListeners();

            this.updatePlaceholder();

            if (this.options.autoGeolocate) {
                this.countryManager.autoGeolocate(this.options);
            }

            this.isInitialized = true;
            debug('TaxDocumentInput inicializado com sucesso');

        } catch (error) {
            console.error('Erro ao inicializar TaxDocumentInput:', error);
        }
    }

    /**
     * Sets up callbacks for plugin events
     * @description Configures communication between managers through callback functions
     * @private
     * @method setupCallbacks
     * @version 1.0.0
     * @returns {void}
     */
    setupCallbacks() {
        this.countryManager.onCountryChange = (newCountry, previousCountry) => {
            this.formatManager.setSelectedCountry(newCountry);
            this.formatManager.clear();
            this.validationManager.clearValidationCache();
            this.domManager.setValidationState(null);

            const event = new CustomEvent('countrychange', {
                detail: {
                    previousCountry,
                    newCountry,
                    countryData: this.countries[newCountry]
                }
            });
            this.input.dispatchEvent(event);
        };

        this.formatManager.onFormatChange = (cleanValue, documentType) => {
            this.updateValidationState(cleanValue, documentType);
        };
    }

    /**
     * Sets up event listeners for the input element
     * @description Configures input, focus and blur event handlers
     * @private
     * @method setupEventListeners
     * @version 1.0.0
     * @returns {void}
     */
    setupEventListeners() {
        this.input.addEventListener('input', (e) => {
            this.formatManager.formatInput(e);
        });

        this.input.addEventListener('focus', () => {
            this.input.classList.add('tax-document-input--focused');
        });

        this.input.addEventListener('blur', () => {
            this.input.classList.remove('tax-document-input--focused');
            const cleanValue = this.formatManager.getCleanValue();
            if (cleanValue.length > 0) {
                this.triggerCompleteValidation();
            }
        });
    }

    /**
     * Updates validation state as user types
     * @description Performs real-time validation and updates visual feedback
     * @private
     * @method updateValidationState
     * @version 1.0.0
     * @param {string} cleanValue - Document value without formatting
     * @param {string} documentType - Type of document being validated
     * @returns {void}
     */
    updateValidationState(cleanValue, documentType) {
        if (!documentType) return;

        const country = this.countryManager.getSelectedCountry();
        const docConfig = this.countries[country]?.documents[documentType];

        if (!docConfig) return;

        const validationState = this.validationManager.getValidationState(
            cleanValue,
            country,
            documentType,
            docConfig.length
        );

        this.domManager.setValidationState(validationState);
    }

    /**
     * Triggers complete validation
     * @description Performs full validation and dispatches validation event
     * @private
     * @method triggerCompleteValidation
     * @version 1.0.0
     * @returns {void}
     */
    triggerCompleteValidation() {
        const cleanValue = this.formatManager.getCleanValue();
        const documentType = this.formatManager.currentDocument;
        const country = this.countryManager.getSelectedCountry();

        if (cleanValue && documentType && country) {
            const validation = this.validationManager.validateDocument(
                cleanValue,
                country,
                documentType
            );

            this.domManager.setValidationState(validation.isValid);

            const event = new CustomEvent('validation', {
                detail: validation
            });
            this.input.dispatchEvent(event);
        }
    }

    /**
     * Updates the input placeholder text
     * @description Sets the placeholder based on current options
     * @private
     * @method updatePlaceholder
     * @version 1.0.0
     * @returns {void}
     */
    updatePlaceholder() {
        this.input.placeholder = this.options.placeholder;
    }

    /**
     * Gets the selected country code
     * @description Returns the ISO2 code of the currently selected country
     * @method getSelectedCountry
     * @version 1.0.0
     * @returns {string} ISO2 country code
     */
    getSelectedCountry() {
        return this.countryManager.getSelectedCountry();
    }

    /**
     * Gets complete data for the selected country
     * @description Returns full country information including name, flag, and document types
     * @method getSelectedCountryData
     * @version 1.0.0
     * @returns {Object} Complete country data object
     */
    getSelectedCountryData() {
        return this.countryManager.getSelectedCountryData();
    }

    /**
     * Gets the current document type
     * @description Returns the type of document being entered based on length
     * @method getCurrentDocumentType
     * @version 1.0.0
     * @returns {string|null} Document type (cpf, cnpj, nif, etc.) or null
     */
    getCurrentDocumentType() {
        return this.formatManager.currentDocument;
    }

    /**
     * Gets complete information about the current document
     * @description Returns detailed information about the current document type
     * @method getCurrentDocumentInfo
     * @version 1.0.0
     * @returns {Object|null} Document information object or null
     */
    getCurrentDocumentInfo() {
        return this.formatManager.getCurrentDocumentInfo();
    }

    /**
     * Sets the country programmatically
     * @description Changes the selected country if it exists in supported countries
     * @method setCountry
     * @version 1.0.0
     * @param {string} countryCode - ISO2 country code to set
     * @returns {void}
     */
    setCountry(countryCode) {
        if (this.countries[countryCode]) {
            this.countryManager.selectCountry(countryCode);
        }
    }

    /**
     * Gets the formatted input value
     * @description Returns the current input value with formatting applied
     * @method getValue
     * @version 1.0.0
     * @returns {string} Formatted value (e.g., 123.456.789-01)
     */
    getValue() {
        return this.formatManager.getFormattedValue();
    }

    /**
     * Gets the clean input value
     * @description Returns the input value with only numbers, no formatting
     * @method getCleanValue
     * @version 1.0.0
     * @returns {string} Clean value (e.g., 12345678901)
     */
    getCleanValue() {
        return this.formatManager.getCleanValue();
    }

    /**
     * Sets a value in the input programmatically
     * @description Sets the input value and triggers formatting
     * @method setValue
     * @version 1.0.0
     * @param {string} value - Value to be set
     * @returns {void}
     */
    setValue(value) {
        this.input.value = value;

        const event = new Event('input', { bubbles: true });
        this.input.dispatchEvent(event);
    }

    /**
     * Clears the input field
     * @description Resets the input value and validation state
     * @method clear
     * @version 1.0.0
     * @returns {void}
     */
    clear() {
        this.formatManager.clear();
        this.validationManager.clearValidationCache();
        this.domManager.setValidationState(null);
    }

    /**
     * Checks if the document is valid
     * @description Performs basic length validation and full document validation
     * @method isValid
     * @version 1.0.0
     * @returns {boolean} True if document is valid
     */
    isValid() {
        const cleanValue = this.getCleanValue();
        const country = this.getSelectedCountry();
        const documentType = this.getCurrentDocumentType();
        const docInfo = this.getCurrentDocumentInfo();

        if (!docInfo || !documentType || !country) return false;

        return this.validationManager.isDocumentValid(
            cleanValue,
            country,
            documentType,
            docInfo.length
        );
    }

    /**
     * Returns complete document validation
     * @description Performs comprehensive validation and returns detailed results
     * @method validateDocument
     * @version 1.0.0
     * @returns {Object} Detailed validation result
     */
    validateDocument() {
        const cleanValue = this.getCleanValue();
        const country = this.getSelectedCountry();
        const documentType = this.getCurrentDocumentType();
        const docInfo = this.getCurrentDocumentInfo();

        if (!docInfo || !documentType || !country) {
            return {
                isValid: false,
                error: 'País ou tipo de documento não definido',
                details: null,
                documentType: null,
                documentCategory: null,
                country: null
            };
        }

        if (cleanValue.length !== docInfo.length) {
            return {
                isValid: false,
                error: `Documento deve ter ${docInfo.length} dígitos`,
                details: {
                    currentLength: cleanValue.length,
                    expectedLength: docInfo.length
                },
                documentType: documentType,
                documentCategory: docInfo.category,
                country: country
            };
        }

        const validation = this.validationManager.validateDocument(cleanValue, country, documentType);

        return {
            ...validation,
            documentType: documentType,
            documentCategory: docInfo.category,
            country: country
        };
    }

    /**
     * Forces a complete revalidation
     * @description Clears validation cache and triggers new validation
     * @method revalidate
     * @version 1.0.0
     * @returns {void}
     */
    revalidate() {
        this.validationManager.clearValidationCache();
        this.triggerCompleteValidation();
    }

    /**
     * Checks if validation rules exist for current country
     * @description Verifies if the current country has validation rules registered
     * @method hasValidationRules
     * @version 1.0.0
     * @returns {boolean} True if validation rules exist
     */
    hasValidationRules() {
        const country = this.getSelectedCountry();
        return this.validationManager.hasRulesForCountry(country);
    }

    /**
     * Gets supported document types for current country
     * @description Returns array of document types supported by current country
     * @method getSupportedDocuments
     * @version 1.0.0
     * @returns {Array} Array of document type strings
     */
    getSupportedDocuments() {
        const country = this.getSelectedCountry();
        return this.validationManager.getSupportedDocuments(country);
    }

    /**
     * Enables or disables the plugin
     * @description Controls the enabled state of the input and country selector
     * @method setEnabled
     * @version 1.0.0
     * @param {boolean} enabled - True to enable, false to disable
     * @returns {void}
     */
    setEnabled(enabled) {
        this.input.disabled = !enabled;
        this.domManager.countryButton.disabled = !enabled;

        if (enabled) {
            this.input.classList.remove('tax-document-input--disabled');
        } else {
            this.input.classList.add('tax-document-input--disabled');
        }
    }

    /**
     * Checks if the plugin is enabled
     * @description Returns the current enabled state of the plugin
     * @method isEnabled
     * @version 1.0.0
     * @returns {boolean} True if enabled
     */
    isEnabled() {
        return !this.input.disabled;
    }

    /**
     * Forces focus on the input
     * @description Programmatically focuses the input element
     * @method focus
     * @version 1.0.0
     * @returns {void}
     */
    focus() {
        this.input.focus();
    }

    /**
     * Returns plugin usage statistics
     * @description Provides comprehensive information about current plugin state
     * @method getStats
     * @version 1.0.0
     * @returns {Object} Statistics object with current state information
     */
    getStats() {
        return {
            country: this.getSelectedCountry(),
            documentType: this.getCurrentDocumentType(),
            isValid: this.isValid(),
            valueLength: this.getCleanValue().length,
            hasValidationRules: this.hasValidationRules(),
            isEnabled: this.isEnabled(),
            lastValidation: this.validationManager.getLastValidationResult()
        };
    }

    /**
     * Updates plugin options
     * @description Merges new options and applies changes that affect behavior
     * @method updateOptions
     * @version 1.0.0
     * @param {Object} newOptions - New options to apply
     * @returns {void}
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };

        if (newOptions.placeholder) {
            this.updatePlaceholder();
        }

        if (newOptions.defaultCountry && this.countries[newOptions.defaultCountry]) {
            this.setCountry(newOptions.defaultCountry);
        }

        if (newOptions.onlyCountries) {
            this.countryManager.onlyCountries = newOptions.onlyCountries;
            this.countryManager.populateCountries();
        }
    }

    /**
     * Destroys the plugin and restores original input
     * @description Removes all plugin elements and event listeners, restores input to original state
     * @method destroy
     * @version 1.0.0
     * @returns {void}
     */
    destroy() {
        if (!this.isInitialized) return;

        this.input.removeEventListener('input', this.formatManager.formatInput);

        this.domManager.destroy();

        this.domManager = null;
        this.formatManager = null;
        this.countryManager = null;
        this.validationManager = null;

        this.isInitialized = false;
    }

    /**
     * Creates a plugin instance on an element
     * @description Static method to create a new plugin instance
     * @static
     * @method create
     * @version 1.0.0
     * @param {HTMLElement|string} element - Element or CSS selector
     * @param {Object} options - Configuration options
     * @returns {TaxDocumentInput} Plugin instance
     */
    static create(element, options = {}) {
        const input = typeof element === 'string'
            ? document.querySelector(element)
            : element;

        if (!input) {
            throw new Error('Elemento não encontrado');
        }

        return new TaxDocumentInput(input, options);
    }

    /**
     * Initializes the plugin on multiple elements
     * @description Static method to initialize plugin on multiple elements
     * @static
     * @method init
     * @version 1.0.0
     * @param {string} selector - CSS selector
     * @param {Object} options - Configuration options
     * @returns {Array|TaxDocumentInput} Array of instances or single instance
     */
    static init(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        const instances = [];

        elements.forEach(element => {
            instances.push(new TaxDocumentInput(element, options));
        });

        return instances.length === 1 ? instances[0] : instances;
    }

    /**
     * Returns the plugin version
     * @description Static getter for plugin version
     * @static
     * @method version
     * @version 1.0.0
     * @returns {string} Version string
     */
    static get version() {
        return '2.0.0';
    }

    /**
     * Returns supported countries
     * @description Static method that returns array of supported country codes
     * @static
     * @method getSupportedCountries
     * @version 1.0.0
     * @returns {Array} Array of country codes
     */
    static getSupportedCountries() {
        return ['br', 'pt', 'us'];
    }
}

if (typeof window !== 'undefined') {
    window.TaxDocumentInput = TaxDocumentInput;

    TaxDocumentInput.init = function(selector, options) {
        return TaxDocumentInput.init(selector, options);
    };
}

function initTaxInputs(selector, options = {}) {
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

exports.CountryManager = CountryManager;
exports.DOMManager = DOMManager;
exports.FormatManager = FormatManager;
exports.TaxDocumentInput = TaxDocumentInput;
exports.ValidationManager = ValidationManager;
exports.Validator = ValidatorInstance;
exports.default = TaxDocumentInput;
exports.initTaxInputs = initTaxInputs;
