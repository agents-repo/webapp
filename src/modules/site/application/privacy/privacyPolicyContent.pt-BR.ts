import type { PrivacyPolicyContent } from './privacyPolicyContent.types.ts'
import { privacyPolicyLastUpdated } from './privacyPolicyContent.en.ts'

export const privacyPolicyContentPtBr: PrivacyPolicyContent = {
  pageTitle: 'Política de privacidade',
  languageLinkLabel: 'English version',
  languageLinkPath: '/privacy',
  lastUpdatedLabel: 'Última atualização',
  lastUpdated: privacyPolicyLastUpdated,
  contactLinkLabel: 'Contato',
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
        'Esta política de privacidade explica como o Agents Repo (agents-repo.org) coleta, usa e protege informações quando você utiliza nossa aplicação web.',
        'Este aviso se aplica a visitantes da União Europeia, Reino Unido, Estados Unidos, Brasil e outras regiões.',
      ],
    },
    {
      id: 'data-we-collect',
      title: 'Dados que coletamos',
      paragraphs: [
        'Coletamos intencionalmente poucos dados pessoais. Dependendo das suas escolhas, podemos processar:',
      ],
      listItems: [
        'Dados de analytics (somente se você aceitar cookies de analytics) por meio do Google Tag Manager e tags relacionadas do Google Analytics.',
        'Preferências locais do navegador, como tema e substituições opcionais da fonte do registry que você configurar.',
        'Sua escolha de consentimento de analytics armazenada localmente para lembrarmos sua preferência.',
        'Informações técnicas processadas por serviços de terceiros que linkamos (por exemplo GitHub ou hosts do registry) quando você opta por visitá-los.',
      ],
    },
    {
      id: 'how-we-use-data',
      title: 'Como usamos os dados',
      listItems: [
        'Operar o site, incluindo navegação no catálogo, busca, downloads e instalação PWA opcional.',
        'Lembrar seu tema e configurações do registry.',
        'Medir o uso agregado do site quando você aceita cookies de analytics.',
        'Responder a solicitações de contato e privacidade que você nos enviar.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies e tecnologias semelhantes',
      paragraphs: [
        'Usamos armazenamento local do navegador para preferências e consentimento. Tags de analytics são carregadas somente após você aceitar analytics no banner de cookies.',
      ],
      cookieRows: [
        {
          name: 'analytics-consent',
          purpose: 'Armazena sua decisão de consentimento de analytics (aceito ou rejeitado).',
          storage: 'localStorage',
          duration: 'Até você limpar os dados do site ou alterar preferências.',
          consentRequired: 'Não (necessário para lembrar sua escolha).',
        },
        {
          name: 'theme',
          purpose: 'Armazena sua preferência de tema claro, escuro ou automático.',
          storage: 'localStorage',
          duration: 'Até você limpar os dados do site.',
          consentRequired: 'Não (preferência).',
        },
        {
          name: 'registry.source.baseUrlOverride',
          purpose: 'URL base opcional do registry configurada em Website settings.',
          storage: 'localStorage',
          duration: 'Até você limpar os dados do site ou redefinir configurações.',
          consentRequired: 'Não (funcionalidade solicitada pelo usuário).',
        },
        {
          name: 'registry.source.githubRepositoryUrlOverride',
          purpose: 'URL opcional do repositório GitHub do registry configurada em Website settings.',
          storage: 'localStorage',
          duration: 'Até você limpar os dados do site ou redefinir configurações.',
          consentRequired: 'Não (funcionalidade solicitada pelo usuário).',
        },
        {
          name: 'Google Tag Manager / Google Analytics',
          purpose: 'Analytics agregado de uso quando você aceita cookies de analytics.',
          storage: 'Cookies e tecnologias semelhantes definidos pelo Google',
          duration: 'Conforme políticas do Google; veja a documentação de privacidade do Google.',
          consentRequired: 'Sim.',
        },
      ],
    },
    {
      id: 'third-parties',
      title: 'Terceiros',
      paragraphs: [
        'Usamos o Google Tag Manager para carregar tags de analytics quando você consente. O Google pode processar dados de uso conforme suas próprias políticas.',
        'Linkamos para GitHub e hosts do registry para fontes de pacotes. Esses serviços têm práticas de privacidade separadas.',
        'Consulte a Política de Privacidade do Google em https://policies.google.com/privacy para detalhes sobre o processamento pelo Google.',
      ],
    },
    {
      id: 'transfers',
      title: 'Transferências internacionais',
      paragraphs: [
        'Se você está na UE, Reino Unido ou Brasil, note que dados de analytics processados pelo Google podem ser transferidos para os Estados Unidos e outros países.',
        'Quando exigido, contamos com salvaguardas apropriadas, como cláusulas contratuais padrão ou mecanismos equivalentes oferecidos por provedores de serviço.',
      ],
    },
    {
      id: 'retention',
      title: 'Retenção',
      listItems: [
        'Valores de consentimento e preferências permanecem no seu navegador até você limpá-los ou alterar suas escolhas.',
        'A retenção de analytics segue a configuração e políticas do Google Tag Manager / Google Analytics.',
      ],
    },
    {
      id: 'your-rights',
      title: 'Seus direitos',
      paragraphs: ['Dependendo de onde você mora, pode ter alguns ou todos os seguintes direitos:'],
      listItems: [
        'UE/Reino Unido (GDPR): acesso, retificação, exclusão, restrição, portabilidade, oposição, revogar consentimento e reclamação perante autoridade supervisora.',
        'Estados Unidos (leis estaduais de privacidade): saber o que coletamos, solicitar exclusão e optar por não participar de venda/compartilhamento para publicidade comportamental entre contextos usando Rejeitar analytics ou Preferências de cookies.',
        'Brasil (LGPD): confirmação, acesso, correção, anonimização, portabilidade, exclusão, informações sobre compartilhamento, revogar consentimento e reclamação perante a ANPD.',
      ],
    },
    {
      id: 'children',
      title: 'Crianças',
      paragraphs: [
        'O Agents Repo não é direcionado a crianças menores de 16 anos (UE) ou 13 anos (EUA). Não coletamos intencionalmente informações pessoais de crianças.',
      ],
    },
    {
      id: 'do-not-sell',
      title: 'Não vendemos nem compartilhamos para venda',
      paragraphs: [
        'Não vendemos suas informações pessoais por dinheiro.',
        'Você pode optar por não participar do compartilhamento de analytics selecionando Rejeitar analytics no banner de cookies ou reabrindo Preferências de cookies no rodapé.',
      ],
    },
    {
      id: 'changes',
      title: 'Alterações nesta política',
      paragraphs: [
        'Podemos atualizar esta política periodicamente. Revisaremos a data da última atualização no topo desta página quando alterações forem publicadas.',
      ],
    },
    {
      id: 'contact',
      title: 'Contato',
      paragraphs: [
        'Para solicitações de privacidade ou dúvidas sobre esta política, entre em contato pela página de Contato.',
      ],
    },
  ],
}
