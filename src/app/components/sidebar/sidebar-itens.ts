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
    link: '/pages/teclado'
  },
  {
    title: 'Configuração',
    icon: 'nb-gear',
    // link: '/pages/teclado',
    children: [
    {
        title: 'pt-br',
        link: '/pages/ui-features/buttons',
    },
    {
      title: 'en-us',
      link: '/pages/ui-features/buttons',
    },
    {
      title: 'user-defined-01',
      link: '/pages/teclados:title',
    }
    ]

  }
];
