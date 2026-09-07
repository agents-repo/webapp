import type { PrivacyPolicyContent } from './privacyPolicyContent.types.ts'
import { privacyPolicyLastUpdated } from './privacyPolicyContent.en.ts'

export const privacyPolicyContentEs: PrivacyPolicyContent = {
  pageTitle: 'Política de privacidad',
  languageLinks: [
    { label: 'English', locale: 'en' },
    { label: 'Português (Brasil)', locale: 'pt-BR' },
    { label: 'Português (Portugal)', locale: 'pt-PT' },
  ],
  lastUpdatedLabel: 'Última actualización',
  lastUpdated: privacyPolicyLastUpdated,
  contactLinkLabel: 'Contacto',
  cookieTableHeaders: {
    name: 'Nombre',
    purpose: 'Finalidad',
    storage: 'Almacenamiento',
    duration: 'Duración',
    consentRequired: 'Consentimiento requerido',
  },
  sections: [
    {
      id: 'introduction',
      title: 'Introducción',
      paragraphs: [
        'Esta política de privacidad explica cómo Agents Repo (agents-repo.org) recopila, usa y protege la información cuando utilizas nuestra aplicación web.',
        'Este aviso se aplica a visitantes de la Unión Europea, el Reino Unido, Estados Unidos, Brasil y otras regiones.',
      ],
    },
    {
      id: 'data-we-collect',
      title: 'Datos que recopilamos',
      paragraphs: [
        'Recopilamos intencionalmente muy pocos datos personales. Según tus elecciones, podemos procesar:',
      ],
      listItems: [
        'Datos de analítica (solo si aceptas cookies de analítica) a través de Google Tag Manager y etiquetas relacionadas de Google Analytics.',
        'Preferencias locales del navegador, como el modo de tema, el estado contraído de la barra lateral de filtros del catálogo y las sustituciones opcionales de la fuente del registry que configures.',
        'JSON del catálogo del registry, JSON de detalle de paquete, listas de etiquetas e instrucciones de chat en JSON/markdown almacenados en IndexedDB para reutilizar cargas recientes del registry. Esta caché no se usa para analítica y no requiere consentimiento adicional.',
        'Documentos HTML y recursos estáticos del mismo origen almacenados por el service worker PWA en Cache Storage para reutilizar archivos del sitio en visitas repetidas y uso sin conexión. Esta caché no se usa para analítica y no requiere consentimiento adicional.',
        'Tu elección de consentimiento de analítica almacenada localmente para recordar tu preferencia.',
        'Información técnica procesada por servicios de terceros a los que enlazamos (por ejemplo GitHub o hosts del registry) cuando eliges visitarlos.',
      ],
    },
    {
      id: 'how-we-use-data',
      title: 'Cómo usamos los datos',
      listItems: [
        'Operar el sitio, incluida la navegación del catálogo, búsqueda, descargas e instalación PWA opcional.',
        'Recordar tu tema, la barra lateral de filtros del catálogo y la configuración del registry.',
        'Reutilizar JSON y markdown del registry obtenidos recientemente desde IndexedDB mientras navegas.',
        'Servir HTML actual cuando estás en línea y mantener una copia sin conexión breve de páginas y recursos estáticos en el service worker.',
        'Medir el uso agregado del sitio cuando aceptas cookies de analítica.',
        'Responder a solicitudes de contacto y privacidad que nos envíes.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies y tecnologías similares',
      paragraphs: [
        'Usamos almacenamiento local del navegador para preferencias y consentimiento, IndexedDB para cachés de JSON y markdown del registry, y Cache Storage para el service worker PWA. Las etiquetas de analítica se cargan solo después de que aceptas la analítica en el banner de cookies.',
      ],
      cookieRows: [
        {
          name: 'analytics-consent',
          purpose: 'Almacena tu decisión de consentimiento de analítica (aceptada o rechazada).',
          storage: 'localStorage',
          duration: 'Hasta que borres los datos del sitio o cambies las preferencias.',
          consentRequired: 'No (necesario para recordar tu elección).',
        },
        {
          name: 'theme',
          purpose: 'Almacena tu preferencia de tema claro, oscuro o automático.',
          storage: 'localStorage',
          duration: 'Hasta que borres los datos del sitio.',
          consentRequired: 'No (preferencia).',
        },
        {
          name: 'locale',
          purpose: 'Almacena el idioma del sitio seleccionado.',
          storage: 'localStorage',
          duration: 'Hasta que borres los datos del sitio o cambies de idioma.',
          consentRequired: 'No (preferencia).',
        },
        {
          name: 'catalog.filters.sidebarCollapsed',
          purpose: 'Almacena si la barra lateral de filtros del listado de paquetes está contraída en pantallas grandes.',
          storage: 'localStorage',
          duration: 'Hasta que borres los datos del sitio.',
          consentRequired: 'No (preferencia).',
        },
        {
          name: 'registry.source.baseUrlOverride',
          purpose: 'URL base opcional del registry configurada en Website settings.',
          storage: 'localStorage',
          duration: 'Hasta que borres los datos del sitio o restablezcas la configuración.',
          consentRequired: 'No (funcionalidad solicitada por el usuario).',
        },
        {
          name: 'registry.source.githubRepositoryUrlOverride',
          purpose: 'URL opcional del repositorio GitHub del registry configurada en Website settings.',
          storage: 'localStorage',
          duration: 'Hasta que borres los datos del sitio o restablezcas la configuración.',
          consentRequired: 'No (funcionalidad solicitada por el usuario).',
        },
        {
          name: 'agents-repo-webapp-registry',
          purpose: 'Almacena en el navegador JSON del catálogo, JSON de detalle de paquete, listas de etiquetas e instrucciones de chat en JSON/markdown. Las descargas ZIP no se guardan aquí. Limpiar caché en Website settings elimina estos almacenes.',
          storage: 'IndexedDB',
          duration: 'Hasta que expire el TTL, uses Limpiar caché o borres los datos del sitio. Catálogo y detalle usan 24 h; etiquetas usan 1 h; cargas de chat con versión fija omiten el TTL corto.',
          consentRequired: 'No (estrictamente necesario para navegar el catálogo).',
        },
        {
          name: 'html-pages-cache and app-static-runtime-cache',
          purpose:
            'Cache Storage del service worker para documentos HTML (network-first, 1 día sin conexión) y recursos estáticos del mismo origen (hasta 7 días). Las descargas ZIP y el JSON del registry no se guardan aquí. Limpiar caché en Website settings no elimina estos almacenes; borra los datos del sitio o anula el registro del service worker.',
          storage: 'Cache Storage',
          duration:
            'HTML hasta 1 día; recursos estáticos hasta 7 días o hasta que se active un nuevo service worker.',
          consentRequired: 'No (estrictamente necesario para operar el sitio y el respaldo sin conexión).',
        },
        {
          name: 'Google Tag Manager / Google Analytics',
          purpose: 'Analítica de uso agregada cuando aceptas cookies de analítica.',
          storage: 'Cookies y tecnologías similares definidas por Google',
          duration: 'Según las políticas de Google; consulta la documentación de privacidad de Google.',
          consentRequired: 'Sí.',
        },
      ],
    },
    {
      id: 'third-parties',
      title: 'Terceros',
      paragraphs: [
        'Usamos Google Tag Manager para cargar etiquetas de analítica cuando das tu consentimiento. Google puede procesar datos de uso según sus propias políticas.',
        'Enlazamos a GitHub y hosts del registry para fuentes de paquetes. Esos servicios tienen prácticas de privacidad separadas.',
        'Consulta la Política de Privacidad de Google en https://policies.google.com/privacy para detalles sobre el procesamiento de Google.',
      ],
    },
    {
      id: 'transfers',
      title: 'Transferencias internacionales',
      paragraphs: [
        'Si estás en la UE, el Reino Unido o Brasil, ten en cuenta que los datos de analítica procesados por Google pueden transferirse a Estados Unidos y otros países.',
        'Cuando sea necesario, confiamos en salvaguardas apropiadas, como cláusulas contractuales estándar o mecanismos equivalentes ofrecidos por los proveedores de servicios.',
      ],
    },
    {
      id: 'retention',
      title: 'Retención',
      listItems: [
        'Los valores de consentimiento y preferencias permanecen en tu navegador hasta que los borres o cambies tus elecciones.',
        'Las cachés IndexedDB del registry permanecen hasta que expiren, elijas Limpiar caché en la configuración del sitio o borres los datos del sitio.',
        'El Cache Storage del service worker permanece hasta que expire el TTL de HTML o de recursos, un nuevo service worker reemplace las cachés, o borres los datos del sitio.',
        'La retención de analítica sigue la configuración y políticas de Google Tag Manager / Google Analytics.',
      ],
    },
    {
      id: 'your-rights',
      title: 'Tus derechos',
      paragraphs: ['Según donde vivas, puedes tener algunos o todos los siguientes derechos:'],
      listItems: [
        'UE/Reino Unido (GDPR): acceso, rectificación, supresión, limitación, portabilidad, oposición, retirar el consentimiento y presentar una reclamación ante una autoridad de control.',
        'Estados Unidos (leyes estatales de privacidad): saber qué recopilamos, solicitar eliminación y optar por no participar en la venta/compartición para publicidad conductual entre contextos usando Rechazar analítica o Preferencias de cookies.',
        'Brasil (LGPD): confirmación, acceso, corrección, anonimización, portabilidad, eliminación, información sobre compartición, revocar consentimiento y presentar una reclamación ante la ANPD.',
      ],
    },
    {
      id: 'children',
      title: 'Menores',
      paragraphs: [
        'Agents Repo no está dirigido a menores de 16 años (UE) o 13 años (EE. UU.). No recopilamos intencionalmente información personal de menores.',
      ],
    },
    {
      id: 'do-not-sell',
      title: 'No vender ni compartir',
      paragraphs: [
        'No vendemos tu información personal a cambio de dinero.',
        'Puedes optar por no participar en el intercambio de analítica seleccionando Rechazar analítica en el banner de cookies o reabriendo Preferencias de cookies en el pie de página.',
      ],
    },
    {
      id: 'changes',
      title: 'Cambios en esta política',
      paragraphs: [
        'Podemos actualizar esta política periódicamente. Revisaremos la fecha de última actualización en la parte superior de esta página cuando se publiquen cambios.',
      ],
    },
    {
      id: 'contact',
      title: 'Contacto',
      paragraphs: [
        'Para solicitudes de privacidad o preguntas sobre esta política, contáctanos a través de la página de Contacto.',
      ],
    },
  ],
}
