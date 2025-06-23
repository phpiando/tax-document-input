import { debug } from '../utils/debug.js';

/**
 * CountryManager - Versão Robusta Anti-Conflito
 * Gerencia seleção de países e dropdown
 */

export default class CountryManager {
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

        debug('Populando dropdown com países:', availableCountries);

        this.domManager.populateCountries(availableCountries, (countryCode) => {
            debug('País selecionado via callback:', countryCode);
            this.selectCountry(countryCode);
        });

        // Verificação com timeout maior
        setTimeout(() => {
            const items = this.domManager.dropdown.querySelectorAll('.tax-document-input__dropdown-item');
            debug('Verificação pós-população: itens criados:', items.length);

            if (items.length === 0) {
                console.error('ERRO: Dropdown não foi populado!');
                debug('Países disponíveis:', availableCountries);
                debug('Países registrados:', Object.keys(this.countries));

                // Tentar repopular
                debug('Tentando repopular...');
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

        if (this.debugMode) {
            debug('País alterado:', { from: previousCountry, to: countryCode });
        }
    }

    /**
     * Configura os event listeners - Versão Robusta
     */
    setupEventListeners() {
        if (!this.domManager || !this.domManager.countryButton || !this.domManager.dropdown) {
            console.error('DOMManager não está configurado corretamente');
            return;
        }

        // Contador de cliques para debug
        let clickCount = 0;

        // Toggle dropdown com debug
        this.domManager.countryButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            clickCount++;
            debug(`Botão clicado (#${clickCount}), toggling dropdown`);
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
                debug('ESC pressionado, fechando dropdown');
                this.hideDropdown();
            }
        });

        if (this.debugMode) {
            debug('Event listeners configurados');
        }
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

        debug('=== SHOWING DROPDOWN - VERSÃO ROBUSTA ===');

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
        debug('=== APLICANDO CORREÇÃO DE EMERGÊNCIA ===');

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

        debug('Dropdown de emergência criado. Verifique conflitos de CSS!');
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

        debug('Hiding dropdown');

        this.domManager.dropdown.style.display = 'none';
        this.domManager.dropdown.removeAttribute('data-visible');
        this.isDropdownVisible = false;

        if (this.debugMode) {
            debug('Dropdown escondido');
        }
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
        
        if (this.debugMode) {
            debug('Posicionando dropdown. ButtonRect:', buttonRect);
            debug('Viewport:', { width: viewportWidth, height: viewportHeight });
        }

        // Posição base abaixo do botão
        let top = buttonRect.bottom + 5; // Espaço maior
        let left = buttonRect.left;
        
        // Largura do dropdown
        const dropdownWidth = Math.max(buttonRect.width, 200); // Largura mínima maior

        // Verificar se há espaço suficiente abaixo
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const dropdownHeight = Math.min(250, this.domManager.dropdown.scrollHeight || 200);
        
        if (this.debugMode) {
            debug('Espaços disponíveis:', { spaceBelow, dropdownHeight });
        }

        // Se não há espaço suficiente abaixo, mostrar acima
        if (spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight) {
            top = buttonRect.top - dropdownHeight - 5;
            if (this.debugMode) {
                debug('Mostrando dropdown acima do botão');
            }
        }
        
        // Garantir que não saia da tela horizontalmente
        if (left + dropdownWidth > viewportWidth) {
            left = viewportWidth - dropdownWidth - 20;
            if (this.debugMode) {
                debug('Ajustando posição horizontal');
            }
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
        
        const finalPosition = { top, left, width: dropdownWidth, maxHeight: dropdownHeight };

        if (this.debugMode) {
            debug('Posição final calculada:', finalPosition);
        }

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
        debug('=== DEBUG COUNTRY MANAGER ===');
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
                debug('GeoIP lookup failed:', error);
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
        debug('Debug mode:', enabled ? 'ativado' : 'desativado');
    }

    /**
     * Callback para mudança de país (deve ser definido externamente)
     */
    onCountryChange = null;
}