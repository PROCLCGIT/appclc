import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Calendar, Clock, CreditCard, Download, Filter, Heart, MapPin, MessageSquare, Search, Share, ShoppingCart, Star, User, ChevronRight, Bookmark, Send } from "lucide-react";

export default function Testing9() {
  const [activeTab, setActiveTab] = useState("restaurantes");

  const categories = [
    { id: "restaurantes", name: "Restaurantes", icon: <CreditCard className="h-4 w-4" /> },
    { id: "hoteles", name: "Hoteles", icon: <Heart className="h-4 w-4" /> },
    { id: "actividades", name: "Actividades", icon: <Calendar className="h-4 w-4" /> },
    { id: "tiendas", name: "Tiendas", icon: <ShoppingCart className="h-4 w-4" /> },
    { id: "servicios", name: "Servicios", icon: <User className="h-4 w-4" /> }
  ];

  const restaurantes = [
    {
      id: 1,
      name: "La Trattoria Italiana",
      rating: 4.8,
      reviews: 423,
      category: "Italiana",
      priceLevel: "$$",
      distance: "1.2 km",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f97316'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3ETrattoria%3C/text%3E%3C/svg%3E",
      tags: ["Pasta", "Pizza", "Vino"],
      hours: "12:00 - 23:00",
      isOpen: true,
      isFavorite: true,
      address: "Av. Italia 1245, Providencia",
      phone: "+56 2 2234 5678",
      website: "www.latrattoria.cl",
      description: "Auténtica cocina italiana con ingredientes importados directamente de Italia. Ambiente acogedor y servicio de primera clase.",
      menu: [
        { category: "Entradas", items: [
          { name: "Carpaccio di Manzo", price: "$12.900", description: "Finas láminas de res, rúcula, parmesano y aceite de trufa" },
          { name: "Bruschetta", price: "$8.900", description: "Pan tostado con tomate, albahaca y aceite de oliva" }
        ]},
        { category: "Pastas", items: [
          { name: "Spaghetti alla Carbonara", price: "$15.900", description: "Spaghetti con panceta, huevo, queso pecorino y pimienta negra" },
          { name: "Ravioli di Ricotta", price: "$16.900", description: "Ravioles rellenos de ricotta y espinaca con salsa de mantequilla y salvia" }
        ]},
        { category: "Pizzas", items: [
          { name: "Margherita", price: "$14.900", description: "Tomate, mozzarella y albahaca" },
          { name: "Prosciutto e Funghi", price: "$16.900", description: "Jamón, champiñones, mozzarella y orégano" }
        ]}
      ],
      photos: [
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f97316'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 1%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f97316'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 2%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f97316'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 3%3C/text%3E%3C/svg%3E"
      ]
    },
    {
      id: 2,
      name: "Sushi Master",
      rating: 4.6,
      reviews: 287,
      category: "Japonesa",
      priceLevel: "$$$",
      distance: "0.8 km",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%232563eb'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3ESushi%3C/text%3E%3C/svg%3E",
      tags: ["Sushi", "Sashimi", "Sake"],
      hours: "13:00 - 22:30",
      isOpen: true,
      isFavorite: false,
      address: "Isidora Goyenechea 2934, Las Condes",
      phone: "+56 2 2233 4455",
      website: "www.sushimaster.cl",
      description: "Sushi de alta calidad preparado por chefs japoneses con años de experiencia. Ingredientes frescos y técnicas tradicionales.",
      menu: [
        { category: "Entradas", items: [
          { name: "Edamame", price: "$5.900", description: "Vainas de soja con sal marina" },
          { name: "Gyoza", price: "$7.900", description: "Empanadillas japonesas rellenas de cerdo y verduras" }
        ]},
        { category: "Sushi", items: [
          { name: "Nigiri Mixto (8 pzs)", price: "$16.900", description: "Selección de nigiri con pescados variados" },
          { name: "Uramaki California", price: "$14.900", description: "Roll invertido con surimi, aguacate y pepino" }
        ]},
        { category: "Platos Calientes", items: [
          { name: "Yakisoba", price: "$17.900", description: "Fideos salteados con verduras y pollo" },
          { name: "Tempura Mixta", price: "$18.900", description: "Camarones y verduras en tempura" }
        ]}
      ],
      photos: [
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%232563eb'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 1%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%232563eb'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 2%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%232563eb'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 3%3C/text%3E%3C/svg%3E"
      ]
    },
    {
      id: 3,
      name: "El Asador Criollo",
      rating: 4.7,
      reviews: 352,
      category: "Parrilla",
      priceLevel: "$$",
      distance: "1.5 km",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23a16207'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EAsador%3C/text%3E%3C/svg%3E",
      tags: ["Carnes", "Parrilla", "Vino Tinto"],
      hours: "12:30 - 23:30",
      isOpen: true,
      isFavorite: true,
      address: "Av. Pedro de Valdivia 1520, Providencia",
      phone: "+56 2 2234 5678",
      website: "www.asadorcriollo.cl",
      description: "Las mejores carnes a la parrilla con el auténtico sabor de la tradición gaucha. Cortes premium y vinos seleccionados.",
      menu: [
        { category: "Entradas", items: [
          { name: "Provoleta", price: "$9.900", description: "Queso provolone a la parrilla con orégano y aceite de oliva" },
          { name: "Empanadas de Pino", price: "$7.900", description: "Empanadas tradicionales de carne, cebolla, huevo y aceitunas" }
        ]},
        { category: "Parrilla", items: [
          { name: "Bife de Chorizo (400g)", price: "$25.900", description: "Corte jugoso de lomo alto a la parrilla" },
          { name: "Entraña (350g)", price: "$23.900", description: "Corte tradicional argentino, tierno y sabroso" }
        ]},
        { category: "Acompañamientos", items: [
          { name: "Papas Fritas Rústicas", price: "$6.900", description: "Papas cortadas a mano con hierbas" },
          { name: "Ensalada Mixta", price: "$5.900", description: "Lechuga, tomate, cebolla y zanahoria" }
        ]}
      ],
      photos: [
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23a16207'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 1%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23a16207'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 2%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23a16207'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 3%3C/text%3E%3C/svg%3E"
      ]
    },
    {
      id: 4,
      name: "Sabor Peruano",
      rating: 4.9,
      reviews: 418,
      category: "Peruana",
      priceLevel: "$$$",
      distance: "2.1 km",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23059669'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EPeruano%3C/text%3E%3C/svg%3E",
      tags: ["Ceviche", "Pisco", "Mariscos"],
      hours: "13:00 - 22:00",
      isOpen: false,
      isFavorite: false,
      address: "Nueva Costanera 3451, Vitacura",
      phone: "+56 2 2233 4455",
      website: "www.saborperuano.cl",
      description: "Cocina peruana de autor con los sabores auténticos del Perú. Combinación perfecta de tradición e innovación culinaria.",
      menu: [
        { category: "Entradas", items: [
          { name: "Ceviche Clásico", price: "$14.900", description: "Pescado del día marinado en limón, cebolla morada, ají y cilantro" },
          { name: "Causa Limeña", price: "$12.900", description: "Pastel frío de papa amarilla relleno de pollo con mayonesa" }
        ]},
        { category: "Fondos", items: [
          { name: "Lomo Saltado", price: "$19.900", description: "Tiras de lomo salteadas con cebolla, tomate y papas fritas" },
          { name: "Ají de Gallina", price: "$17.900", description: "Guiso cremoso de pollo deshebrado con ají amarillo" }
        ]},
        { category: "Postres", items: [
          { name: "Suspiro Limeño", price: "$8.900", description: "Manjar blanco con merengue al oporto" },
          { name: "Picarones", price: "$7.900", description: "Donuts peruanos bañados en miel de chancaca" }
        ]}
      ],
      photos: [
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23059669'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 1%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23059669'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 2%3C/text%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23059669'/%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='20' text-anchor='middle' alignment-baseline='middle' fill='white'%3EFoto 3%3C/text%3E%3C/svg%3E"
      ]
    }
  ];

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const openRestaurantDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const RestaurantDetailView = ({ restaurant }) => {
    const [activeDetailTab, setActiveDetailTab] = useState("informacion");

    return (
      <div className="space-y-6">
        <div className="relative h-56 w-full overflow-hidden rounded-t-lg">
          <img 
            src={restaurant.image} 
            alt={restaurant.name} 
            className="h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold">{restaurant.name}</h2>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star 
                    key={index} 
                    className={`h-4 w-4 ${index < Math.floor(restaurant.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
                <span className="ml-1 text-sm">{restaurant.rating}</span>
              </div>
              <span className="mx-2">•</span>
              <span className="text-sm">{restaurant.reviews} reseñas</span>
              <span className="mx-2">•</span>
              <span className="text-sm">{restaurant.category}</span>
            </div>
          </div>
          <div className="absolute right-4 top-4 flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30">
              <Heart className={`h-4 w-4 ${restaurant.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="rounded-full">{tag}</Badge>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm">
              <Clock className="mr-1 h-4 w-4 text-gray-500" />
              <span>{restaurant.hours} • {restaurant.isOpen ? 'Abierto ahora' : 'Cerrado'}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="mr-1 h-4 w-4 text-gray-500" />
              <span>{restaurant.distance} de ti</span>
            </div>
          </div>

          <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="informacion" className="flex-1">Información</TabsTrigger>
              <TabsTrigger value="menu" className="flex-1">Menú</TabsTrigger>
              <TabsTrigger value="fotos" className="flex-1">Fotos</TabsTrigger>
              <TabsTrigger value="resenas" className="flex-1">Reseñas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informacion" className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Descripción</h3>
                <p className="text-sm text-gray-600">{restaurant.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Información de contacto</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{restaurant.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{restaurant.website}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Horario</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lunes</span>
                    <span>{restaurant.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Martes</span>
                    <span>{restaurant.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Miércoles</span>
                    <span>{restaurant.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jueves</span>
                    <span>{restaurant.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Viernes</span>
                    <span>{restaurant.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sábado</span>
                    <span>{restaurant.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Domingo</span>
                    <span>{restaurant.hours}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="menu" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {restaurant.menu.map((section, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="font-medium mb-3">{section.category}</h3>
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="border-b pb-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="font-medium">{item.price}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="fotos" className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {restaurant.photos.map((photo, index) => (
                  <img 
                    key={index} 
                    src={photo} 
                    alt={`${restaurant.name} photo ${index + 1}`} 
                    className="w-full h-48 object-cover rounded-md" 
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="resenas" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Reseñas de clientes</h3>
                  <Button variant="outline" size="sm">Escribir reseña</Button>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{`U${index + 1}`}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">Usuario {index + 1}</h4>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>Hace {index + 1} {index === 0 ? 'día' : 'días'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star 
                              key={starIndex} 
                              className={`h-4 w-4 ${starIndex < 5 - index ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {index === 0 
                          ? `Excelente lugar, la comida deliciosa y el servicio impecable. Definitivamente volveré pronto.` 
                          : index === 1 
                            ? `Buena experiencia en general. La comida estuvo bien, aunque algo cara para la porción. El ambiente es agradable.` 
                            : `La atención fue un poco lenta, pero la comida compensó la espera. Sabores auténticos y bien logrados.`
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="px-4 pb-4 pt-2">
          <Button className="w-full">Reservar mesa</Button>
        </div>
      </div>
    );
  };

  const Globe = ({ className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Descubre Santiago</h1>
        <p className="text-gray-500 mt-1">Explora los mejores lugares de la ciudad</p>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Buscar restaurantes, hoteles, actividades..." 
            className="pl-9 pr-4"
          />
        </div>
        <Button variant="outline" size="icon">
          <MapPin className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="mb-8" orientation="horizontal">
        <div className="flex space-x-2 pb-4 pt-1">
          {categories.map((category) => (
            <Button 
              key={category.id}
              variant={activeTab === category.id ? "default" : "outline"}
              className="flex items-center gap-2 rounded-full"
              onClick={() => setActiveTab(category.id)}
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <Tabs value={activeTab} defaultValue="restaurantes">
        <TabsContent value="restaurantes" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurantes.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name} 
                  className="h-full w-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <Badge 
                    variant="outline" 
                    className="bg-black/40 text-white border-none backdrop-blur-sm mb-1"
                  >
                    {restaurant.category}
                  </Badge>
                  <h3 className="font-bold text-lg">{restaurant.name}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle favorite logic would go here
                  }}
                >
                  <Heart className={`h-4 w-4 ${restaurant.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">{restaurant.rating}</span>
                      </div>
                      <span className="mx-1 text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{restaurant.reviews} reseñas</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <span>{restaurant.priceLevel}</span>
                      <span className="mx-1">•</span>
                      <span>{restaurant.distance}</span>
                    </div>
                  </div>
                  <Badge variant={restaurant.isOpen ? "success" : "destructive"} className="ml-auto">
                    {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-0 pb-4 px-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((_, index) => (
                    <Avatar key={index} className="border-2 border-white h-6 w-6">
                      <AvatarFallback className="text-xs">U{index+1}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="gap-1" 
                      onClick={() => openRestaurantDetails(restaurant)}
                    >
                      Ver detalles
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-0 overflow-hidden">
                    <RestaurantDetailView restaurant={restaurant} />
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>
      </Tabs>
    </div>
  );
}