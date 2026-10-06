import { ServiceItem, IsoPackage } from '../types';

export const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'diagnostico-inicial',
    category: 'produccion',
    title: 'Diagnóstico Inicial de Procesos Productivos',
    shortDesc: 'Evaluación preliminar in-situ y matriz de cuellos de botella con plan de acción correctivo inmediato.',
    fullDesc: 'Inspección técnica integral de su línea operativa o planta. Identificamos mermas, desbalances de capacidad instalada, tiempos muertos y desviaciones críticas para establecer un plan de choque con retorno medible.',
    modalidad: 'Único',
    price: 30,
    popular: true,
    savingsBadge: '100% Bonificado con catálogo',
    paymentCondition: 'Si contrata los servicios de cualquier ítem especificado y seleccionado en catálogo no se cobrará el valor de Diagnóstico inicial de Procesos Productivos.',
    iconName: 'Activity',
    deliverables: [
      'Informe ejecutivo de estado de planta y capacidad',
      'Matriz de cuellos de botella y pérdidas de tiempo',
      'Hoja de ruta priorizada de optimización (30/60/90 días)'
    ],
    estimatedDays: '3 a 5 días laborables',
    requiresPlantAudit: true
  },
  {
    id: 'planificacion-control',
    category: 'produccion',
    title: 'Planificación y Control de la Producción (PCP)',
    shortDesc: 'Diseño de planes maestros de producción (MPS), balanceo de líneas y control de piso.',
    fullDesc: 'Implementación del sistema integral de planificación fabril: pronóstico de demanda, cálculo de órdenes de trabajo (OT), secuenciamiento de lotes y tableros visuales Kanban para erradicar retrasos de despacho.',
    modalidad: 'Pago Único',
    price: 380,
    popular: true,
    savingsBadge: 'Pago Único',
    paymentCondition: 'Al contratar este servicio de pago único ($380 USD), el Diagnóstico Inicial de Procesos Productivos ($30 USD) queda 100% bonificado ($0.00).',
    iconName: 'Layers',
    deliverables: [
      'Plan Maestro de Producción (MPS) adaptado a su ERP o Excel',
      'Procedimiento estandarizado de lanzamiento de órdenes de producción',
      'Tablero de control de productividad (OEE / cumplimiento)'
    ],
    estimatedDays: 'Implementación técnica y acompañamiento inicial'
  },
  {
    id: 'tiempos-movimientos',
    category: 'costos',
    title: 'Estudio de Tiempos y Movimientos',
    shortDesc: 'Cronometraje industrial, balance de estaciones y determinación de ritmos estándar.',
    fullDesc: 'Cálculo de tiempos estándar mediante metodología MTM/cronometraje por elementos. Determinación de suplementos por fatiga, eliminación de movimientos improductivos y estandarización de puestos de trabajo.',
    modalidad: 'Único',
    price: 340,
    iconName: 'Timer',
    deliverables: [
      'Hojas de toma de tiempos y cálculo de capacidad real',
      'Fichas de operaciones estándar de cada puesto',
      'Reducción estimada del 15% al 35% en tiempo de ciclo'
    ],
    estimatedDays: '15 días laborables'
  },
  {
    id: 'costos-produccion',
    category: 'costos',
    title: 'Costeo y Control de Costos de Producción',
    shortDesc: 'Costeo por procesos, tasas de mano de obra directa y distribución precisa de CIF.',
    fullDesc: 'Estructuración de costos industriales reales: desglose de materias primas, costos de mano de obra directa e indirecta, amortización de maquinaria y prorrateo de costos indirectos de fabricación (CIF) para proteger su margen bruto.',
    modalidad: 'Único',
    price: 380,
    iconName: 'CircleDollarSign',
    deliverables: [
      'Modelo de costeo unitario por producto / lote en Excel dinámico',
      'Matriz de tasas horarias de máquinas y mano de obra',
      'Simulador de punto de equilibrio y rentabilidad por línea'
    ],
    estimatedDays: '20 días laborables'
  },
  {
    id: 'iso-9001',
    category: 'iso',
    title: 'Implementación SGC · Norma ISO 9001:2026',
    shortDesc: 'Sistema de Gestión de la Calidad orientado a la satisfacción del cliente, riesgos y trazabilidad.',
    fullDesc: 'Acompañamiento integral hasta la obtención del certificado acreditado bajo la versión vigente ISO 9001:2026: mapeo de procesos, gestión de riesgos de negocio, estandarización documental, indicadores KPI y capacitación a auditores internos.',
    modalidad: 'Proyecto',
    price: 1400,
    popular: true,
    iconName: 'Award',
    deliverables: [
      'Manual y mapa de procesos documentados (ISO 9001:2026)',
      'Matriz de riesgos y oportunidades bajo enfoque ISO',
      'Formación de auditores internos certificados',
      'Acompañamiento presencial durante la auditoría externa'
    ],
    estimatedDays: '3 a 4 meses'
  },
  {
    id: 'iso-14001',
    category: 'iso',
    title: 'Implementación SGA · Norma ISO 14001:2026',
    shortDesc: 'Sistema de Gestión Ambiental: control operacional, matriz de aspectos e impactos ecológicos.',
    fullDesc: 'Estructuración de la política ambiental corporativa según la versión vigente ISO 14001:2026, identificación de aspectos ambientales significativos, planes de emergencia ecológica y cumplimiento riguroso de la normativa ambiental de Ecuador.',
    modalidad: 'Proyecto',
    price: 1520,
    iconName: 'Leaf',
    deliverables: [
      'Matriz de aspectos e impactos ambientales de la planta (ISO 14001:2026)',
      'Programa de manejo de desechos y eficiencia de recursos',
      'Preparación integral para auditoría de certificación'
    ],
    estimatedDays: '3 a 4 meses'
  },
  {
    id: 'iso-45001',
    category: 'sst',
    title: 'Implementación SG-SST · Norma ISO 45001:2018',
    shortDesc: 'Seguridad y Salud en el Trabajo: matrices IPERC, prevención de accidentes y cultura preventiva.',
    fullDesc: 'Diseño del Sistema de Gestión de Seguridad y Salud Ocupacional. Identificación de peligros, evaluación de riesgos IPERC, planes de contingencia, investigación de incidentes y cumplimiento legal laboral ante entes de control.',
    modalidad: 'Proyecto',
    price: 1680,
    iconName: 'ShieldAlert',
    deliverables: [
      'Matriz de identificación de peligros y evaluación de riesgos (IPERC)',
      'Reglamento Interno de Higiene y Seguridad adaptado al MDT/IESS',
      'Planes de emergencia y brigadas conformadas'
    ],
    estimatedDays: '3 a 5 meses'
  },
  {
    id: 'paquete-iso-trinorma',
    category: 'iso',
    title: 'Paquete Trinorma Integrado (ISO 9001:2026 + 14001:2026 + 45001)',
    shortDesc: 'Gestión integrada de Calidad, Ambiente y Seguridad bajo estructura de alto nivel.',
    fullDesc: 'Implementación sinérgica de las 3 normas globales (ISO 9001:2026, ISO 14001:2026 e ISO 45001) en un único sistema documental coordinado. Reduce a la mitad el tiempo de auditoría y ahorra costos operativos de consultoría.',
    modalidad: 'Proyecto',
    price: 3960,
    popular: true,
    savingsBadge: 'Ahorro del 18% (USD 640 OFF)',
    iconName: 'Sparkles',
    deliverables: [
      'Sistema de Gestión Integrado (SIG) completo y simplificado',
      'Auditoría interna integrada de las 3 normas',
      'Acompañamiento integral ante el ente certificador internacional',
      'Licencia de software de seguimiento por 6 meses'
    ],
    estimatedDays: '5 a 6 meses'
  },
  {
    id: 'auditoria-interna',
    category: 'iso',
    title: 'Auditoría Interna y Pre-Auditoría de Certificación',
    shortDesc: 'Simulacro riguroso con auditores líderes antes de la visita del ente certificador.',
    fullDesc: 'Inspección de diagnóstico estricto sobre cada cláusula normativa. Detección temprana de no conformidades mayores y menores con emisión de informe con plan de acciones correctivas.',
    modalidad: 'Único',
    price: 440,
    iconName: 'ClipboardCheck',
    deliverables: [
      'Plan de auditoría y lista de verificación detallada',
      'Informe oficial de auditoría interna con hallazgos',
      'Matriz de tratamiento de no conformidades'
    ],
    estimatedDays: '5 a 8 días laborables'
  },
  {
    id: 'capacitacion-sso',
    category: 'sst',
    title: 'Capacitación Grupal en Salud y Seguridad Ocupacional',
    shortDesc: 'Taller práctico in-company con certificados de aprobación para comités y brigadas.',
    fullDesc: 'Formación teórico-práctica para trabajadores y mandos medios en prevención de riesgos ergonómicos, mecánicos, físicos y químicos, uso correcto de EPP y actuación ante emergencias.',
    modalidad: 'Por grupo',
    price: 40,
    iconName: 'GraduationCap',
    deliverables: [
      'Material didáctico y evaluación de competencias',
      'Certificados de participación y aprobación avalados',
      'Registro de inducción para cumplimiento legal'
    ],
    estimatedDays: '1 jornada presencial o sincrónica'
  },
  {
    id: 'desarrollo-web-corp',
    category: 'digital',
    title: 'Diseño de Página Web Corporativa Industrial',
    shortDesc: 'Sitio web moderno, ultra-rápido, adaptado a móviles y optimizado para captación de clientes B2B.',
    fullDesc: 'Desarrollo web a medida con arquitectura moderna, catálogo de productos/servicios, integración de WhatsApp y pasarela de pago para empresas que desean transmitir solidez corporativa.',
    modalidad: 'Único',
    price: 340,
    iconName: 'Globe',
    deliverables: [
      'Sitio web 100% responsivo y optimizado para SEO',
      'Integración con WhatsApp y formulario de cotización directa',
      'Dominio, hosting y certificados de seguridad SSL configurados'
    ],
    estimatedDays: '10 a 14 días laborables'
  },
  {
    id: 'app-planificacion',
    category: 'digital',
    title: 'App de Planificación y Control de Producción (Compra de App)',
    shortDesc: 'Software ágil en la nube para control de órdenes de trabajo, inventarios y trazabilidad con propiedad definitiva.',
    fullDesc: 'Software ágil en la nube para control de órdenes de trabajo, inventarios y trazabilidad con propiedad definitiva. Permite a jefes de planta y operarios registrar avance por estación, alertar cuellos de botella en tiempo real y monitorear el cumplimiento de despacho desde cualquier celular o tablet.',
    modalidad: 'Pago Único',
    price: 4300,
    popular: true,
    savingsBadge: 'Tecnología Propia ASEING',
    paymentCondition: 'Condición comercial: Adquisición de la App por valor de USD $4.300 (Pago Único). Opcionalmente cuenta con alternativa de Licencia mensual por USD $92 / mes por (3 usuarios).',
    iconName: 'Smartphone',
    deliverables: [
      'Software ágil en la nube para control de órdenes de trabajo, inventarios y trazabilidad con propiedad definitiva',
      'Compra y propiedad definitiva de la aplicación para su planta industrial',
      'Despliegue y configuración en su servidor o infraestructura nube',
      'Módulo de secuenciamiento de órdenes de fabricación y Kanban',
      'Generador de etiquetas de trazabilidad con código QR',
      'Capacitación inicial completa al personal y jefatura de planta'
    ],
    estimatedDays: 'Despliegue en 48 horas'
  },
  {
    id: 'app-planificacion-mensual',
    category: 'digital',
    title: 'App de Planificación y Control de Producción (Licencia Mensual)',
    shortDesc: 'Suscripción mensual flexible para control digital de órdenes de trabajo y trazabilidad de planta.',
    fullDesc: 'Suscripción mensual flexible para control digital de órdenes de trabajo y trazabilidad de planta. Acceso corporativo en la nube bajo modalidad de licencia mensual para hasta 3 usuarios simultáneos con soporte y actualizaciones continuas.',
    modalidad: 'Licencia mensual',
    price: 92,
    savingsBadge: 'Tecnología Propia ASEING',
    paymentCondition: 'Condición comercial: Licencia de USD $92 / mes por (3 usuarios) con soporte continuo. También disponible opción de Compra definitiva por USD $4.300.',
    iconName: 'Smartphone',
    deliverables: [
      'Suscripción mensual flexible para control digital de órdenes de trabajo y trazabilidad de planta',
      'Acceso para 3 usuarios simultáneos de su planta industrial',
      'Módulo de secuenciamiento de órdenes de fabricación y avance',
      'Generador de etiquetas de trazabilidad con código QR',
      'Soporte técnico, copias de seguridad y actualizaciones continuas en la nube'
    ],
    estimatedDays: 'Activación en 24 horas'
  },
  {
    id: 'asesoria-inversion-trading',
    category: 'inversion',
    title: 'Asesoría en Inversión en Mercados Financieros',
    shortDesc: 'Estrategias de gestión de capital, diversificación y operativa en brokers regulados.',
    fullDesc: 'Acompañamiento profesional en análisis técnico, gestión de riesgo y estructura de portafolio para empresas e inversionistas privados utilizando plataformas MT4 / MT5.',
    modalidad: 'Único',
    price: 280,
    iconName: 'TrendingUp',
    deliverables: [
      'Sesiones personalizadas de análisis macro y técnico',
      'Plantillas de gestión monetaria y control de drawdown',
      'Configuración y verificación de cuentas en brokers regulados internacionales'
    ],
    estimatedDays: '3 a 5 días laborables'
  }
];

export const BANK_TRANSFER_DETAILS = {
  bankName: 'Produbanco',
  accountType: 'Cuenta Ahorros',
  accountNumber: '18005352236',
  beneficiaryName: 'Suárez John F',
  idType: 'C.I.',
  idNumber: '1803227857',
  ruc: '1803227857',
  emailConfirmation: 'aseingerencia1@gmail.com',
  whatsappConfirmation: '+593 984 661 214'
};

export const PAYPHONE_CONFIG = {
  directPaymentUrl: 'https://payp.page.link/QEYpZ',
  merchantName: 'ASEING Consultores',
  currency: 'USD',
  supportedCards: ['Visa', 'Mastercard', 'Diners Club', 'Discover', 'American Express']
};

export const FAQ_ITEMS = [
  {
    q: '¿Cómo funciona la pasarela de pagos y cuáles son las modalidades disponibles?',
    a: 'Puede elegir entre "Pago Completo (100%)" o "Abono Inicial del 50% (Compromiso de Servicio)". La plataforma permite cancelar con tarjetas Visa o Mastercard a través de Payphone, pasarela de tarjeta o transferencia bancaria directa. Al confirmar la transacción, el sistema genera de inmediato su Comprobante Electrónico de Abono o de Pago Completo con su número de orden único y activa la agenda de su visita técnica.'
  },
  {
    q: '¿Cómo aplica la condición del Diagnóstico Inicial ($30 USD) y la opción de abono?',
    a: 'Si contrata los servicios de cualquier ítem especificado en el catálogo de ASEING, el Diagnóstico Inicial ($30) queda 100% bonificado ($0.00). En caso de solicitar únicamente el Diagnóstico Inicial de forma individual, por tratarse de una tarifa base sumamente accesible ($30 USD), queda estrictamente excluido de la opción de abono del 50% y requiere Pago Completo (100%).'
  },
  {
    q: '¿Qué garantía tengo de aprobación en las auditorías ISO?',
    a: 'Contamos con un 96% de tasa de aprobación en primera auditoría gracias a nuestra metodología de pre-auditoría rigurosa y acompañamiento presencial con el organismo certificador de su preferencia.'
  },
  {
    q: '¿Cómo se inicia el servicio una vez realizado el abono o pago?',
    a: 'El flujo de trabajo es 100% automatizado: al confirmarse el abono o pago completo se genera su comprobante digital oficial, se confirma la fecha de su primera visita técnica en planta o sesión virtual, se asigna el consultor líder y se establece el cronograma de trabajo.'
  },
  {
    q: '¿Emiten factura electrónica válida para el SRI en Ecuador?',
    a: 'En la plataforma web emitimos su Comprobante Digital de Pago/Abono con su número de orden. La Factura Electrónica oficial del SRI será emitida por nuestro departamento contable y enviada a su correo registrado tras la conciliación del servicio.'
  }
];
