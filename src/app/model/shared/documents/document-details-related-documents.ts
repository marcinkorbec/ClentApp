import { b2bDocuments } from 'src/integration/shared/b2b-documents';

export interface DocumentDetailsRelatedDocuments {

    relatedDocuments: b2bDocuments.DocumentReference[];
    relatedDocumentLinkCreator(doc: b2bDocuments.DocumentReference): string[];
    relatedDocumentTranslationKey(): string;
}
