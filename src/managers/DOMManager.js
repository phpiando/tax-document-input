import { debug } from '../utils/debug.js';

/**
 * DOMManager - Versão Robusta Anti-Conflito
 * Gerencia criação e manipulação de elementos DOM
 */

export default class DOMManager {
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

        debug('Estilos forçados aplicados:', cssText);
    }

    /**
     * Popula o dropdown com países disponíveis
     */
    populateCountries(availableCountries, onCountrySelect) {
        debug('DOMManager: populateCountries chamado com:', availableCountries);

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
                    debug('Item clicado:', countryCode);
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
        debug('Estilos CSS robustos adicionados');
    }

    /**
     * Debug completo do dropdown
     */
    debugDropdown() {
        debug('=== DEBUG DROPDOWN COMPLETO ===');
        debug('Dropdown existe:', !!this.dropdown);
        debug('Dropdown no DOM:', document.body.contains(this.dropdown));
        debug('Dropdown ID:', this.dropdown?.id);
        debug('Dropdown classes:', this.dropdown?.className);

        if (this.dropdown) {
            const computed = getComputedStyle(this.dropdown);
            const rect = this.dropdown.getBoundingClientRect();

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

            debug('Bounding rect:', rect);
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

            if (allRules.length > 0) {
                debug('Regras CSS conflitantes encontradas:', allRules);
            }
        }
    }
}