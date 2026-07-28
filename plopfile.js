export default function plop(/** @type {import('plop').NodePlopAPI} */ plop) {
  // Feature generator
  plop.setGenerator('feature', {
    description: 'Create a new feature module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (kebab-case):',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: 'src/features/{{name}}',
        base: 'plop-templates/feature',
        templateFiles: 'plop-templates/feature/*.hbs',
      },
    ],
  });

  // Component generator
  plop.setGenerator('component', {
    description: 'Create a new component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (PascalCase):',
      },
      {
        type: 'select',
        name: 'type',
        message: 'Component type:',
        choices: ['ui', 'shared', 'feature'],
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: 'src/components/{{type}}',
        base: 'plop-templates/component',
        templateFiles: 'plop-templates/component/*.hbs',
      },
    ],
  });
}
