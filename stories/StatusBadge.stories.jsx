import StatusBadge from '../components/ui/StatusBadge';

const meta = {
  title: 'Primitive/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: {
    status: 'Not Started'
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['Not Started', 'In Progress', 'Completed']
    }
  }
};

export default meta;

export const Default = {};

export const InProgress = {
  args: {
    status: 'In Progress'
  }
};

export const Completed = {
  args: {
    status: 'Completed'
  }
};
