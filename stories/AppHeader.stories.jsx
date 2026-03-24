import AppHeader from '../components/layout/AppHeader';

const meta = {
  title: 'Layout/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  args: {
    title: 'Game Collection Tracker',
    subtitle: 'Track what you play, what you finished, and how you rated each game.'
  },
  argTypes: {
    title: {control: 'text'},
    subtitle: {control: 'text'}
  }
};

export default meta;

export const Default = {};

export const French = {
  args: {
    title: 'Suivi de Collection de Jeux',
    subtitle: 'Suivez vos jeux, vos progres, et vos notes en un seul endroit.'
  }
};
