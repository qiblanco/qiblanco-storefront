import {AnmeldeWeiche} from './Anmeldeweiche';

// Anmeldeformular auf Kurs- und Aktionsseiten, fest auf dem eigenen Weg
// (AC-Abschluss, Elina EL-20261103-b633cb45, Punkt 5). Löst
// ActiveCampaignForm.jsx ab: das ActiveCampaign-Embed gibt es nicht mehr.
// Satz, Knopf und Kennung kommen aus /w (Begründung in Anmeldeweiche.jsx).
export function Anmeldeformular({formId}) {
  return <AnmeldeWeiche formId={String(formId)} />;
}
