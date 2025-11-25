export interface ILibraryState {
  applicationStatus: 'approved' | 'pending' | 'rejected' | 'changes-required' | 'none';
  // Allow other properties from the library/registration documents
  [key: string]: any;
}