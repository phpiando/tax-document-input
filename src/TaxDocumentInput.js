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

import CountriesData from './CountriesData.js';
import CountryManager from './managers/CountryManager.js';
import DOMManager from './managers/DOMManager.js';
import FormatManager from './managers/FormatManager.js';
import ValidationManager from './managers/ValidationManager.js';
import { debug } from './utils/debug.js';

export default class TaxDocumentInput {
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