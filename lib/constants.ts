// Navigation links
export const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '/menu', label: 'Menú' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#galeria', label: 'Galería' },
]

// Brand
export const BRAND = {
  name: 'ARTISAN',
  tagline: 'Coffee Experience',
  description: 'Desde 2024, transformando cada momento en una experiencia sensorial única.',
}

// Hero content
export const HERO_CONTENT = {
  eyebrow: 'EXPERIENCIA PREMIUM DESDE 2024',
  headline: 'El Arte del\nCafé Perfecto',
  subtitle: 'Cada taza cuenta una historia. Granos seleccionados de las mejores regiones del mundo, tostados con pasión artesanal, preparados con maestría. Bienvenido a donde el café se convierte en arte.',
  cta: {
    primary: 'Explorar Menú',
    secondary: 'Nuestra Historia',
  },
}

// Social links
export const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { name: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { name: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
]

// Contact info
export const CONTACT_INFO = {
  phone: '+52 55 1234 5678',
  email: 'hola@artisancoffee.mx',
  address: 'Av. Paseo de la Reforma 250, Col. Juárez, CDMX',
  hours: {
    weekdays: '7:00 AM - 10:00 PM',
    weekends: '8:00 AM - 11:00 PM',
  },
}

// Spacing system
export const SPACING = {
  section: {
    sm: 'py-16 md:py-20',
    md: 'py-20 md:py-28',
    lg: 'py-28 md:py-36',
    xl: 'py-36 md:py-48',
  },
  container: {
    sm: 'max-w-4xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
  },
}

export interface MenuItem {
  name: string
  description: string
  price: number
  size?: string
  intensity?: number
  hot?: boolean
  cold?: boolean
  time?: string
  serves?: number
  featured?: boolean
  tags?: string[]
  popularity?: number
}

export interface MenuCategory {
  id: string
  name: string
  description: string
  items: MenuItem[]
}

// Coffee beans / origins
export const COFFEE_ORIGINS = [
  {
    id: 'colombia',
    name: 'Colombia Huila',
    country: 'Colombia',
    region: 'Huila',
    altitude: '1,700 - 2,000 msnm',
    process: 'Lavado',
    profile: 'Notas de caramelo, frutas rojas y cacao',
    acidity: 'Media-Alta',
    body: 'Medio',
    roast: 'Medio',
    image: '/images/beans-colombia.jpg',
  },
  {
    id: 'brazil',
    name: 'Brasil Cerrado',
    country: 'Brasil',
    region: 'Cerrado Mineiro',
    altitude: '1,000 - 1,200 msnm',
    process: 'Natural',
    profile: 'Chocolate, nueces, caramelo suave',
    acidity: 'Baja',
    body: 'Alto',
    roast: 'Medio-Oscuro',
    image: '/images/beans-brazil.jpg',
  },
  {
    id: 'ethiopia',
    name: 'Etiopía Yirgacheffe',
    country: 'Etiopía',
    region: 'Yirgacheffe',
    altitude: '1,800 - 2,200 msnm',
    process: 'Lavado',
    profile: 'Floral, cítrico, bergamota, té',
    acidity: 'Alta',
    body: 'Ligero',
    roast: 'Claro',
    image: '/images/beans-ethiopia.jpg',
  },
  {
    id: 'guatemala',
    name: 'Guatemala Antigua',
    country: 'Guatemala',
    region: 'Antigua',
    altitude: '1,500 - 1,700 msnm',
    process: 'Lavado',
    profile: 'Chocolate amargo, especias, humo sutil',
    acidity: 'Media',
    body: 'Completo',
    roast: 'Medio',
    image: '/images/beans-guatemala.jpg',
  },
  {
    id: 'costarica',
    name: 'Costa Rica Tarrazú',
    country: 'Costa Rica',
    region: 'Tarrazú',
    altitude: '1,400 - 1,900 msnm',
    process: 'Honey',
    profile: 'Miel, manzana verde, cítricos',
    acidity: 'Brillante',
    body: 'Medio',
    roast: 'Medio-Claro',
    image: '/images/beans-costarica.jpg',
  },
]

// Menu categories and items
export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'cafes-calientes',
    name: 'Cafés Calientes',
    description: 'Especialidades preparadas con granos seleccionados y tostado artesanal.',
    items: [
      {
        name: 'Espresso',
        description: 'Shot intenso con notas de cacao amargo y crema dorada.',
        price: 3200,
        intensity: 5,
        hot: true,
        size: '30ml',
        featured: true,
        popularity: 88,
        tags: ['vegano', 'sin tacc', 'intenso'],
      },
      {
        name: 'Doppio',
        description: 'Doble shot de espresso, concentrado y potente.',
        price: 4500,
        intensity: 5,
        hot: true,
        size: '60ml',
        popularity: 65,
        tags: ['vegano', 'sin tacc', 'intenso'],
      },
      {
        name: 'Cortado',
        description: 'Espresso cortado con un toque de leche vaporizada.',
        price: 4000,
        intensity: 4,
        hot: true,
        size: '80ml',
        popularity: 58,
        tags: ['sin tacc'],
      },
      {
        name: 'Americano',
        description: 'Espresso largo con agua caliente.',
        price: 4500,
        intensity: 3,
        hot: true,
        size: '250ml',
        popularity: 62,
        tags: ['vegano', 'sin tacc'],
      },
      {
        name: 'Lágrima',
        description: 'Leche vaporizada con una lágrima de espresso.',
        price: 4200,
        intensity: 2,
        hot: true,
        size: '200ml',
        popularity: 52,
        tags: ['suave'],
      },
      {
        name: 'Flat White',
        description: 'Doble espresso con microespuma sedosa.',
        price: 4800,
        intensity: 4,
        hot: true,
        size: '250ml',
        featured: true,
        popularity: 92,
        tags: ['sin tacc', 'premium'],
      },
      {
        name: 'Latte',
        description: 'Espresso suave con leche vaporizada y microespuma.',
        price: 5200,
        intensity: 3,
        hot: true,
        size: '350ml',
        popularity: 85,
        tags: ['suave'],
      },
      {
        name: 'Cappuccino',
        description: 'Partes iguales de espresso, leche y espuma densa.',
        price: 5000,
        intensity: 3,
        hot: true,
        size: '300ml',
        featured: true,
        popularity: 95,
        tags: [],
      },
      {
        name: 'Latte Vainilla',
        description: 'Espresso suave con leche vaporizada y vainilla artesanal.',
        price: 5500,
        intensity: 2,
        hot: true,
        size: '350ml',
        popularity: 82,
        tags: ['dulce', 'suave'],
      },
      {
        name: 'Mocha',
        description: 'Espresso con chocolate belga y crema vaporizada.',
        price: 5900,
        intensity: 3,
        hot: true,
        size: '350ml',
        popularity: 78,
        tags: ['dulce'],
      },
      {
        name: 'Affogato',
        description: 'Shot de espresso sobre helado de vainilla artesanal.',
        price: 6200,
        intensity: 4,
        hot: true,
        featured: true,
        popularity: 82,
        tags: ['premium', 'dulce', 'sin tacc'],
      },
      {
        name: 'Submarino Argentino',
        description: 'Leche caliente con barra de chocolate artesanal.',
        price: 4500,
        intensity: 1,
        hot: true,
        popularity: 91,
        tags: ['dulce'],
      },
    ],
  },
  {
    id: 'cafes-frios',
    name: 'Cafés Fríos',
    description: 'Preparaciones frías para disfrutar en cualquier estación.',
    items: [
      {
        name: 'Cold Brew',
        description: 'Extracción en frío durante 18 horas. Suave y concentrado.',
        price: 5600,
        intensity: 4,
        cold: true,
        size: '400ml',
        featured: true,
        popularity: 88,
        tags: ['vegano', 'sin tacc'],
      },
      {
        name: 'Iced Latte',
        description: 'Espresso frío con leche y hielo.',
        price: 5200,
        intensity: 3,
        cold: true,
        size: '400ml',
        popularity: 85,
        tags: ['sin tacc'],
      },
      {
        name: 'Espresso Tonic',
        description: 'Shot de espresso sobre agua tónica con hielo y cítricos.',
        price: 6500,
        intensity: 4,
        cold: true,
        size: '300ml',
        featured: true,
        popularity: 78,
        tags: ['vegano', 'sin tacc', 'premium'],
      },
      {
        name: 'Frappuccino Caramel',
        description: 'Café helado licuado con caramelo artesanal.',
        price: 6800,
        intensity: 3,
        cold: true,
        size: '450ml',
        popularity: 80,
        tags: ['dulce'],
      },
      {
        name: 'Frappuccino Oreo',
        description: 'Frappuccino cremoso con galletas Oreo y crema batida.',
        price: 7200,
        intensity: 2,
        cold: true,
        size: '450ml',
        featured: true,
        popularity: 93,
        tags: ['dulce'],
      },
      {
        name: 'Frappuccino Pistacho',
        description: 'Café helado con crema de pistacho y crema batida.',
        price: 7500,
        intensity: 2,
        cold: true,
        size: '450ml',
        popularity: 76,
        tags: ['dulce', 'premium'],
      },
    ],
  },
  {
    id: 'desayunos',
    name: 'Desayunos',
    description: 'Opciones clásicas y premium para arrancar el día con energía.',
    items: [
      {
        name: 'Desayuno Porteño',
        description: 'Café con leche, medialunas y jugo de naranja natural.',
        price: 8900,
        serves: 1,
        time: '10 min',
        featured: true,
        popularity: 90,
        tags: [],
      },
      {
        name: 'Brunch Premium',
        description: 'Huevos revueltos, tostado de campo, yogur, frutas y café.',
        price: 14500,
        serves: 1,
        time: '20 min',
        popularity: 75,
        tags: ['premium'],
      },
      {
        name: 'Avocado Toast',
        description: 'Palta aplastada, huevo poché, semillas y limón.',
        price: 9200,
        serves: 1,
        time: '15 min',
        featured: true,
        popularity: 88,
        tags: ['sin tacc', 'salado'],
      },
      {
        name: 'Petit Avocado',
        description: 'Mini tostado con palta, tomate cherry y rúcula.',
        price: 7800,
        serves: 1,
        time: '10 min',
        popularity: 68,
        tags: ['salado'],
      },
      {
        name: 'Omelette',
        description: 'Omelette con queso, espinaca y tomates cherry.',
        price: 10500,
        serves: 1,
        time: '15 min',
        popularity: 60,
        tags: ['sin tacc', 'salado'],
      },
      {
        name: 'Oats Pancakes',
        description: 'Pancakes de avena con miel, frutas frescas y granola.',
        price: 11000,
        serves: 1,
        time: '20 min',
        featured: true,
        popularity: 82,
        tags: ['dulce', 'vegano'],
      },
      {
        name: 'Yogurt Bowl',
        description: 'Yogur griego, granola artesanal, miel y frutas de estación.',
        price: 6500,
        serves: 1,
        popularity: 72,
        tags: ['sin tacc'],
      },
      {
        name: 'Tostado JyQ',
        description: 'Jamón y queso en pan de campo tostado.',
        price: 7800,
        serves: 1,
        popularity: 55,
        tags: ['salado'],
      },
    ],
  },
  {
    id: 'meriendas',
    name: 'Meriendas',
    description: 'Perfectas para acompañar una tarde de café.',
    items: [
      {
        name: 'Merienda Clásica',
        description: 'Café + 2 medialunas.',
        price: 6200,
        serves: 1,
        featured: true,
        popularity: 92,
        tags: ['dulce'],
      },
      {
        name: 'Cheesecake Frutos Rojos',
        description: 'Porción artesanal cremosa.',
        price: 6800,
        serves: 1,
        popularity: 85,
        tags: ['dulce', 'premium'],
      },
      {
        name: 'Brownie Tibio',
        description: 'Chocolate intenso con nueces.',
        price: 5900,
        serves: 1,
        popularity: 88,
        tags: ['dulce'],
      },
      {
        name: 'Cookie NY Style',
        description: 'Cookie gigante con chips de chocolate.',
        price: 4300,
        serves: 1,
        popularity: 78,
        tags: ['dulce'],
      },
      {
        name: 'Alfajor Artesanal',
        description: 'Dulce de leche y baño de chocolate.',
        price: 3500,
        serves: 1,
        popularity: 82,
        tags: ['dulce', 'sin tacc'],
      },
    ],
  },
  {
    id: 'pasteleria',
    name: 'Pastelería',
    description: 'Pastelería artesanal horneada diariamente en nuestra cocina.',
    items: [
      {
        name: 'Medialunas de Manteca',
        description: 'Receta clásica argentina, hojaldradas y brillantes.',
        price: 1800,
        serves: 1,
        featured: true,
        popularity: 95,
        tags: ['dulce'],
      },
      {
        name: 'Roll de Canela',
        description: 'Masa suave, relleno generoso y glaseado artesanal.',
        price: 4800,
        serves: 1,
        popularity: 80,
        tags: ['dulce'],
      },
      {
        name: 'Budín de Limón',
        description: 'Húmedo, esponjoso y con glaseado de limón.',
        price: 4200,
        serves: 1,
        popularity: 65,
        tags: ['dulce'],
      },
      {
        name: 'Tarta Oreo',
        description: 'Base de galleta, relleno de crema y chocolate negro.',
        price: 7100,
        serves: 1,
        featured: true,
        popularity: 85,
        tags: ['dulce'],
      },
      {
        name: 'Cheesecake NY',
        description: 'Clásico estilo Nueva York con coulis de frutos rojos.',
        price: 7800,
        serves: 1,
        featured: true,
        popularity: 80,
        tags: ['dulce', 'premium'],
      },
      {
        name: 'Alfajor Artesanal',
        description: 'Dulce de leche y baño de chocolate artesanal.',
        price: 3500,
        serves: 1,
        popularity: 78,
        tags: ['dulce', 'sin tacc'],
      },
      {
        name: 'Macarons',
        description: 'Selección de 3 sabores: vainilla, frambuesa y pistacho.',
        price: 5200,
        serves: 1,
        popularity: 58,
        tags: ['dulce', 'premium'],
      },
      {
        name: 'Petit Gateau',
        description: 'Coulant de chocolate con helado de vainilla artesanal.',
        price: 8500,
        serves: 1,
        featured: true,
        popularity: 85,
        tags: ['dulce', 'premium'],
      },
    ],
  },
  {
    id: 'bebidas-frias',
    name: 'Frías',
    description: 'Opciones refrescantes sin café.',
    items: [
      {
        name: 'Limonada Menta Jengibre',
        description: 'Refrescante y natural con menta fresca y jengibre.',
        price: 4900,
        cold: true,
        popularity: 65,
        tags: ['vegano', 'sin tacc'],
      },
      {
        name: 'Matcha Latte Frío',
        description: 'Té matcha premium con leche y hielo.',
        price: 6200,
        cold: true,
        popularity: 70,
        tags: ['premium'],
      },
    ],
  },
]

// Leches alternativas
export const MILK_OPTIONS = [
  { name: 'Leche Entera', price: 0 },
  { name: 'Leche Deslactosada', price: 0 },
  { name: 'Leche de Almendra', price: 15 },
  { name: 'Leche de Avena', price: 15 },
  { name: 'Leche de Coco', price: 15 },
  { name: 'Leche de Soya', price: 10 },
]

// Extras
export const EXTRAS = [
  { name: 'Shot Extra de Espresso', price: 20 },
  { name: 'Jarabe de Sabor', price: 15 },
  { name: 'Crema Batida', price: 10 },
  { name: 'Chocolate Extra', price: 15 },
]

// Reservation time slots
export const RESERVATION_TIME_SLOTS = [
  '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
]

// Guest options
export const GUEST_OPTIONS = [
  { value: '1', label: '1 persona' },
  { value: '2', label: '2 personas' },
  { value: '3', label: '3 personas' },
  { value: '4', label: '4 personas' },
  { value: '5', label: '5 personas' },
  { value: '6', label: '6 personas' },
  { value: '7', label: '7 personas' },
  { value: '8', label: '8 personas' },
  { value: '8+', label: 'Grupo grande (8+)' },
]

// Occasion options
export const OCCASION_OPTIONS = [
  { value: 'casual', label: 'Visita casual' },
  { value: 'business', label: 'Reunión de negocios' },
  { value: 'date', label: 'Cita romántica' },
  { value: 'celebration', label: 'Celebración' },
  { value: 'birthday', label: 'Cumpleaños' },
  { value: 'anniversary', label: 'Aniversario' },
  { value: 'other', label: 'Otra ocasión' },
]

// Seating preferences
export const SEATING_OPTIONS = [
  { value: 'any', label: 'Sin preferencia' },
  { value: 'window', label: 'Junto a ventana' },
  { value: 'terrace', label: 'Terraza' },
  { value: 'private', label: 'Área privada' },
  { value: 'bar', label: 'Barra de café' },
]

// Typography classes
export const TYPOGRAPHY = {
  heading: {
    h1: 'font-serif text-5xl font-light leading-[1.1] sm:text-6xl md:text-7xl lg:text-8xl',
    h2: 'font-serif text-3xl font-light leading-tight sm:text-4xl md:text-5xl lg:text-6xl',
    h3: 'font-serif text-2xl font-light leading-tight sm:text-3xl md:text-4xl',
    h4: 'font-serif text-xl font-light leading-tight sm:text-2xl md:text-3xl',
  },
  body: {
    lg: 'text-lg font-light leading-relaxed',
    md: 'text-base font-light leading-relaxed',
    sm: 'text-sm font-light leading-relaxed',
  },
  eyebrow: 'text-xs font-medium uppercase tracking-[0.3em]',
}
