import GameCard from '../components/cards/GameCard';

const meta = {
  title: 'Modules/GameCard',
  component: GameCard,
  tags: ['autodocs'],
  args: {
    title: 'ARC Raiders',
    genre: 'Extraction Shooter',
    releaseYear: 2026,
    platform: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1808500/header.jpg',
    status: 'In Progress',
    rating: 4
  },
  argTypes: {
    title: {control: 'text'},
    genre: {control: 'text'},
    releaseYear: {control: 'number'},
    platform: {control: 'object'},
    coverUrl: {control: 'text'},
    status: {
      control: 'radio',
      options: ['Not Started', 'In Progress', 'Completed']
    },
    rating: {
      control: {type: 'range', min: 0, max: 5, step: 1}
    }
  }
};

export default meta;

export const Default = {};

export const WithoutRating = {
  args: {
    rating: 0,
    status: 'Not Started'
  }
};
