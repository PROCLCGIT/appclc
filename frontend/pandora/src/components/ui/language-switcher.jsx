// src/components/ui/language-switcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CheckIcon, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'es', name: 'Español', icon: '🇪🇸' },
  { code: 'en', name: 'English', icon: '🇺🇸' }
];

/**
 * Componente para cambiar el idioma de la aplicación
 * Muestra un icono de globo y permite seleccionar entre los idiomas disponibles
 */
export function LanguageSwitcher({ className }) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'es';
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Guardar preferencia en localStorage
    localStorage.setItem('i18nextLng', lng);
  };
  
  // Encontrar el idioma actual para mostrar en el botón
  const current = languages.find(lang => lang.code === currentLanguage) 
    || languages[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn('h-9 w-9 rounded-full', className)}
          aria-label="Cambiar idioma"
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Seleccionar idioma</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              language.code === currentLanguage ? 'bg-accent' : ''
            )}
          >
            <span>{language.icon}</span>
            <span>{language.name}</span>
            {language.code === currentLanguage && (
              <CheckIcon className="h-4 w-4 ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;