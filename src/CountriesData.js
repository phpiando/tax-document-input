export default {
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