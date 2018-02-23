import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'nb-home',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'Teclado',
    icon: 'nb-home',
    link: '/pages/editor-teclado'
  },
  {
    title: 'Configuração',
    icon: 'nb-gear',
    target: 'config'
  }
];
