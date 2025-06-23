/**
 * Validator - Tax document validation system
 * Manages validation rules by country and provides a unified validation interface
 * @version 1.0.0
 * @license MIT
 * @author Roni Sommerfeld
 * @module Validator
 */

export default class Validator {
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

export const ValidatorInstance = new Validator();

if (typeof window !== 'undefined') {
    window.TaxDocumentValidator = ValidatorInstance;
}