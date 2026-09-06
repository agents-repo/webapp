import type { PrivacyPolicyContent } from './privacyPolicyContent.types.ts'
import { privacyPolicyLastUpdated } from './privacyPolicyContent.en.ts'

export const privacyPolicyContentPtPt: PrivacyPolicyContent = {
  pageTitle: 'Política de privacidade',
  languageLinks: [
    { label: 'English', locale: 'en' },
    { label: 'Español', locale: 'es' },
    { label: 'Português (Brasil)', locale: 'pt-BR' },
  ],
  lastUpdatedLabel: 'Última atualização',
  lastUpdated: privacyPolicyLastUpdated,
  contactLinkLabel: 'Contacto',
  cookieTableHeaders: {
    name: 'Nome',
    purpose: 'Finalidade',
    storage: 'Armazenamento',
    duration: 'Duração',
    consentRequired: 'Consentimento necessário',
  },
  sections: [
    {
      id: 'introduction',
      title: 'Introdução',
      paragraphs: [
        'Esta política de privacidade explica como o Agents Repo (agents-repo.org) recolhe, utiliza e protege informações quando utiliza a nossa aplicação web.',
        'Este aviso aplica-se a visitantes da União Europeia, Reino Unido, Estados Unidos, Brasil e outras regiões.',
      ],
    },
    {
      id: 'data-we-collect',
      title: 'Dados que recolhemos',
      paragraphs: [
        'Recolhemos intencionalmente poucos dados pessoais. Consoante as suas escolhas, podemos processar:',
      ],
      listItems: [
        'Dados de analítica (apenas se aceitar cookies de analítica) através do Google Tag Manager e etiquetas relacionadas do Google Analytics.',
        'Preferências locais do navegador, como tema, estado recolhido da barra de filtros do catálogo e substituições opcionais da fonte do registo que configurar.',
        'JSON do catálogo do registo, JSON de detalhe de pacote, listas de tags e JSON/markdown de instruções de chat armazenados em IndexedDB para reutilizar payloads recentemente descarregados. Esta cache não é utilizada para analítica e não exige consentimento adicional.',
        'Documentos HTML e recursos estáticos da mesma origem armazenados pelo service worker PWA em Cache Storage para reutilizar ficheiros do site recentemente descarregados em visitas repetidas e no modo offline. Esta cache não é utilizada para analítica e não exige consentimento adicional.',
        'A sua escolha de consentimento de analítica armazenada localmente para recordarmos a sua preferência.',
        'Informações técnicas processadas por serviços de terceiros para os quais ligamos (por exemplo GitHub ou hosts do registo) quando opta por visitá-los.',
      ],
    },
    {
      id: 'how-we-use-data',
      title: 'Como utilizamos os dados',
      listItems: [
        'Operar o site, incluindo navegação no catálogo, pesquisa, descargas e instalação PWA opcional.',
        'Recordar o seu tema, a barra de filtros do catálogo e as definições do registo.',
        'Reutilizar JSON e markdown do registo recentemente obtidos do IndexedDB enquanto navega.',
        'Servir HTML atual quando está online e manter uma cópia offline curta das páginas e dos recursos estáticos no service worker.',
        'Medir a utilização agregada do site quando aceita cookies de analítica.',
        'Responder a pedidos de contacto e privacidade que nos enviar.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies e tecnologias semelhantes',
      paragraphs: [
        'Utilizamos armazenamento local do navegador para preferências e consentimento, IndexedDB para caches de JSON e markdown do registo, e Cache Storage para o service worker PWA. As etiquetas de analítica são carregadas apenas depois de aceitar analítica no banner de cookies.',
      ],
      cookieRows: [
        {
          name: 'analytics-consent',
          purpose: 'Armazena a sua decisão de consentimento de analítica (aceite ou rejeitada).',
          storage: 'localStorage',
          duration: 'Até limpar os dados do site ou alterar preferências.',
          consentRequired: 'Não (necessário para recordar a sua escolha).',
        },
        {
          name: 'theme',
          purpose: 'Armazena a sua preferência de tema claro, escuro ou automático.',
          storage: 'localStorage',
          duration: 'Até limpar os dados do site.',
          consentRequired: 'Não (preferência).',
        },
        {
          name: 'locale',
          purpose: 'Armazena o idioma do site selecionado.',
          storage: 'localStorage',
          duration: 'Até limpar os dados do site ou mudar de idioma.',
          consentRequired: 'Não (preferência).',
        },
        {
          name: 'catalog.filters.sidebarCollapsed',
          purpose: 'Armazena se a barra de filtros da listagem de pacotes está recolhida em ecrãs grandes.',
          storage: 'localStorage',
          duration: 'Até limpar os dados do site.',
          consentRequired: 'Não (preferência).',
        },
        {
          name: 'registry.source.baseUrlOverride',
          purpose: 'URL base opcional do registo configurada em Definições do site.',
          storage: 'localStorage',
          duration: 'Até limpar os dados do site ou repor definições.',
          consentRequired: 'Não (funcionalidade solicitada pelo utilizador).',
        },
        {
          name: 'registry.source.githubRepositoryUrlOverride',
          purpose: 'URL opcional do repositório GitHub do registo configurada em Definições do site.',
          storage: 'localStorage',
          duration: 'Até limpar os dados do site ou repor definições.',
          consentRequired: 'Não (funcionalidade solicitada pelo utilizador).',
        },
        {
          name: 'agents-repo-webapp-registry',
          purpose: 'Armazena no navegador JSON do catálogo, JSON de detalhe de pacote, listas de tags e JSON/markdown de instruções de chat. Descargas ZIP não são guardadas aqui. Limpar cache em Definições do site remove estes stores.',
          storage: 'IndexedDB',
          duration: 'Até o TTL expirar, utilizar Limpar cache ou limpar os dados do site. Catálogo e detalhe usam 24h; tags usam 1h; payloads de chat com versão fixa não usam o TTL curto.',
          consentRequired: 'Não (estritamente necessário para navegar no catálogo).',
        },
        {
          name: 'html-pages-cache and app-static-runtime-cache',
          purpose:
            'Cache Storage do service worker para documentos HTML (network-first, 1 dia offline) e recursos estáticos da mesma origem (até 7 dias). Descargas ZIP e JSON do registo não ficam aqui. Limpar cache em Definições do site não remove estes stores; limpe os dados do site ou cancele o registo do service worker.',
          storage: 'Cache Storage',
          duration:
            'HTML até 1 dia; recursos estáticos até 7 dias ou até um novo service worker ativar.',
          consentRequired: 'Não (estritamente necessário para operar o site e o fallback offline).',
        },
        {
          name: 'Google Tag Manager / Google Analytics',
          purpose: 'Analítica agregada de utilização quando aceita cookies de analítica.',
          storage: 'Cookies e tecnologias semelhantes definidos pelo Google',
          duration: 'Conforme políticas do Google; consulte a documentação de privacidade do Google.',
          consentRequired: 'Sim.',
        },
      ],
    },
    {
      id: 'third-parties',
      title: 'Terceiros',
      paragraphs: [
        'Utilizamos o Google Tag Manager para carregar etiquetas de analítica quando consente. O Google pode processar dados de utilização conforme as suas próprias políticas.',
        'Ligamos para GitHub e hosts do registo para fontes de pacotes. Esses serviços têm práticas de privacidade separadas.',
        'Consulte a Política de Privacidade do Google em https://policies.google.com/privacy para detalhes sobre o processamento pelo Google.',
      ],
    },
    {
      id: 'transfers',
      title: 'Transferências internacionais',
      paragraphs: [
        'Se está na UE, Reino Unido ou Brasil, note que dados de analítica processados pelo Google podem ser transferidos para os Estados Unidos e outros países.',
        'Quando exigido, contamos com salvaguardas apropriadas, como cláusulas contratuais-tipo ou mecanismos equivalentes oferecidos por fornecedores de serviço.',
      ],
    },
    {
      id: 'retention',
      title: 'Retenção',
      listItems: [
        'Valores de consentimento e preferências permanecem no seu navegador até os limpar ou alterar as suas escolhas.',
        'Caches IndexedDB do registo permanecem até expirarem, escolher Limpar cache nas definições do site ou limpar os dados do site.',
        'O Cache Storage do service worker permanece até o TTL de HTML ou de recursos expirar, um novo service worker substituir as caches, ou limpar os dados do site.',
        'A retenção de analítica segue a configuração e políticas do Google Tag Manager / Google Analytics.',
      ],
    },
    {
      id: 'your-rights',
      title: 'Os seus direitos',
      paragraphs: ['Consoante o local onde vive, pode ter alguns ou todos os seguintes direitos:'],
      listItems: [
        'UE/Reino Unido (RGPD): acesso, retificação, eliminação, limitação, portabilidade, oposição, revogar consentimento e reclamação perante autoridade de controlo.',
        'Estados Unidos (leis estaduais de privacidade): saber o que recolhemos, solicitar eliminação e optar por não participar de venda/partilha para publicidade comportamental entre contextos usando Rejeitar analítica ou Preferências de cookies.',
        'Brasil (LGPD): confirmação, acesso, correção, anonimização, portabilidade, eliminação, informações sobre partilha, revogar consentimento e reclamação perante a ANPD.',
      ],
    },
    {
      id: 'children',
      title: 'Crianças',
      paragraphs: [
        'O Agents Repo não se destina a crianças menores de 16 anos (UE) ou 13 anos (EUA). Não recolhemos intencionalmente informações pessoais de crianças.',
      ],
    },
    {
      id: 'do-not-sell',
      title: 'Não vendemos nem partilhamos para venda',
      paragraphs: [
        'Não vendemos as suas informações pessoais por dinheiro.',
        'Pode optar por não participar da partilha de analítica selecionando Rejeitar analítica no banner de cookies ou reabrindo Preferências de cookies no rodapé.',
      ],
    },
    {
      id: 'changes',
      title: 'Alterações a esta política',
      paragraphs: [
        'Podemos atualizar esta política periodicamente. Revisaremos a data da última atualização no topo desta página quando alterações forem publicadas.',
      ],
    },
    {
      id: 'contact',
      title: 'Contacto',
      paragraphs: [
        'Para pedidos de privacidade ou dúvidas sobre esta política, contacte-nos através da página de Contacto.',
      ],
    },
  ],
}
