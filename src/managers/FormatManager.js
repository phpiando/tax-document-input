/**
 * FormatManager - Gerencia formatação e máscaras de documentos
 */

export default class FormatManager {
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