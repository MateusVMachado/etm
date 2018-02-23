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
    target: 'hello',
    link: '/pages/editor-teclado',
          ////////////////////////////
         // TORNAR DINÂMICO !!! /////
        ////////////////////////////
    children: [
      {
        title: 'pt-br',
        target: 'pt-br'
      },
      {
        title: 'userDefined-01',
        target: 'user'
      },
      {
        title: 'experimental',
        target: 'exp'
      }
    ]
  },
  {
    title: 'Configuração',
    icon: 'nb-gear',
    target: 'config'
  }
];
