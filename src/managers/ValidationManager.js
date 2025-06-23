/**
 * ValidationManager - Gerencia validação de documentos usando o Validator
 */

import { ValidatorInstance } from '../validators/Validator.js';

export default class ValidationManager {
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