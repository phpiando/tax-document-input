/**
 * BrazilRules - Brazilian tax document validation rules
 * Provides validation algorithms for CPF and CNPJ with correct check digit calculations
 * @version 1.0.0
 * @license MIT
 * @author Roni Sommerfeld
 * @module BrazilRules
 * @requires ValidatorInstance
 */

import { ValidatorInstance } from '../Validator.js';

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

export default BrazilRules;