import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [

  {
    title: 'Teclado',
    icon: 'nb-home',
    target: 'hello',
    link: '/pages/editor-teclado',
    home: true,
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
    title: 'Dashboard',
    icon: 'nb-home',
    link: '/pages/dashboard',
  },
  {
    title: 'Configuração',
    icon: 'nb-gear',
    target: 'config'
    },
  {
    title: 'Gerenciar Perfil',
    icon: 'nb-person',
    link: '/pages/profile'
  }
];
