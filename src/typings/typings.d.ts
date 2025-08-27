// Patch Ionic input/searchbar typing conflicts
declare global {
  interface HTMLIonInputElement extends Components.IonInput, HTMLStencilElement {
    autocorrect: string | undefined;
  }

  interface HTMLIonSearchbarElement extends Components.IonSearchbar, HTMLStencilElement {
    autocorrect: string | undefined;
  }
}
