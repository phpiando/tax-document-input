/**
 * PortugalRules - Portuguese tax document validation rules
 * Provides validation algorithms for NIF and NIPC with correct check digit calculations
 * @version 1.0.0
 * @license MIT
 * @author Roni Sommerfeld
 * @module PortugalRules
 * @requires ValidatorInstance
 */

import { ValidatorInstance } from '../Validator.js';

const PortugalRules = {
    /**
     * Validates NIF (Número de Identificação Fiscal) - Individual
     * @description Validates Portuguese individual taxpayer identification number
     * @param {string} nif - NIF with numbers only
     * @returns {Object} Validation result with isValid, error and details
     * @version 1.0.0
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

        const validFirstDigits = ['1', '2', '3'];
        if (!validFirstDigits.includes(nif.charAt(0))) {
            return {
                isValid: false,
                error: 'Personal NIF must start with 1, 2 or 3',
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

        return {
            isValid: true,
            error: null,
            details: {
                formatted: `${nif.slice(0,3)} ${nif.slice(3,6)} ${nif.slice(6,9)}`,
                type: 'personal',
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
    }
};

ValidatorInstance.registerRules('pt', PortugalRules);

if (typeof window !== 'undefined' && window.TaxDocumentValidator) {
    window.TaxDocumentValidator.registerRules('pt', PortugalRules);
}

export default PortugalRules;