export interface LibraryRegistrationRequest {}

export interface BookCategory {
  name: string;
  selected: boolean;
}

export interface IRegistrationStep {
  color: string;
  description: string;
  icon: string;
  id: number;
  title: string;
}

export interface IFeatureCard {
  color: string;
  description: string;
  icon: string;
  id: number;
  title: string;
}
