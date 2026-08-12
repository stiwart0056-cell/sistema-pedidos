import type { MenuItem } from "@/types";

export const defaultMenuItems: Omit<MenuItem, "id">[] = [
  // ========== TEMPRANITOS ==========
  {
    name: "Avocado Toast",
    description: "Pan artesanal tostado con aguacate fresco, huevo pochado y semillas de chía.",
    price: 250,
    category: "Tempranitos",
    image: "https://images.unsplash.com/photo-1588137372308-15f75323ca8d?w=400&h=400&fit=crop",
  },
  {
    name: "French Toast Clásico",
    description: "Pan brioche empanizado, canela, miel de maple y frutos rojos.",
    price: 280,
    category: "Tempranitos",
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=400&fit=crop",
  },
  {
    name: "Toast de Salmón",
    description: "Salmón ahumado, queso crema, alcaparras y eneldo sobre pan integral.",
    price: 350,
    category: "Tempranitos",
    image: "https://images.unsplash.com/photo-1516961642265-531546e84af2?w=400&h=400&fit=crop",
  },

  // ========== CLÁSICOS ==========
  {
    name: "Club Sandwich",
    description: "Triple de pollo, tocino, lechuga, tomate y mayonesa casera.",
    price: 320,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1553909489-cd47e3b4430a?w=400&h=400&fit=crop",
  },
  {
    name: "Philly Cheesesteak",
    description: "Carne de res, pimientos, cebolla y queso cheddar fundido.",
    price: 380,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1550507992-eb63ffe7ed71?w=400&h=400&fit=crop",
  },
  {
    name: "Cubano",
    description: "Jamón, cerdo asado, queso suizo, pepinillos y mostaza.",
    price: 340,
    category: "Clásicos",
    image: "https://images.unsplash.com/photo-1606757389663-2345957f9637?w=400&h=400&fit=crop",
  },

  // ========== SIGNATURE ==========
  {
    name: "Mr. Super Toast",
    description: "Nuestra especialidad: pulled pork, salsa BBQ, cebolla crispy y queso gouda.",
    price: 420,
    category: "Signature",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
  },
  {
    name: "Spicy Tuna Melt",
    description: "Atún picante, mayonesa japonesa, queso mozzarella y jalapeños.",
    price: 390,
    category: "Signature",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop",
  },
  {
    name: "Truffle Grilled Cheese",
    description: "Queso brie, gouda, aceite de trufa y miel en pan sourdough.",
    price: 450,
    category: "Signature",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
  },

  // ========== BURGERS ==========
  {
    name: "Classic Burger",
    description: "Carne 200g, lechuga, tomate, cebolla, queso cheddar y salsa especial.",
    price: 380,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
  },
  {
    name: "Bacon BBQ Burger",
    description: "Carne 200g, tocino crocante, cebolla caramelizada y salsa BBQ.",
    price: 420,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=400&fit=crop",
  },
  {
    name: "Mushroom Swiss Burger",
    description: "Carne 200g, champiñones salteados, queso suizo y mayonesa de ajo.",
    price: 400,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1586190848861-99c9574548e4?w=400&h=400&fit=crop",
  },

  // ========== EL RINCONCITO MEXICANO ==========
  {
    name: "Tacos al Pastor",
    description: "Tres tacos de cerdo marinado, piña, cilantro y cebolla.",
    price: 300,
    category: "El Rinconcito Mexicano",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop",
  },
  {
    name: "Quesadilla Suprema",
    description: "Tortilla de harina, queso oaxaca, pollo, pico de gallo y guacamole.",
    price: 280,
    category: "El Rinconcito Mexicano",
    image: "https://images.unsplash.com/photo-1599974579694-f17d07b1ce11?w=400&h=400&fit=crop",
  },
  {
    name: "Burrito de Carne",
    description: "Arroz, frijoles, carne asada, queso, crema y salsa verde.",
    price: 350,
    category: "El Rinconcito Mexicano",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop",
  },

  // ========== JUGOS ==========
  {
    name: "Jugo de Naranja Natural",
    description: "Exprimido al momento, 100% natural.",
    price: 120,
    category: "Jugos",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
  },
  {
    name: "Jugo Verde Detox",
    description: "Espinaca, pepino, manzana verde, jengibre y limón.",
    price: 150,
    category: "Jugos",
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop",
  },
  {
    name: "Jugo de Zanahoria",
    description: "Zanahoria, naranja y cúrcuma.",
    price: 130,
    category: "Jugos",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=400&fit=crop",
  },

  // ========== BATIDAS ==========
  {
    name: "Batida de Chocolate",
    description: "Helado de chocolate, leche y crema batida.",
    price: 180,
    category: "Batidas",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop",
  },
  {
    name: "Batida de Fresa",
    description: "Fresas frescas, helado de vainilla y leche.",
    price: 170,
    category: "Batidas",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=400&fit=crop",
  },
  {
    name: "Batida de Oreo",
    description: "Galletas Oreo, helado de vainilla y crema batida.",
    price: 190,
    category: "Batidas",
    image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=400&fit=crop",
  },

  // ========== REFRESCOS ==========
  {
    name: "Coca-Cola",
    description: "Lata 355ml.",
    price: 80,
    category: "Refrescos",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop",
  },
  {
    name: "Sprite",
    description: "Lata 355ml.",
    price: 80,
    category: "Refrescos",
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop",
  },
  {
    name: "Agua Mineral",
    description: "Con o sin gas.",
    price: 60,
    category: "Refrescos",
    image: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=400&fit=crop",
  },

  // ========== MORIR SOÑANDO ==========
  {
    name: "Morir Soñando Clásico",
    description: "Leche evaporada, jugo de naranja, azúcar y hielo.",
    price: 140,
    category: "Morir Soñando",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop",
  },
  {
    name: "Morir Soñando de Fresa",
    description: "Leche evaporada, puré de fresa, azúcar y hielo.",
    price: 150,
    category: "Morir Soñando",
    image: "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=400&h=400&fit=crop",
  },
  {
    name: "Morir Soñando de Coco",
    description: "Leche de coco, leche evaporada, azúcar y hielo.",
    price: 160,
    category: "Morir Soñando",
    image: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=400&h=400&fit=crop",
  },
];
