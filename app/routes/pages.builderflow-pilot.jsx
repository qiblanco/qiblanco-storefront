import {LpBuilderflowPilot} from '~/components/landingpages/LpBuilderflowPilot';

export const meta = () => {
  return [
    {title: 'builderflow-pilot | Qi Blanco'},
    {name: 'description', content: 'Landingpage builderflow-pilot (Design-Brief aus design-bibliothek).'},
    {name: 'robots', content: 'noindex,nofollow'},
  ];
};

export default function LpBuilderflowPilotPage() {
  return <LpBuilderflowPilot />;
}
