/**
 * USARules - American tax document validation rules
 * Provides validation algorithms for SSN and EIN with correct format validation
 * @version 1.0.0
 * @license MIT
 * @author Roni Sommerfeld
 * @module USARules
 * @requires ValidatorInstance
 */

import { ValidatorInstance } from '../Validator.js';

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

export default USARules;