import type { MenuItem } from "@/types";

export const defaultMenuItems: Omit<MenuItem, "id">[] = [
  // ========== TEMPRANITOS ==========
  {
    name: "Tres golpes",
    description: "Acompañado de queso frito, huevo, salami y cebolla encurtida.",
    price: 260,
    category: "Tempranitos",
    image: "https://images.unsplash.com/photo-1525351484163-7529414395d8?w=400&h=400&fit=crop",
  },
  {
    name: "Omelette de la Casa",
    description: "3 huevos revueltos con queso, tomate y cebolla, acompañados de aguacate.",
    price: 250,
    category: "Tempranitos",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&h=400&fit=crop",
  },
  {
    name: "Avocado Toast",
    description: "Con aguacate, burrata y reducción de balsámico.",
    price: 280,
    category: "Tempranitos",
    image: "https://images.unsplash.com/photo-1588137372308-15f75323ca8d?w=400&h=400&fit=crop",
  },

  // ========== CLÁSICOS ==========
  {
    name: "Tostada",
    description: "Pan de agua con jamón, queso, tomate y lechuga.",
    price: 120,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1553909489-cd47e3b4430a?w=400&h=400&fit=crop",
  },
  {
    name: "Tostada de Pollo y Bacon",
    description: "Pan de agua, jamón, queso mozzarella, crema de pollo y bacon.",
    price: 190,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1550507992-eb63ffe7ed71?w=400&h=400&fit=crop",
  },
  {
    name: "Sandwich de Jamón y Queso",
    description: "Con jamón, queso mozzarella, tomate y lechuga.",
    price: 150,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1606757389663-2345957f9637?w=400&h=400&fit=crop",
  },
  {
    name: "Sandwich de Pierna",
    description: "Pan baguette con pierna de cerdo horneada, queso gouda y aderezo Toast.",
    price: 450,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1606757389663-2345957f9637?w=400&h=400&fit=crop",
  },
  {
    name: "Sandwich de Tuna",
    description: "Pan de miga con crema de queso (cream cheese) y atún.",
    price: 280,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop",
  },
  {
    name: "Mr Cheese",
    description: "Pan de miga con mezcla de queso cheddar, mozzarella y danés.",
    price: 240,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
  },
  {
    name: "Mr Club",
    description: "Pan de miga con crema de pollo, jamón y queso mozzarella, acompañado de papas fritas.",
    price: 440,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1553909489-cd47e3b4430a?w=400&h=400&fit=crop",
  },

  // ========== SIGNATURE ==========
  {
    name: "El Cubanito",
    description: "Pan baguette con filete de cerdo desmenuzado, mostaza y pepinillos.",
    price: 450,
    category: "Signature",
    image: "https://images.unsplash.com/photo-1606757389663-2345957f9637?w=400&h=400&fit=crop",
  },
  {
    name: "Chimi",
    description: "Pan de agua con carne artesanal, coleslaw, kétchup y mayonesa.",
    price: 350,
    category: "Signature",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
  },
  {
    name: "The Riki Ricón",
    description: "Pan de agua con carne molida, repollo, salsa picante, kétchup y mayonesa.",
    price: 180,
    category: "Signature",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
  },
  {
    name: "Carnival",
    description: "Pan baguette con filete de cerdo, pollo, bacon, queso gouda, chimichurri y aderezo Toast.",
    price: 550,
    category: "Signature",
    image: "https://images.unsplash.com/photo-1550507992-eb63ffe7ed71?w=400&h=400&fit=crop",
  },
  {
    name: "Italiano",
    description: "Pan baguette con salami Genoa, queso mozzarella, rúcula, pesto y queso parmesano.",
    price: 520,
    category: "Signature",
    image: "https://images.unsplash.com/photo-1606757389663-2345957f9637?w=400&h=400&fit=crop",
  },
  {
    name: "Caesar Sandwich",
    description: "Pan baguette con pollo, lechuga romana, queso parmesano y aderezo César hecho en casa.",
    price: 430,
    category: "Signature",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop",
  },

  // ========== BURGERS ==========
  {
    name: "Mr Smash Burger",
    description: "Doble carne de 80 g, queso americano, pepinillos, cebolla caramelizada y salsa smash.",
    price: 420,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
  },
  {
    name: "Oklahoma Smash Burger",
    description: "Doble carne de 80 g, queso americano, pepinillos, cebolla blanca smash y salsa smash.",
    price: 480,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=400&fit=crop",
  },

  // ========== EL RINCONCITO MEXICANO ==========
  {
    name: "Los Taquitos",
    description: "Trío de tacos, mozzarella, guacamole, pico de gallo y lechuga rizada.",
    price: 320,
    category: "El Rinconcito Mexicano",
    variants: [
      { name: "Pollo", price: 295 },
      { name: "Res", price: 320 },
      { name: "Mixto", price: 350 },
    ],
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop",
  },
  {
    name: "Quesadilla Jalisco",
    description: "Quesadilla de queso mozzarella, guacamole, pico de gallo y aderezo caesar.",
    price: 340,
    category: "El Rinconcito Mexicano",
    variants: [
      { name: "Pollo", price: 320 },
      { name: "Res", price: 340 },
      { name: "Mixto", price: 360 },
    ],
    image: "https://images.unsplash.com/photo-1599974579694-f17d07b1ce11?w=400&h=400&fit=crop",
  },
  {
    name: "Mr Burrito",
    description: "Burrito XL con guacamole, pico de gallo, lechuga rizada, pollo, res o mixto.",
    price: 400,
    category: "El Rinconcito Mexicano",
    variants: [
      { name: "Pollo", price: 380 },
      { name: "Res", price: 400 },
      { name: "Mixto", price: 440 },
    ],
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop",
  },

  // ========== JUGOS ==========
  {
    name: "Limón - Menta",
    description: "",
    price: 200,
    category: "Jugos",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
  },
  {
    name: "Piña - Albahaca",
    description: "",
    price: 200,
    category: "Jugos",
    image: "https://images.unsplash.com/photo-1623065422902-30a097e8f929?w=400&h=400&fit=crop",
  },
  {
    name: "Chinola",
    description: "",
    price: 160,
    category: "Jugos",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=400&fit=crop",
  },
  {
    name: "Limón",
    description: "",
    price: 160,
    category: "Jugos",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
  },
  {
    name: "Fresa",
    description: "",
    price: 170,
    category: "Jugos",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=400&fit=crop",
  },
  {
    name: "Naranja",
    description: "",
    price: 180,
    category: "Jugos",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=400&fit=crop",
  },

  // ========== BATIDAS ==========
  {
    name: "Fresa",
    description: "",
    price: 200,
    category: "Batidas",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=400&fit=crop",
  },
  {
    name: "Guineo",
    description: "",
    price: 160,
    category: "Batidas",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop",
  },
  {
    name: "Lechoza",
    description: "",
    price: 200,
    category: "Batidas",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop",
  },
  {
    name: "Zapote",
    description: "",
    price: 200,
    category: "Batidas",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop",
  },

  // ========== REFRESCOS ==========
  {
    name: "Coca Cola",
    description: "",
    price: 60,
    category: "Refrescos",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop",
  },
  {
    name: "Sprite",
    description: "",
    price: 60,
    category: "Refrescos",
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop",
  },
  {
    name: "Country Club - Rojo",
    description: "",
    price: 50,
    category: "Refrescos",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop",
  },
  {
    name: "Country Club - Uva",
    description: "",
    price: 50,
    category: "Refrescos",
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop",
  },
  {
    name: "Country Club - Merengue",
    description: "",
    price: 50,
    category: "Refrescos",
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop",
  },
  {
    name: "Agua Rosa",
    description: "",
    price: 35,
    category: "Refrescos",
    image: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=400&fit=crop",
  },

  // ========== MORIR SOÑANDO ==========
  {
    name: "Limón",
    description: "",
    price: 190,
    category: "Morir Soñando",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop",
  },
  {
    name: "Naranja",
    description: "",
    price: 190,
    category: "Morir Soñando",
    image: "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=400&h=400&fit=crop",
  },
  {
    name: "Chinola",
    description: "",
    price: 190,
    category: "Morir Soñando",
    image: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=400&h=400&fit=crop",
  },
];
